import {
    CsvReaderService,
} from "../services/CsvReaderService.js";

import {
    FolderImportService,
} from "../services/FolderImportService.js";

import {
    FolderImportView,
} from "../views/FolderImportView.js";

export class FolderImportController {
    constructor({
        rootElement,
        units,
        getChannels,
        onUnitsChange,
    }) {
        this.rootElement = rootElement;
        this.units = units;
        this.getChannels = getChannels;
        this.onUnitsChange = onUnitsChange;
        this.preview = null;
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    init() {
        this.rootElement.addEventListener("change", this.handleChange);
        this.rootElement.addEventListener("click", this.handleClick);
    }

    async handleChange(event) {
        if (!event.target.matches("[data-folder-import-file]")) {
            return;
        }

        const file = event.target.files?.[0];

        if (!file) {
            this.reset();
            return;
        }

        this.render(FolderImportView.renderLoading(file.name));

        try {
            const rows = await CsvReaderService.read(file);
            this.preview = FolderImportService.prepare(
                rows,
                this.units,
                this.getChannels()
            );
            this.render(FolderImportView.renderPreview(this.preview, file.name));
        } catch (error) {
            this.preview = null;
            this.render(FolderImportView.renderFailure(error.message));
        }
    }

    handleClick(event) {
        const templateButton = event.target.closest("[data-folder-import-template]");
        const clearButton = event.target.closest("[data-folder-import-clear]");
        const confirmButton = event.target.closest("[data-folder-import-confirm]");

        if (templateButton) {
            this.downloadTemplate();
            return;
        }

        if (clearButton) {
            this.reset();
            return;
        }

        if (!confirmButton) {
            return;
        }

        try {
            FolderImportService.applyPrepared(this.preview);
            const importedCount = this.preview.updates.length;
            this.preview = null;
            this.onUnitsChange();
            window.alert(`${importedCount} unidade(s) atualizada(s) com sucesso.`);
        } catch (error) {
            window.alert(error.message);
        }
    }

    render(content) {
        const previewElement = this.rootElement.querySelector(
            "[data-folder-import-preview]"
        );

        if (previewElement) {
            previewElement.innerHTML = content;
        }
    }

    reset() {
        this.preview = null;
        const input = this.rootElement.querySelector("[data-folder-import-file]");

        if (input) {
            input.value = "";
        }

        this.render(FolderImportView.renderEmptyState());
    }

    downloadTemplate() {
        const content = [
            "Unidade;Bloco;Nº da pasta;Tipo da pasta;Nome do cliente;Canal;Parceira;Superintendente;Diretor;Gerente Parceiro;Coordenador;Gerente;Corretor",
            "803;Bloco Único;000123;Reserva;Cliente exemplo;Lopes Rio;;;;;Coordenação;Gerência;Corretor",
        ].join("\r\n");
        const blob = new Blob(["\uFEFF", content], {
            type: "text/csv;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "modelo-importacao-pastas.csv";
        anchor.click();
        URL.revokeObjectURL(url);
    }
}
