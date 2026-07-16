import {
    SupabaseClientService,
} from "./SupabaseClientService.js";

export class PublicMapService {
    constructor() {
        this.client =
            SupabaseClientService.getClient();
    }

    async publish({
        projectId,
        snapshot,
    }) {
        if (!projectId) {
            throw new Error(
                "O empreendimento ainda não está sincronizado com o Supabase."
            );
        }

        const {
            data: { session },
            error: sessionError,
        } = await this.client.auth.getSession();

        if (sessionError) {
            throw sessionError;
        }

        if (!session?.user) {
            throw new Error(
                "É necessário entrar novamente para publicar o mapa."
            );
        }

        const { data: existingMap, error: selectError } =
            await this.client
                .from("public_maps")
                .select("id, slug")
                .eq("project_id", projectId)
                .eq("is_active", true)
                .order("updated_at", {
                    ascending: false,
                })
                .limit(1)
                .maybeSingle();

        if (selectError) {
            throw selectError;
        }

        if (existingMap) {
            const { data, error } =
                await this.client
                    .from("public_maps")
                    .update({
                        snapshot,
                        published_by:
                            session.user.id,
                    })
                    .eq("id", existingMap.id)
                    .select("slug")
                    .single();

            if (error) {
                throw error;
            }

            return data.slug;
        }

        const { data, error } =
            await this.client
                .from("public_maps")
                .insert({
                    project_id:
                        projectId,
                    snapshot,
                    published_by:
                        session.user.id,
                })
                .select("slug")
                .single();

        if (error) {
            throw error;
        }

        return data.slug;
    }

    async load(slug) {
        const { data, error } =
            await this.client
                .from("public_maps")
                .select("snapshot, updated_at")
                .eq("slug", slug)
                .eq("is_active", true)
                .maybeSingle();

        if (error) {
            throw error;
        }

        return data;
    }

    async syncIfPublished({
        projectId,
        snapshot,
    }) {
        if (!projectId) {
            return false;
        }

        const {
            data: { session },
            error: sessionError,
        } = await this.client.auth.getSession();

        if (sessionError) {
            throw sessionError;
        }

        if (!session?.user) {
            return false;
        }

        const { data: existingMap, error: selectError } =
            await this.client
                .from("public_maps")
                .select("id")
                .eq("project_id", projectId)
                .eq("is_active", true)
                .order("updated_at", {
                    ascending: false,
                })
                .limit(1)
                .maybeSingle();

        if (selectError) {
            throw selectError;
        }

        if (!existingMap) {
            return false;
        }

        const { error } =
            await this.client
                .from("public_maps")
                .update({
                    snapshot,
                    published_by:
                        session.user.id,
                })
                .eq("id", existingMap.id);

        if (error) {
            throw error;
        }

        return true;
    }

    subscribe(slug, onChange) {
        if (
            !slug ||
            typeof onChange !== "function"
        ) {
            return () => {};
        }

        const channel =
            this.client
                .channel(
                    `public-map:${slug}`
                )
                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "public_maps",
                        filter:
                            `slug=eq.${slug}`,
                    },
                    () => {
                        void onChange();
                    }
                )
                .subscribe();

        return () => {
            void this.client
                .removeChannel(channel);
        };
    }

    static createSnapshot({
        projectConfig,
        units,
        statuses,
        channels,
    }) {
        return {
            version: 2,
            publishedAt:
                new Date().toISOString(),
            display: {
                pageCount:
                    Number(
                        projectConfig
                            .publicMapSettings
                            ?.pageCount ?? 1
                    ),
                rotationSeconds:
                    Number(
                        projectConfig
                            .publicMapSettings
                            ?.rotationSeconds ?? 15
                    ),
            },
            blocks:
                projectConfig.blocks.map(
                    (block) => ({
                        id:
                            String(block.id),
                        name:
                            String(block.name),
                        floors:
                            Number(block.floors),
                        columns:
                            Number(block.columns),
                        excludedCells:
                            block.excludedCells.map(
                                (cell) => ({
                                    floor:
                                        Number(cell.floor),
                                    column:
                                        Number(cell.column),
                                })
                            ),
                    })
                ),
            units:
                units.map((unit) => ({
                    id:
                        String(unit.id),
                    displayCode:
                        String(unit.displayCode),
                    blockId:
                        String(unit.blockId),
                    anchorFloor:
                        Number(unit.anchorFloor),
                    anchorColumn:
                        Number(unit.anchorColumn),
                    columnSpan:
                        Number(unit.columnSpan),
                    rowSpan:
                        Number(unit.rowSpan),
                    status:
                        String(unit.status),
                    channel:
                        unit.channel
                            ? String(unit.channel)
                            : "",
                })),
            statuses:
                statuses.map((status) => ({
                    value:
                        String(status.value),
                    label:
                        String(status.label),
                    color:
                        PublicMapService.normalizeColor(
                            status.color,
                            "#DCDCDC"
                        ),
                    textColor:
                        PublicMapService.normalizeColor(
                            status.textColor,
                            "#0F172A"
                        ),
                })),
            channels:
                channels.map((channel) => ({
                    value:
                        String(channel.value),
                    shortLabel:
                        String(channel.shortLabel),
                    color:
                        PublicMapService.normalizeColor(
                            channel.color,
                            "#94A3B8"
                        ),
                })),
        };
    }

    static createPublicUrl(slug) {
        const url =
            new URL(
                "./public.html",
                window.location.href
            );

        url.searchParams.set(
            "map",
            slug
        );

        return url.toString();
    }

    static normalizeColor(
        value,
        fallback
    ) {
        const color =
            String(value ?? "").trim();

        return /^#[0-9a-f]{6}$/i.test(color)
            ? color.toUpperCase()
            : fallback;
    }
}
