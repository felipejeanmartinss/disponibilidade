import {
    APP_CONFIG,
} from "./config/constants.js";

import {
    SALES_CHANNEL_OPTIONS,
} from "./config/channels.js";

import {
    createMockUnits,
} from "../data/mockUnits.js";

import {
    Unit,
} from "./models/Unit.js";

import {
    LocalStorageService,
} from "./services/LocalStorageService.js";

import {
    AppView,
} from "./views/AppView.js";

import {
    UnitController,
} from "./controllers/UnitController.js";

function createUnitsFromStoredData(
    storedUnits
) {
    if (!Array.isArray(storedUnits)) {
        return null;
    }

    try {
        return storedUnits.map(
            (unitData) =>
                new Unit(unitData)
        );
    } catch (error) {
        console.warn(
            "Os dados salvos são inválidos e serão ignorados:",
            error
        );

        LocalStorageService.clear();

        return null;
    }
}

function loadInitialUnits() {
    const storedData =
        LocalStorageService.load();

    const storedUnits =
        createUnitsFromStoredData(
            storedData
        );

    if (storedUnits) {
        console.info(
            "Unidades carregadas do armazenamento local."
        );

        return storedUnits;
    }

    console.info(
        "Dados simulados carregados."
    );

    return createMockUnits();
}

function bootstrap() {
    const rootElement =
        document.getElementById("app");

    if (!rootElement) {
        throw new Error(
            'O elemento principal com id "app" não foi encontrado.'
        );
    }

    const units =
        loadInitialUnits();

    const appView =
        new AppView(rootElement);

    const renderApplication = () => {
        appView.render(
            APP_CONFIG,
            SALES_CHANNEL_OPTIONS,
            units
        );
    };

    const saveAndRenderApplication =
        () => {
            LocalStorageService.save(
                units
            );

            renderApplication();
        };

    renderApplication();

    const unitController =
        new UnitController({
            rootElement,
            units,

            onUnitsChange:
                saveAndRenderApplication,
        });

    unitController.init();

    console.info(
        `${APP_CONFIG.name} v${APP_CONFIG.version} iniciado com sucesso.`
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