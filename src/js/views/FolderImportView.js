import {
    escapeHtml,
} from "../utils/html.js";

export class FolderImportView {
    static render() {
        return `
            <details class="folder-import" data-folder-import>
                <summary class="folder-import__summary">
                    Importar base de pastas
                </summary>

                <div class="folder-import__content">
                    <div class="folder-import__introduction">
                        <div>
                            <h3>Atualização em lote</h3>
                            <p>
                                Importe pasta, cliente, canal e equipe responsável
                                sem alterar a geometria das unidades.
                            </p>
                        </div>

                        <button
                            class="modal-button modal-button--secondary"
                            type="button"
                            data-folder-import-template
                        >
                            Baixar modelo CSV
                        </button>
                    </div>

                    <div class="folder-import__picker">
                        <label class="form-label" for="folder-import-file">
                            Arquivo CSV
                        </label>

                        <input
                            class="form-control"
                            id="folder-import-file"
                            type="file"
                            accept=".csv,text/csv"
                            data-folder-import-file
                        >

                        <p class="folder-import__help">
                            O arquivo pode usar ponto e vírgula ou vírgula.
                            A coluna Unidade é obrigatória. Use Bloco quando
                            houver códigos repetidos em blocos diferentes.
                        </p>
                    </div>

                    <div
                        class="folder-import__preview"
                        data-folder-import-preview
                        aria-live="polite"
                    >
                        ${FolderImportView.renderEmptyState()}
                    </div>
                </div>
            </details>
        `;
    }

    static renderEmptyState() {
        return `
            <p class="folder-import__empty">
                Selecione uma base para conferir os dados antes de importar.
            </p>
        `;
    }

    static renderLoading(fileName) {
        return `
            <p class="folder-import__empty">
                Lendo ${escapeHtml(fileName)}…
            </p>
        `;
    }

    static renderFailure(message) {
        return `
            <div class="folder-import__message folder-import__message--error">
                <strong>Não foi possível ler a base.</strong>
                <span>${escapeHtml(message)}</span>
            </div>
        `;
    }

    static renderPreview(preview, fileName) {
        const hasErrors = preview.errors.length > 0;
        const visibleUpdates = preview.updates.slice(0, 20);

        return `
            <div class="folder-import__result">
                <div class="folder-import__result-header">
                    <div>
                        <strong>${escapeHtml(fileName)}</strong>
                        <p>
                            ${preview.updates.length} unidade(s) pronta(s)
                            para atualização
                            ${hasErrors ? `• ${preview.errors.length} erro(s)` : ""}.
                        </p>
                    </div>

                    <span class="folder-import__badge ${
                        hasErrors
                            ? "folder-import__badge--error"
                            : "folder-import__badge--success"
                    }">
                        ${hasErrors ? "Revisão necessária" : "Base validada"}
                    </span>
                </div>

                ${hasErrors ? FolderImportView.renderErrors(preview.errors) : ""}

                ${visibleUpdates.length
                    ? FolderImportView.renderTable(visibleUpdates)
                    : ""}

                ${preview.updates.length > visibleUpdates.length
                    ? `<p class="folder-import__caption">
                        Exibindo as primeiras ${visibleUpdates.length} de
                        ${preview.updates.length} atualizações.
                    </p>`
                    : ""}

                <div class="folder-import__actions">
                    <button
                        class="modal-button modal-button--secondary"
                        type="button"
                        data-folder-import-clear
                    >
                        Cancelar
                    </button>

                    <button
                        class="modal-button modal-button--primary"
                        type="button"
                        data-folder-import-confirm
                        ${hasErrors || !preview.updates.length ? "disabled" : ""}
                    >
                        Confirmar importação
                    </button>
                </div>
            </div>
        `;
    }

    static renderErrors(errors) {
        return `
            <div class="folder-import__errors" role="alert">
                <strong>Corrija os itens abaixo e selecione o arquivo novamente:</strong>
                <ul>
                    ${errors
                        .slice(0, 12)
                        .map(
                            (error) => `
                                <li>
                                    Linha ${error.line}: ${escapeHtml(error.message)}
                                </li>
                            `
                        )
                        .join("")}
                </ul>
                ${errors.length > 12
                    ? `<p>Mais ${errors.length - 12} erro(s) não exibido(s).</p>`
                    : ""}
            </div>
        `;
    }

    static renderTable(updates) {
        return `
            <div class="folder-import__table-viewport">
                <table class="folder-import__table">
                    <thead>
                        <tr>
                            <th>Linha</th>
                            <th>Unidade</th>
                            <th>Bloco</th>
                            <th>Pasta</th>
                            <th>Tipo</th>
                            <th>Cliente</th>
                            <th>Canal</th>
                            <th>Gerente</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${updates.map(({ unit, data, line }) => `
                            <tr>
                                <td>${line}</td>
                                <td><strong>${escapeHtml(unit.displayCode)}</strong></td>
                                <td>${escapeHtml(unit.block)}</td>
                                <td>${escapeHtml(data.folderNumber || "—")}</td>
                                <td>${escapeHtml(data.folderType || "—")}</td>
                                <td>${escapeHtml(data.clientName || "—")}</td>
                                <td>${escapeHtml(data.channelLabel || "—")}</td>
                                <td>${escapeHtml(data.manager || "—")}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }
}
