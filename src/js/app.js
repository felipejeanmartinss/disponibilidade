import {
    APP_CONFIG,
} from "./config/constants.js";

import {
    APP_MODE,
    APP_MODE_OPTIONS,
} from "./config/appModes.js";

import {
    SALES_CHANNEL_OPTIONS,
} from "./config/channels.js";

import {
    UNIT_STATUS_OPTIONS,
} from "./config/statuses.js";

import {
    createDefaultProjectConfig,
} from "../data/defaultProject.js";

import {
    Unit,
} from "./models/Unit.js";

import {
    ProjectConfig,
} from "./models/ProjectConfig.js";

import {
    LocalStorageService,
} from "./services/LocalStorageService.js";

import {
    ProjectConfigService,
} from "./services/ProjectConfigService.js";

import {
    AppearanceService,
} from "./services/AppearanceService.js";

import {
    FolderCatalogService,
} from "./services/FolderCatalogService.js";

import {
    SupabaseClientService,
} from "./services/SupabaseClientService.js";

import {
    SupabasePersistenceService,
} from "./services/SupabasePersistenceService.js";

import {
    AuthService,
} from "./services/AuthService.js";

import {
    PublicMapService,
} from "./services/PublicMapService.js";

import {
    UnitFactory,
} from "./factories/UnitFactory.js";

import {
    AppView,
} from "./views/AppView.js";

import {
    AuthView,
} from "./views/AuthView.js";

import {
    AuthController,
} from "./controllers/AuthController.js";

import {
    AppModeController,
} from "./controllers/AppModeController.js";

import {
    MatrixEditorController,
} from "./controllers/MatrixEditorController.js";

import {
    UnitController,
} from "./controllers/UnitController.js";

import {
    OperationController,
} from "./controllers/OperationController.js";

import {
    AppearanceController,
} from "./controllers/AppearanceController.js";

import {
    ExecutiveController,
} from "./controllers/ExecutiveController.js";

import {
    FolderImportController,
} from "./controllers/FolderImportController.js";

function createUnitsFromStoredData(
    storedUnits
) {
    if (!Array.isArray(storedUnits)) {
        return [];
    }

    try {
        return storedUnits.map(
            (unitData) =>
                new Unit(unitData)
        );
    } catch (error) {
        console.warn(
            "Os dados operacionais salvos são inválidos:",
            error
        );

        LocalStorageService.clear();

        return [];
    }
}

function applyStoredOperationalData(
    generatedUnits,
    storedUnits
) {
    const storedUnitsById =
        new Map(
            storedUnits.map(
                (unit) => [
                    unit.id,
                    unit,
                ]
            )
        );

    generatedUnits.forEach(
        (generatedUnit) => {
            const storedUnit =
                storedUnitsById.get(
                    generatedUnit.id
                );

            if (!storedUnit) {
                return;
            }

            generatedUnit.update({
                block:
                    generatedUnit.block,

                status:
                    storedUnit.status,

                channel:
                    storedUnit.channel,

                partner:
                    storedUnit.partner,

                superintendent:
                    storedUnit.superintendent,

                director:
                    storedUnit.director,

                partnerManager:
                    storedUnit.partnerManager,

                coordinator:
                    storedUnit.coordinator,

                manager:
                    storedUnit.manager,

                broker:
                    storedUnit.broker,

                folder:
                    storedUnit.folder,

                conditionalClients:
                    storedUnit.conditionalClients,

                notes:
                    storedUnit.notes,
            });

            generatedUnit.statusChangedAt =
                storedUnit.statusChangedAt;
        }
    );

    return generatedUnits;
}

function createUnitsFromConfiguration(
    projectConfig,
    storedUnitData =
        LocalStorageService.load()
) {
    const generatedUnits =
        UnitFactory
            .createFromProjectConfig(
                projectConfig
            );

    const storedUnits =
        createUnitsFromStoredData(
            storedUnitData
        );

    return applyStoredOperationalData(
        generatedUnits,
        storedUnits
    );
}

function replaceUnits(
    currentUnits,
    newUnits
) {
    currentUnits.splice(
        0,
        currentUnits.length,
        ...newUnits
    );
}

async function bootstrap() {
    const rootElement =
        document.getElementById(
            "app"
        );

    if (!rootElement) {
        throw new Error(
            'O elemento principal com id "app" não foi encontrado.'
        );
    }

    if (SupabaseClientService.isConfigured()) {
        try {
            SupabaseClientService.getClient();
            console.info("Cliente Supabase inicializado.");
        } catch (error) {
            console.warn("Supabase indisponível; mantendo persistência local.", error);
        }
    }

    const authView =
        new AuthView(rootElement);

    let authService;

    try {
        authService =
            new AuthService();
    } catch (error) {
        console.error(
            "Serviço de autenticação indisponível:",
            error
        );

        authView.renderLogin({
            appName:
                APP_CONFIG.name,
            errorMessage:
                "O serviço de autenticação não foi carregado. Atualize a página e tente novamente.",
        });

        return;
    }

    const authController =
        new AuthController({
            rootElement,
            authService,
        });

    authController.init();

    let session;

    try {
        session =
            await authService.getSession();
    } catch (error) {
        console.error(
            "Não foi possível consultar a sessão:",
            error
        );

        authView.renderLogin({
            appName:
                APP_CONFIG.name,
            errorMessage:
                "Não foi possível validar sua sessão. Tente novamente.",
        });

        return;
    }

    if (!session) {
        authView.renderLogin({
            appName:
                APP_CONFIG.name,
        });

        return;
    }

    const currentUser =
        AuthService.createUserProfile(
            session
        );

    const defaultProjectConfig =
        createDefaultProjectConfig();

    let projectConfig =
        ProjectConfigService.load(
            defaultProjectConfig
        );

    let storedUnitData =
        LocalStorageService.load();

    const localUnits =
        createUnitsFromConfiguration(
            projectConfig,
            storedUnitData
        );

    const persistenceService =
        new SupabasePersistenceService();

    const publicMapService =
        new PublicMapService();

    try {
        const remoteSnapshot =
            await persistenceService.initialize({
                projectConfig,
                units:
                    localUnits,
                folderCatalog:
                    FolderCatalogService.load(),
            });

        if (remoteSnapshot) {
            projectConfig =
                new ProjectConfig(
                    remoteSnapshot.projectConfig
                );

            storedUnitData =
                remoteSnapshot.units;

            ProjectConfigService.save(
                projectConfig
            );

            LocalStorageService.save(
                storedUnitData
            );

            FolderCatalogService.save(
                remoteSnapshot.folderCatalog,
                {
                    synchronize: false,
                }
            );

            console.info(
                "Dados carregados do Supabase."
            );
        }
    } catch (error) {
        console.warn(
            "Não foi possível carregar os dados remotos; mantendo a cópia local.",
            error
        );
    }

    const units =
        createUnitsFromConfiguration(
            projectConfig,
            storedUnitData
        );

    FolderCatalogService.setSyncHandler(
        (records) =>
            persistenceService
                .saveFolderCatalog(
                    records
                )
    );

    const state = {
        activeMode:
            APP_MODE.OPERATION,
    };

    const appView =
        new AppView(
            rootElement
        );

    let operationController = null;
    let executiveController = null;

    const renderApplication =
        () => {
            AppearanceService.applyToDocument(
                projectConfig.appearance
            );

            const displayChannels =
                AppearanceService.createDisplayChannels(
                    SALES_CHANNEL_OPTIONS,
                    projectConfig.appearance
                );

            const displayStatuses =
                AppearanceService.createDisplayStatuses(
                    UNIT_STATUS_OPTIONS,
                    projectConfig.appearance
                );

            appView.render({
                config:
                    APP_CONFIG,

                channels:
                    displayChannels,

                statuses:
                    displayStatuses,

                units,

                modeOptions:
                    APP_MODE_OPTIONS,

                activeMode:
                    state.activeMode,

                projectConfig,

                user:
                    currentUser,
            });

            operationController?.restoreState();
            executiveController?.restoreState();
        };

    const saveAppearanceAndRender =
        () => {
            ProjectConfigService.save(
                projectConfig
            );

            void persistenceService
                .saveProjectConfig(
                    projectConfig
                );

            renderApplication();
        };

    const saveUnitsAndRender =
        () => {
            LocalStorageService.save(
                units
            );

            void persistenceService
                .saveUnits(units);

            renderApplication();
        };

    const saveConfigurationAndRender =
        () => {
            ProjectConfigService.save(
                projectConfig
            );

            void persistenceService
                .saveProjectConfig(
                    projectConfig
                );

            const regeneratedUnits =
                createUnitsFromConfiguration(
                    projectConfig
                );

            replaceUnits(
                units,
                regeneratedUnits
            );

            LocalStorageService.save(
                units
            );

            void persistenceService
                .saveUnits(units);

            renderApplication();
        };

    renderApplication();

    const matrixEditorController =
        new MatrixEditorController({
            rootElement,
            projectConfig,

            onConfigChange:
                saveConfigurationAndRender,
        });

    matrixEditorController.init();

    const appearanceController =
        new AppearanceController({
            rootElement,
            projectConfig,
            onAppearanceChange:
                saveAppearanceAndRender,
        });

    appearanceController.init();

    const appModeController =
        new AppModeController({
            rootElement,

            onModeChange:
                (selectedMode) => {
                    matrixEditorController
                        .reset();

                    state.activeMode =
                        selectedMode;

                    renderApplication();
                },
        });

    appModeController.init();

    const unitController =
        new UnitController({
            rootElement,
            units,

            onUnitsChange:
                saveUnitsAndRender,
        });

    unitController.init();

    operationController =
        new OperationController({
            rootElement,

            onPublishPublicMap:
                async () => {
                    const channels =
                        AppearanceService.createDisplayChannels(
                            SALES_CHANNEL_OPTIONS,
                            projectConfig.appearance
                        );

                    const statuses =
                        AppearanceService.createDisplayStatuses(
                            UNIT_STATUS_OPTIONS,
                            projectConfig.appearance
                        );

                    const snapshot =
                        PublicMapService.createSnapshot({
                            projectConfig,
                            units,
                            channels,
                            statuses,
                        });

                    const slug =
                        await publicMapService.publish({
                            projectId:
                                persistenceService.getProjectId(),
                            snapshot,
                        });

                    return PublicMapService.createPublicUrl(
                        slug
                    );
                },
        });

    operationController.init();

    executiveController =
        new ExecutiveController({
            rootElement,
            units,
        });

    executiveController.init();

    const folderImportController =
        new FolderImportController({
            rootElement,
            getChannels: () =>
                AppearanceService.createDisplayChannels(
                    SALES_CHANNEL_OPTIONS,
                    projectConfig.appearance
                ),
        });

    folderImportController.init();

    console.info(
        `${APP_CONFIG.name} v${APP_CONFIG.version} iniciado com sucesso.`
    );

    console.info(
        `Empreendimento: ${projectConfig.projectName}.`
    );

    console.info(
        `Unidades geradas: ${units.length}.`
    );
}

try {
    await bootstrap();
} catch (error) {
    console.error(
        "Falha ao iniciar a aplicação:",
        error
    );

    document.body.innerHTML = `
        <main>
            <h1>
                Não foi possível iniciar o sistema.
            </h1>

            <p>
                Abra o console do navegador
                para consultar os detalhes.
            </p>
        </main>
    `;
}
