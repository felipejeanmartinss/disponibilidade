import {
    UNIT_STATUS_OPTIONS,
} from "../config/statuses.js";

import {
    OperationMatrixView,
} from "./OperationMatrixView.js";

export class OperationView {
    static render({ units, projectConfig }) {
        const activeBlock = projectConfig.blocks[0];
        const operationMatrix = OperationMatrixView.render({
            block: activeBlock,
            units,
        });

        return `
            <section class="toolbar" aria-label="Filtros do painel">
                ${OperationView.renderProjectFilter(projectConfig)}
                ${OperationView.renderBlockFilter(projectConfig)}
                <div class="toolbar-field">
                    <label class="toolbar-field__label" for="floor-filter">Andar</label>
                    <select class="toolbar-field__control" id="floor-filter">
                        <option value="">Todos</option>
                    </select>
                </div>
                <div class="toolbar-field">
                    <label class="toolbar-field__label" for="unit-search">Buscar unidade</label>
                    <input class="toolbar-field__control" id="unit-search"
                        type="search" placeholder="Ex.: 803">
                </div>
            </section>

            <section class="workspace-panel">
                <header class="workspace-panel__header">
                    <h2 class="workspace-panel__title">Mapa de disponibilidade</h2>
                    <span class="system-status">Atualizado</span>
                </header>

                <div aria-label="Mapa comercial das unidades">
                    ${operationMatrix}
                </div>

                <footer class="status-legend" aria-label="Legenda de status">
                    ${OperationView.renderStatusLegend()}
                </footer>
            </section>
        `;
    }

    static renderProjectFilter(projectConfig) {
        return `
            <div class="toolbar-field">
                <label class="toolbar-field__label" for="project-filter">Empreendimento</label>
                <select class="toolbar-field__control" id="project-filter">
                    <option>${projectConfig.projectName}</option>
                </select>
            </div>
        `;
    }

    static renderBlockFilter(projectConfig) {
        const options = projectConfig.blocks
            .map((block) => `<option value="${block.id}">${block.name}</option>`)
            .join("");

        return `
            <div class="toolbar-field">
                <label class="toolbar-field__label" for="block-filter">Bloco</label>
                <select class="toolbar-field__control" id="block-filter">
                    <option value="">Todos</option>
                    ${options}
                </select>
            </div>
        `;
    }

    static renderStatusLegend() {
        return UNIT_STATUS_OPTIONS
            .map((status) => `
                <span class="status-legend__item">
                    <span class="status-legend__sample"
                        data-status="${status.value}" aria-hidden="true"></span>
                    ${status.label}
                </span>
            `)
            .join("");
    }
}
