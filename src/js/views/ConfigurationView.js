import {
    MatrixEditorView,
} from "./MatrixEditorView.js";

import {
    AppearanceView,
} from "./AppearanceView.js";

export class ConfigurationView {
    static render({
        projectConfig,
        channels,
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

                ${AppearanceView.render({
                    channels,
                    projectConfig,
                })}

                ${MatrixEditorView.render(
                    block
                )}
            </section>
        `;
    }
}
