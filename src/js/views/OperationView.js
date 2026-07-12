import {
    OperationMatrixView,
} from "./OperationMatrixView.js";

export class OperationView {
    static render({
        channels,
        units,
        projectConfig,
    }) {
        const statistics =
            OperationView.calculateStatistics(
                units
            );

        const activeBlock =
            projectConfig.blocks[0];

        const operationMatrix =
            OperationMatrixView.render({
                block: activeBlock,
                units,
            });

        const channelLegend =
            OperationView.renderChannelLegend(
                channels
            );

        return `
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
                            ${projectConfig.projectName}
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
                        <option value="">
                            Todos
                        </option>

                        ${projectConfig.blocks
                            .map(
                                (block) => `
                                    <option value="${block.id}">
                                        ${block.name}
                                    </option>
                                `
                            )
                            .join("")}
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
                        <option value="">
                            Todos
                        </option>
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

                            <p class="workspace-panel__description">
                                Consulte a posição comercial
                                das unidades por andar.
                            </p>
                        </div>

                        <span class="system-status">
                            Atualizado
                        </span>
                    </header>

                    <div
                        aria-label="Mapa comercial das unidades"
                    >
                        ${operationMatrix}
                    </div>
                </section>

                <aside class="insights-panel">
                    <header class="insights-panel__header">
                        <h2 class="insights-panel__title">
                            Visão geral
                        </h2>
                    </header>

                    <div class="kpi-list">
                        ${OperationView.renderKpiItem(
                            "Total de unidades",
                            statistics.total
                        )}

                        ${OperationView.renderKpiItem(
                            "Disponíveis",
                            statistics.available
                        )}

                        ${OperationView.renderKpiItem(
                            "Reservadas",
                            statistics.reserved
                        )}

                        ${OperationView.renderKpiItem(
                            "Vendidas",
                            statistics.sold
                        )}

                        ${OperationView.renderKpiItem(
                            "VSO",
                            `${statistics.salesRate}%`
                        )}
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
        `;
    }

    static calculateStatistics(units) {
        const available =
            units.filter(
                (unit) =>
                    unit.status ===
                    "available"
            ).length;

        const reserved =
            units.filter(
                (unit) =>
                    unit.status ===
                    "reserved"
            ).length;

        const sold =
            units.filter(
                (unit) =>
                    unit.status ===
                    "sold"
            ).length;

        const salesRate =
            units.length > 0
                ? Math.round(
                      (sold /
                          units.length) *
                          100
                  )
                : 0;

        return {
            total: units.length,
            available,
            reserved,
            sold,
            salesRate,
        };
    }

    static renderChannelLegend(
        channels
    ) {
        return channels
            .map(
                (channel) => `
                    <li class="channel-legend__item">
                        <span
                            class="channel-dot"
                            data-channel="${channel.value}"
                            aria-hidden="true"
                        ></span>

                        <span>
                            ${channel.label}
                        </span>
                    </li>
                `
            )
            .join("");
    }

    static renderKpiItem(
        label,
        value
    ) {
        return `
            <div class="kpi-item">
                <span class="kpi-item__label">
                    ${label}
                </span>

                <strong class="kpi-item__value">
                    ${value}
                </strong>
            </div>
        `;
    }
}