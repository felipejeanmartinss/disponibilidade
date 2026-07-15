import {
    MatrixLayoutService,
} from "../services/MatrixLayoutService.js";

import {
    ProjectStructureService,
} from "../services/ProjectStructureService.js";

export class MatrixEditorController {
    constructor({
        rootElement,
        projectConfig,
        onConfigChange,
    }) {
        if (
            !(
                rootElement instanceof
                HTMLElement
            )
        ) {
            throw new Error(
                "MatrixEditorController precisa receber um elemento HTML válido."
            );
        }

        if (!projectConfig) {
            throw new Error(
                "MatrixEditorController precisa receber a configuração do empreendimento."
            );
        }

        if (
            typeof onConfigChange !==
            "function"
        ) {
            throw new Error(
                "MatrixEditorController precisa receber uma função de atualização."
            );
        }

        this.rootElement =
            rootElement;

        this.projectConfig =
            projectConfig;

        this.onConfigChange =
            onConfigChange;

        this.selectedCells =
            new Set();

        this.selectionAnchor =
            null;

        this.handleClick =
            this.handleClick.bind(
                this
            );

        this.handleSubmit =
            this.handleSubmit.bind(this);
    }

    init() {
        this.rootElement
            .addEventListener(
                "click",
                this.handleClick
            );

        this.rootElement.addEventListener(
            "submit",
            this.handleSubmit
        );
    }

    handleSubmit(event) {
        if (!event.target.matches("[data-project-structure-form]")) {
            return;
        }

        event.preventDefault();
        const data = new FormData(event.target);

        try {
            ProjectStructureService.updatePrimaryBlock(
                this.projectConfig,
                Object.fromEntries(data.entries())
            );
            this.finishMatrixChange();
        } catch (error) {
            this.showError(error.message);
        }
    }

    handleClick(event) {
        const actionButton =
            event.target.closest(
                "[data-matrix-action]"
            );

        if (actionButton) {
            this.handleAction(
                actionButton.dataset
                    .matrixAction
            );

            return;
        }

        const matrixCell =
            event.target.closest(
                "[data-matrix-cell]"
            );

        if (!matrixCell) {
            return;
        }

        const clickedCells =
            this.getElementCells(
                matrixCell
            );

        if (event.shiftKey) {
            this.selectRange(
                clickedCells[0]
            );

            return;
        }

        if (
            event.ctrlKey ||
            event.metaKey
        ) {
            this.toggleCells(
                clickedCells
            );

            this.selectionAnchor =
                clickedCells[0];

            this.updateView();

            return;
        }

        this.selectedCells.clear();

        clickedCells.forEach(
            (cell) => {
                this.selectedCells.add(
                    this.getCellKey(
                        cell.floor,
                        cell.column
                    )
                );
            }
        );

        this.selectionAnchor =
            clickedCells[0];

        this.updateView();
    }

    handleAction(action) {
        switch (action) {
            case "clear-selection":
                this.clearSelection();
                break;

            case "exclude-cells":
                this.excludeSelectedCells();
                break;

            case "restore-cells":
                this.restoreSelectedCells();
                break;

            case "merge-horizontal":
                this.mergeSelectedCells(
                    "horizontal"
                );
                break;

            case "merge-vertical":
                this.mergeSelectedCells(
                    "vertical"
                );
                break;

            case "unmerge-unit":
                this.unmergeSelectedUnit();
                break;

            case "apply-unit-type":
                this.applySelectedUnitType();
                break;

            default:
                break;
        }
    }

    excludeSelectedCells() {
        try {
            MatrixLayoutService.excludeCells(
                this.getActiveBlock(),
                this.getSelectedCells()
            );

            this.finishMatrixChange();
        } catch (error) {
            this.showError(
                error.message
            );
        }
    }

    restoreSelectedCells() {
        try {
            MatrixLayoutService.restoreCells(
                this.getActiveBlock(),
                this.getSelectedCells()
            );

            this.finishMatrixChange();
        } catch (error) {
            this.showError(
                error.message
            );
        }
    }

    mergeSelectedCells(direction) {
        const directionLabel =
            direction === "horizontal"
                ? "horizontal"
                : "vertical";

        const confirmed = window.confirm(
            `Unificar as células na direção ${directionLabel}? Os dados comerciais da célula âncora serão preservados; dados das demais unidades deixarão de fazer parte da unidade resultante.`
        );

        if (!confirmed) {
            return;
        }

        try {
            MatrixLayoutService.mergeCells(
                this.getActiveBlock(),
                this.getSelectedCells(),
                direction
            );

            this.finishMatrixChange();
        } catch (error) {
            this.showError(error.message);
        }
    }

    unmergeSelectedUnit() {
        const confirmed = window.confirm(
            "Desfazer a unificação selecionada? As células voltarão a ser unidades independentes."
        );

        if (!confirmed) {
            return;
        }

        try {
            MatrixLayoutService.unmergeUnit(
                this.getActiveBlock(),
                this.getSelectedCells()
            );

            this.finishMatrixChange();
        } catch (error) {
            this.showError(error.message);
        }
    }

    applySelectedUnitType() {
        const typeControl =
            this.rootElement.querySelector(
                "[data-matrix-unit-type]"
            );

        if (!typeControl) {
            this.showError(
                "O seletor de tipo da unidade não foi encontrado."
            );
            return;
        }

        try {
            MatrixLayoutService.applyUnitType(
                this.getActiveBlock(),
                this.getSelectedCells(),
                typeControl.value
            );

            this.finishMatrixChange();
        } catch (error) {
            this.showError(error.message);
        }
    }

    finishMatrixChange() {
        this.reset();

        this.onConfigChange(
            this.projectConfig
        );
    }

    getActiveBlock() {
        const block =
            this.projectConfig
                .blocks[0];

        if (!block) {
            throw new Error(
                "Nenhum bloco foi encontrado na configuração."
            );
        }

        return block;
    }

    getElementCells(element) {
        const anchorFloor =
            Number(
                element.dataset.floor
            );

        const anchorColumn =
            Number(
                element.dataset.column
            );

        const rowSpan =
            Number(
                element.dataset.rowSpan ??
                    1
            );

        const columnSpan =
            Number(
                element.dataset.columnSpan ??
                    1
            );

        const cells = [];

        for (
            let floorOffset = 0;
            floorOffset < rowSpan;
            floorOffset += 1
        ) {
            for (
                let columnOffset = 0;
                columnOffset <
                columnSpan;
                columnOffset += 1
            ) {
                cells.push({
                    floor:
                        anchorFloor +
                        (rowSpan > 1
                            ? -floorOffset
                            : floorOffset),

                    column:
                        anchorColumn +
                        columnOffset,
                });
            }
        }

        return cells;
    }

    toggleCells(cells) {
        const shouldRemove =
            cells.every(
                (cell) =>
                    this.selectedCells.has(
                        this.getCellKey(
                            cell.floor,
                            cell.column
                        )
                    )
            );

        cells.forEach(
            (cell) => {
                const cellKey =
                    this.getCellKey(
                        cell.floor,
                        cell.column
                    );

                if (shouldRemove) {
                    this.selectedCells.delete(
                        cellKey
                    );

                    return;
                }

                this.selectedCells.add(
                    cellKey
                );
            }
        );
    }

    selectRange(targetCell) {
        if (!this.selectionAnchor) {
            this.selectedCells.clear();

            this.selectedCells.add(
                this.getCellKey(
                    targetCell.floor,
                    targetCell.column
                )
            );

            this.selectionAnchor =
                targetCell;

            this.updateView();

            return;
        }

        const minimumFloor =
            Math.min(
                this.selectionAnchor
                    .floor,
                targetCell.floor
            );

        const maximumFloor =
            Math.max(
                this.selectionAnchor
                    .floor,
                targetCell.floor
            );

        const minimumColumn =
            Math.min(
                this.selectionAnchor
                    .column,
                targetCell.column
            );

        const maximumColumn =
            Math.max(
                this.selectionAnchor
                    .column,
                targetCell.column
            );

        this.selectedCells.clear();

        for (
            let floor =
                minimumFloor;
            floor <= maximumFloor;
            floor += 1
        ) {
            for (
                let column =
                    minimumColumn;
                column <= maximumColumn;
                column += 1
            ) {
                this.selectedCells.add(
                    this.getCellKey(
                        floor,
                        column
                    )
                );
            }
        }

        this.updateView();
    }

    getCellKey(
        floor,
        column
    ) {
        return `${floor}-${column}`;
    }

    clearSelection() {
        this.reset();
        this.updateView();
    }

    reset() {
        this.selectedCells.clear();
        this.selectionAnchor = null;
    }

    updateView() {
        const matrixElements =
            this.rootElement
                .querySelectorAll(
                    "[data-matrix-cell]"
                );

        matrixElements.forEach(
            (element) => {
                const elementCells =
                    this.getElementCells(
                        element
                    );

                const isSelected =
                    elementCells.some(
                        (cell) =>
                            this.selectedCells.has(
                                this.getCellKey(
                                    cell.floor,
                                    cell.column
                                )
                            )
                    );

                element.classList.toggle(
                    "is-selected",
                    isSelected
                );

                element.setAttribute(
                    "aria-selected",
                    String(isSelected)
                );
            }
        );

        const selectedCount =
            this.rootElement
                .querySelector(
                    "[data-matrix-selection-count]"
                );

        if (selectedCount) {
            selectedCount.textContent =
                String(
                    this.selectedCells
                        .size
                );
        }

        const actionButtons =
            this.rootElement
                .querySelectorAll(
                    "[data-matrix-requires-selection]"
                );

        actionButtons.forEach(
            (button) => {
                button.disabled =
                    this.selectedCells
                        .size === 0;
            }
        );
    }

    getSelectedCells() {
        return Array.from(
            this.selectedCells
        ).map((cellKey) => {
            const [
                floor,
                column,
            ] = cellKey
                .split("-")
                .map(Number);

            return {
                floor,
                column,
            };
        });
    }

    showError(message) {
        window.alert(message);
    }
}
