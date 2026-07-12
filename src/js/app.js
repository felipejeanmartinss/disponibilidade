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
    AppView,
} from "./views/AppView.js";

import {
    UnitController,
} from "./controllers/UnitController.js";

function bootstrap() {
    const rootElement =
        document.getElementById("app");

    if (!rootElement) {
        throw new Error(
            'O elemento principal com id "app" não foi encontrado.'
        );
    }

    const units =
        createMockUnits();

    const appView =
        new AppView(rootElement);

    const renderApplication = () => {
        appView.render(
            APP_CONFIG,
            SALES_CHANNEL_OPTIONS,
            units
        );
    };

    renderApplication();

    const unitController =
        new UnitController({
            rootElement,
            units,
            onUnitsChange:
                renderApplication,
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
