import {
    SupabaseClientService,
} from "./SupabaseClientService.js";

const PROJECT_ID_KEY =
    "disponibilidade-supabase-project-id";

export class SupabasePersistenceService {
    constructor() {
        this.client = null;
        this.projectId = null;
        this.ready = false;
        this.writeQueue = Promise.resolve();
    }

    async initialize({
        projectConfig,
        units,
        folderCatalog,
    }) {
        if (!SupabaseClientService.isConfigured()) {
            return null;
        }

        this.client =
            SupabaseClientService.getClient();

        const {
            data: { session },
            error: sessionError,
        } = await this.client.auth.getSession();

        if (sessionError) {
            throw sessionError;
        }

        if (!session?.user) {
            return null;
        }

        const existingProject =
            await this.findProject();

        if (existingProject) {
            this.projectId = existingProject.id;
            this.ready = true;
            this.storeProjectId(existingProject.id);

            return this.loadSnapshot(
                existingProject
            );
        }

        const createdProject =
            await this.createProject(
                session.user.id,
                projectConfig
            );

        this.projectId = createdProject.id;
        this.ready = true;
        this.storeProjectId(createdProject.id);

        await this.saveUnits(units);
        await this.saveFolderCatalog(
            folderCatalog
        );

        return {
            projectConfig:
                createdProject.config,
            units:
                units.map((unit) =>
                    SupabasePersistenceService.serialize(
                        unit
                    )
                ),
            folderCatalog:
                [...folderCatalog],
        };
    }

    async findProject() {
        const storedProjectId =
            localStorage.getItem(
                PROJECT_ID_KEY
            );

        if (storedProjectId) {
            const { data, error } =
                await this.client
                    .from("projects")
                    .select("id, name, config")
                    .eq("id", storedProjectId)
                    .maybeSingle();

            if (error) {
                throw error;
            }

            if (data) {
                return data;
            }

            localStorage.removeItem(
                PROJECT_ID_KEY
            );
        }

        const { data, error } =
            await this.client
                .from("projects")
                .select("id, name, config")
                .order("created_at", {
                    ascending: true,
                })
                .limit(1)
                .maybeSingle();

        if (error) {
            throw error;
        }

        return data;
    }

    async createProject(
        userId,
        projectConfig
    ) {
        const config =
            SupabasePersistenceService.serialize(
                projectConfig
            );

        const { data, error } =
            await this.client
                .from("projects")
                .insert({
                    name:
                        projectConfig.projectName,
                    config,
                    created_by:
                        userId,
                })
                .select("id, name, config")
                .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async loadSnapshot(project) {
        const [
            unitsResult,
            catalogResult,
        ] = await Promise.all([
            this.client
                .from("units")
                .select("data")
                .eq(
                    "project_id",
                    project.id
                ),
            this.client
                .from("folder_catalog")
                .select("data")
                .eq(
                    "project_id",
                    project.id
                ),
        ]);

        if (unitsResult.error) {
            throw unitsResult.error;
        }

        if (catalogResult.error) {
            throw catalogResult.error;
        }

        return {
            projectConfig:
                project.config,
            units:
                unitsResult.data.map(
                    (row) => row.data
                ),
            folderCatalog:
                catalogResult.data.map(
                    (row) => row.data
                ),
        };
    }

    saveProjectConfig(projectConfig) {
        return this.enqueue(async () => {
            const { error } =
                await this.client
                    .from("projects")
                    .update({
                        name:
                            projectConfig.projectName,
                        config:
                            SupabasePersistenceService.serialize(
                                projectConfig
                            ),
                    })
                    .eq("id", this.projectId);

            if (error) {
                throw error;
            }
        });
    }

    saveUnits(units) {
        return this.enqueue(async () => {
            const rows = units.map(
                (unit) => {
                    const data =
                        SupabasePersistenceService.serialize(
                            unit
                        );

                    return {
                        project_id:
                            this.projectId,
                        unit_id:
                            data.id,
                        data,
                    };
                }
            );

            await this.replaceCollection({
                table: "units",
                idColumn: "unit_id",
                rows,
            });
        });
    }

    saveFolderCatalog(records) {
        return this.enqueue(async () => {
            const rows = records.map(
                (record) => ({
                    project_id:
                        this.projectId,
                    folder_number:
                        String(
                            record.folderNumber
                        ).trim(),
                    data:
                        SupabasePersistenceService.serialize(
                            record
                        ),
                })
            );

            await this.replaceCollection({
                table: "folder_catalog",
                idColumn: "folder_number",
                rows,
            });
        });
    }

    async replaceCollection({
        table,
        idColumn,
        rows,
    }) {
        const { data: existingRows, error } =
            await this.client
                .from(table)
                .select(idColumn)
                .eq(
                    "project_id",
                    this.projectId
                );

        if (error) {
            throw error;
        }

        const nextIds =
            new Set(
                rows.map(
                    (row) => row[idColumn]
                )
            );

        const removedIds =
            existingRows
                .map(
                    (row) => row[idColumn]
                )
                .filter(
                    (id) => !nextIds.has(id)
                );

        if (removedIds.length) {
            const { error: deleteError } =
                await this.client
                    .from(table)
                    .delete()
                    .eq(
                        "project_id",
                        this.projectId
                    )
                    .in(
                        idColumn,
                        removedIds
                    );

            if (deleteError) {
                throw deleteError;
            }
        }

        if (!rows.length) {
            return;
        }

        const { error: upsertError } =
            await this.client
                .from(table)
                .upsert(rows, {
                    onConflict:
                        `project_id,${idColumn}`,
                });

        if (upsertError) {
            throw upsertError;
        }
    }

    enqueue(operation) {
        if (!this.ready) {
            return Promise.resolve(false);
        }

        this.writeQueue =
            this.writeQueue
                .then(operation)
                .then(() => true)
                .catch((error) => {
                    console.error(
                        "Falha na sincronização com o Supabase:",
                        error
                    );

                    return false;
                });

        return this.writeQueue;
    }

    getProjectId() {
        return this.projectId;
    }

    storeProjectId(projectId) {
        localStorage.setItem(
            PROJECT_ID_KEY,
            projectId
        );
    }

    static serialize(value) {
        if (
            value &&
            typeof value.toJSON ===
                "function"
        ) {
            return value.toJSON();
        }

        return JSON.parse(
            JSON.stringify(value)
        );
    }
}
