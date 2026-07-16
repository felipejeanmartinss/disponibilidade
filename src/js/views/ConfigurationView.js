import {
    MatrixEditorView,
} from "./MatrixEditorView.js";

import {
    AppearanceView,
} from "./AppearanceView.js";

import {
    FolderImportView,
} from "./FolderImportView.js";

export class ConfigurationView {
    static render({
        projectConfig,
        channels,
        statuses,
    }) {
        const block =
            projectConfig.blocks[0];

        return `
            <section class="workspace-panel">
                <header class="workspace-panel__header">
                    <div>
                        <p class="modal__eyebrow">
                            Administração
                        </p>

                        <h2 class="workspace-panel__title">
                            Configuração do empreendimento
                        </h2>

                        <p class="workspace-panel__description">
                            Visualize a matriz-base,
                            os pavimentos especiais,
                            as junções e as células
                            excluídas.
                        </p>
                    </div>
                </header>

                <form class="project-structure" data-project-structure-form>
                    <div class="project-structure__fields">
                        <div class="form-field">
                            <label class="form-label" for="project-name">Produto</label>
                            <input class="form-control" id="project-name" name="projectName"
                                value="${projectConfig.projectName}" required>
                        </div>
                        <div class="form-field">
                            <label class="form-label" for="block-name">Bloco</label>
                            <input class="form-control" id="block-name" name="blockName"
                                value="${block?.name ?? ""}" required>
                        </div>
                        <div class="form-field">
                            <label class="form-label" for="block-floors">Pavimentos</label>
                            <input class="form-control" id="block-floors" name="floors"
                                type="number" min="1" max="200" value="${block?.floors ?? 1}" required>
                        </div>
                        <div class="form-field">
                            <label class="form-label" for="block-columns">Colunas</label>
                            <input class="form-control" id="block-columns" name="columns"
                                type="number" min="1" max="100" value="${block?.columns ?? 1}" required>
                        </div>
                    </div>
                    <button class="modal-button modal-button--primary" type="submit">
                        Atualizar estrutura
                    </button>
                </form>

                <details class="public-map-settings" open>
                    <summary class="public-map-settings__summary">
                        Exibição do link público
                    </summary>

                    <form
                        class="public-map-settings__form"
                        data-public-map-settings-form
                    >
                        <div class="form-field">
                            <label
                                class="form-label"
                                for="public-map-page-count"
                            >
                                Número de páginas
                            </label>

                            <input
                                class="form-control"
                                id="public-map-page-count"
                                name="pageCount"
                                type="number"
                                min="1"
                                max="${Math.min(20, block?.floors ?? 1)}"
                                value="${projectConfig.publicMapSettings.pageCount}"
                                required
                            >
                        </div>

                        <div class="form-field">
                            <label
                                class="form-label"
                                for="public-map-rotation-seconds"
                            >
                                Tempo por página (segundos)
                            </label>

                            <input
                                class="form-control"
                                id="public-map-rotation-seconds"
                                name="rotationSeconds"
                                type="number"
                                min="3"
                                max="3600"
                                value="${projectConfig.publicMapSettings.rotationSeconds}"
                                required
                            >
                        </div>

                        <p class="public-map-settings__help">
                            Os pavimentos serão distribuídos do mais alto para
                            o mais baixo. O link alternará as páginas
                            automaticamente.
                        </p>

                        <button
                            class="modal-button modal-button--primary"
                            type="submit"
                        >
                            Salvar exibição
                        </button>
                    </form>
                </details>

                ${AppearanceView.render({
                    channels,
                    statuses,
                    projectConfig,
                })}

                ${FolderImportView.render()}

                ${MatrixEditorView.render(
                    block
                )}
            </section>
        `;
    }
}
