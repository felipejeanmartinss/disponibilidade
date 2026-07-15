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
    createDefaultProjectConfig,
} from "../data/defaultProject.js";

import {
    Unit,
} from "./models/Unit.js";

import {
    LocalStorageService,
} from "./services/LocalStorageService.js";

import {
    ProjectConfigService,
} from "./services/ProjectConfigService.js";

import {
    UnitFactory,
} from "./factories/UnitFactory.js";

import {
    AppView,
} from "./views/AppView.js";

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
    projectConfig
) {
    const generatedUnits =
        UnitFactory
            .createFromProjectConfig(
                projectConfig
            );

    const storedUnits =
        createUnitsFromStoredData(
            LocalStorageService.load()
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

function bootstrap() {
    const rootElement =
        document.getElementById(
            "app"
        );

    if (!rootElement) {
        throw new Error(
            'O elemento principal com id "app" não foi encontrado.'
        );
    }

    const defaultProjectConfig =
        createDefaultProjectConfig();

    const projectConfig =
        ProjectConfigService.load(
            defaultProjectConfig
        );

    const units =
        createUnitsFromConfiguration(
            projectConfig
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

    const renderApplication =
        () => {
            appView.render({
                config:
                    APP_CONFIG,

                channels:
                    SALES_CHANNEL_OPTIONS,

                units,

                modeOptions:
                    APP_MODE_OPTIONS,

                activeMode:
                    state.activeMode,

                projectConfig,
            });

            operationController?.restoreState();
        };

    const saveUnitsAndRender =
        () => {
            LocalStorageService.save(
                units
            );

            renderApplication();
        };

    const saveConfigurationAndRender =
        () => {
            ProjectConfigService.save(
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
        });

    operationController.init();

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
    bootstrap();
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
