import { UnitCardView } from "./UnitCardView.js";

export class AppView {
    constructor(rootElement) {
        if (!(rootElement instanceof HTMLElement)) {
            throw new Error(
                "AppView precisa receber um elemento HTML válido."
            );
        }

        this.rootElement = rootElement;
    }

    render(config, channels, units) {
        const channelLegend = channels
            .map(
                (channel) => `
                    <li class="channel-legend__item">
                        <span
                            class="channel-dot"
                            data-channel="${channel.value}"
                            aria-hidden="true"
                        ></span>

                        <span>${channel.label}</span>
                    </li>
                `
            )
            .join("");

        const unitCards =
            UnitCardView.renderList(units);

        const availableUnits = units.filter(
            (unit) => unit.status === "available"
        ).length;

        const reservedUnits = units.filter(
            (unit) => unit.status === "reserved"
        ).length;

        const soldUnits = units.filter(
            (unit) => unit.status === "sold"
        ).length;

        const salesRate = units.length
            ? Math.round(
                (soldUnits / units.length) * 100
            )
            : 0;

        this.rootElement.innerHTML = `
            <div class="app-shell">
                <header class="app-header">
                    <div class="app-container app-header__content">
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
                                    Península Collection
                                </strong>
                            </div>

                            <div
                                class="user-avatar"
                                aria-label="Usuário Felipe Martins"
                                title="Felipe Martins"
                            >
                                FM
                            </div>
                        </div>
                    </div>
                </header>

                <main class="app-workspace">
                    <div class="app-container">
                        <section
                            class="toolbar"
                            aria-label="Filtros do painel"
                        >
                            <div class="toolbar-field">
                                <label
                                    class="toolbar-field__label"
                                    for="project-filter"
                                >
                                    Empreendimento
                                </label>

                                <select
                                    class="toolbar-field__control"
                                    id="project-filter"
                                >
                                    <option>
                                        Península Collection
                                    </option>
                                </select>
                            </div>

                            <div class="toolbar-field">
                                <label
                                    class="toolbar-field__label"
                                    for="block-filter"
                                >
                                    Bloco
                                </label>

                                <select
                                    class="toolbar-field__control"
                                    id="block-filter"
                                >
                                    <option>Todos</option>
                                </select>
                            </div>

                            <div class="toolbar-field">
                                <label
                                    class="toolbar-field__label"
                                    for="floor-filter"
                                >
                                    Andar
                                </label>

                                <select
                                    class="toolbar-field__control"
                                    id="floor-filter"
                                >
                                    <option>Todos</option>
                                </select>
                            </div>

                            <div class="toolbar-field">
                                <label
                                    class="toolbar-field__label"
                                    for="unit-search"
                                >
                                    Buscar unidade
                                </label>

                                <input
                                    class="toolbar-field__control"
                                    id="unit-search"
                                    type="search"
                                    placeholder="Ex.: 803"
                                >
                            </div>
                        </section>

                        <div class="content-layout">
                            <section class="workspace-panel">
                                <header class="workspace-panel__header">
                                    <div>
                                        <h2 class="workspace-panel__title">
                                            Mapa de disponibilidade
                                        </h2>

                                        <p
                                            class="
                                                workspace-panel__description
                                            "
                                        >
                                            Consulte a posição comercial
                                            das unidades por andar.
                                        </p>
                                    </div>

                                    <span class="system-status">
                                        Atualizado
                                    </span>
                                </header>

                                <div
                                    class="unit-grid"
                                    aria-label="
                                        Mapa comercial das unidades
                                    "
                                >
                                    ${unitCards}
                                </div>
                            </section>

                            <aside class="insights-panel">
                                <header class="insights-panel__header">
                                    <h2 class="insights-panel__title">
                                        Visão geral
                                    </h2>
                                </header>

                                <div class="kpi-list">
                                    <div class="kpi-item">
                                        <span class="kpi-item__label">
                                            Total de unidades
                                        </span>

                                        <strong class="kpi-item__value">
                                            ${units.length}
                                        </strong>
                                    </div>

                                    <div class="kpi-item">
                                        <span class="kpi-item__label">
                                            Disponíveis
                                        </span>

                                        <strong class="kpi-item__value">
                                            ${availableUnits}
                                        </strong>
                                    </div>

                                    <div class="kpi-item">
                                        <span class="kpi-item__label">
                                            Reservadas
                                        </span>

                                        <strong class="kpi-item__value">
                                            ${reservedUnits}
                                        </strong>
                                    </div>

                                    <div class="kpi-item">
                                        <span class="kpi-item__label">
                                            Vendidas
                                        </span>

                                        <strong class="kpi-item__value">
                                            ${soldUnits}
                                        </strong>
                                    </div>

                                    <div class="kpi-item">
                                        <span class="kpi-item__label">
                                            VSO
                                        </span>

                                        <strong class="kpi-item__value">
                                            ${salesRate}%
                                        </strong>
                                    </div>
                                </div>

                                <section class="channel-legend">
                                    <h3 class="channel-legend__title">
                                        Canais de vendas
                                    </h3>

                                    <ul class="channel-legend__list">
                                        ${channelLegend}
                                    </ul>
                                </section>
                            </aside>
                        </div>
                    </div>
                </main>

                <footer class="app-footer">
                    <div class="app-container app-footer__content">
                        <p class="app-footer__text">
                            ${config.name} • Versão ${config.version}
                        </p>

                        <span class="system-status">
                            Sistema online
                        </span>
                    </div>
                </footer>
            </div>
        `;
    }
}