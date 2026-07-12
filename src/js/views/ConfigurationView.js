import {
    MatrixEditorView,
} from "./MatrixEditorView.js";

export class ConfigurationView {
    static render({
        projectConfig,
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

                ${MatrixEditorView.render(
                    block
                )}
            </section>
        `;
    }
}