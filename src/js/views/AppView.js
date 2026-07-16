import {
    APP_MODE,
} from "../config/appModes.js";

import {
    AppNavigationView,
} from "./AppNavigationView.js";

import {
    ConfigurationView,
} from "./ConfigurationView.js";

import {
    ExecutiveView,
} from "./ExecutiveView.js";

import {
    OperationView,
} from "./OperationView.js";

import {
    UnitModalView,
} from "./UnitModalView.js";

export class AppView {
    constructor(rootElement) {
        if (
            !(
                rootElement instanceof
                HTMLElement
            )
        ) {
            throw new Error(
                "AppView precisa receber um elemento HTML válido."
            );
        }

        this.rootElement =
            rootElement;
    }

    render({
        config,
        channels,
        statuses,
        units,
        modeOptions,
        activeMode,
        projectConfig,
    }) {
        const navigation =
            AppNavigationView.render(
                modeOptions,
                activeMode
            );

        const modeContent =
            this.renderModeContent({
                activeMode,
                channels,
                statuses,
                units,
                projectConfig,
            });

        this.rootElement.innerHTML = `
            <div class="app-shell">
                <header class="app-header">
                    <div
                        class="
                            app-container
                            app-header__content
                        "
                    >
                        <div class="app-brand">
                            <div
                                class="app-brand__symbol"
                                aria-hidden="true"
                            >
                                D
                            </div>

                            <div class="app-brand__text">
                                <p class="app-brand__eyebrow">
                                    Painel comercial
                                </p>

                                <h1 class="app-brand__title">
                                    ${config.name}
                                </h1>
                            </div>
                        </div>

                        <div class="app-header__context">
                            <div class="project-context">
                                <span class="project-context__label">
                                    Empreendimento
                                </span>

                                <strong class="project-context__name">
                                    ${projectConfig.projectName}
                                </strong>
                            </div>

                            ${navigation}
                        </div>
                    </div>
                </header>

                <main class="app-workspace">
                    <div class="app-container">
                        ${modeContent}
                    </div>
                </main>

                <footer class="app-footer">
                    <div
                        class="
                            app-container
                            app-footer__content
                        "
                    >
                        <p class="app-footer__text">
                            ${config.name}
                            •
                            Versão ${config.version}
                        </p>

                        <span class="system-status">
                            Sistema online
                        </span>
                    </div>
                </footer>

                ${UnitModalView.render(channels, statuses)}
            </div>
        `;
    }

    renderModeContent({
        activeMode,
        channels,
        statuses,
        units,
        projectConfig,
    }) {
        switch (activeMode) {
            case APP_MODE.CONFIGURATION:
                return (
                    ConfigurationView.render({
                        projectConfig,
                        channels,
                        statuses,
                    })
                );

            case APP_MODE.EXECUTIVE:
                return (
                    ExecutiveView.render({
                        channels,
                        statuses,
                        units,
                        projectConfig,
                    })
                );

            case APP_MODE.OPERATION:
            default:
                return (
                    OperationView.render({
                        channels,
                        statuses,
                        units,
                        projectConfig,
                    })
                );
        }
    }
}
