import {
    UNIT_STATUS_OPTIONS,
} from "../config/statuses.js";

import {
    OperationMatrixView,
} from "./OperationMatrixView.js";

export class OperationView {
    static render({ channels, units, projectConfig }) {
        const matrices = projectConfig.blocks
            .map((block) => `
                <section class="operation-block" data-operation-block="${block.id}">
                    ${projectConfig.blocks.length > 1
                        ? `<h3 class="operation-block__title">${block.name}</h3>`
                        : ""}
                    ${OperationMatrixView.render({ block, units })}
                </section>
            `)
            .join("");

        return `
            <section class="toolbar" aria-label="Filtros do painel">
                ${OperationView.renderSelect("block-filter", "Bloco",
                    projectConfig.blocks.map(({ id, name }) => ({ value: id, label: name })))}
                ${OperationView.renderSelect("floor-filter", "Andar",
                    OperationView.getFloorOptions(projectConfig))}
                ${OperationView.renderSelect("status-filter", "Status", UNIT_STATUS_OPTIONS)}
                ${OperationView.renderSelect("channel-filter", "Canal", channels)}
                <div class="toolbar-field">
                    <label class="toolbar-field__label" for="unit-search">Buscar unidade</label>
                    <input class="toolbar-field__control" id="unit-search"
                        type="search" placeholder="Ex.: 803">
                </div>
            </section>

            <section class="workspace-panel operation-workspace" data-operation-workspace>
                <header class="workspace-panel__header">
                    <div>
                        <h2 class="workspace-panel__title">Mapa de disponibilidade</h2>
                        <span class="operation-results" data-operation-results>
                            ${units.length} unidades exibidas
                        </span>
                    </div>

                    <div class="operation-controls" aria-label="Controles do mapa">
                        <button type="button" data-operation-zoom-out
                            aria-label="Diminuir cards">−</button>
                        <output data-operation-zoom-value>100%</output>
                        <button type="button" data-operation-zoom-in
                            aria-label="Aumentar cards">+</button>
                        <button type="button" data-operation-fullscreen>
                            Tela cheia
                        </button>
                    </div>
                </header>

                <div aria-label="Mapa comercial das unidades">
                    ${matrices}
                </div>

                <footer class="status-legend" aria-label="Legenda de status">
                    ${OperationView.renderStatusLegend()}
                </footer>
            </section>
        `;
    }

    static renderSelect(id, label, options) {
        return `
            <div class="toolbar-field">
                <label class="toolbar-field__label" for="${id}">${label}</label>
                <select class="toolbar-field__control" id="${id}">
                    <option value="">Todos</option>
                    ${options.map((option) => `
                        <option value="${option.value}">${option.label}</option>
                    `).join("")}
                </select>
            </div>
        `;
    }

    static getFloorOptions(projectConfig) {
        const highestFloor = Math.max(...projectConfig.blocks.map((block) => block.floors));
        return Array.from({ length: highestFloor }, (_, index) => ({
            value: String(index + 1),
            label: `${index + 1}º`,
        })).reverse();
    }

    static renderStatusLegend() {
        return UNIT_STATUS_OPTIONS.map((status) => `
            <span class="status-legend__item">
                <span class="status-legend__sample" data-status="${status.value}"
                    aria-hidden="true"></span>
                ${status.label}
            </span>
        `).join("");
    }
}
