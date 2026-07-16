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
                                Cadastre clientes, pastas, canais e equipes para
                                preenchimento automático no modal da unidade.
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
                            Nº da pasta e Nome do cliente são obrigatórios.
                            O tipo pode ser Ouro, Prata ou Bronze.
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
        const visibleRecords = preview.records.slice(0, 20);

        return `
            <div class="folder-import__result">
                <div class="folder-import__result-header">
                    <div>
                        <strong>${escapeHtml(fileName)}</strong>
                        <p>
                            ${preview.records.length} cliente(s) pronto(s)
                            para cadastro
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

                ${visibleRecords.length
                    ? FolderImportView.renderTable(visibleRecords)
                    : ""}

                ${preview.records.length > visibleRecords.length
                    ? `<p class="folder-import__caption">
                        Exibindo os primeiros ${visibleRecords.length} de
                        ${preview.records.length} clientes.
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
                        ${hasErrors || !preview.records.length ? "disabled" : ""}
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

    static renderTable(records) {
        return `
            <div class="folder-import__table-viewport">
                <table class="folder-import__table">
                    <thead>
                        <tr>
                            <th>Linha</th>
                            <th>Pasta</th>
                            <th>Tipo</th>
                            <th>Cliente</th>
                            <th>Canal</th>
                            <th>Gerente</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${records.map((record) => `
                            <tr>
                                <td>${record.line}</td>
                                <td><strong>${escapeHtml(record.folderNumber)}</strong></td>
                                <td>${escapeHtml(record.folderTypeLabel || "—")}</td>
                                <td>${escapeHtml(record.clientName)}</td>
                                <td>${escapeHtml(record.channelLabel || "—")}</td>
                                <td>${escapeHtml(record.manager || "—")}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }
}
