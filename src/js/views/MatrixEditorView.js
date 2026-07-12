export class MatrixEditorView {
    static render(block) {
        if (!block) {
            return `
                <div class="matrix-editor__empty">
                    Nenhum bloco configurado.
                </div>
            `;
        }

        const cellsByAnchor =
            MatrixEditorView.createAnchorMap(
                block
            );

        const occupiedCells =
            MatrixEditorView.createOccupiedCellsSet(
                block
            );

        const columnHeaders =
            Array.from(
                {
                    length:
                        block.columns,
                },
                (_, index) => `
                    <div
                        class="matrix-editor__column-header"
                    >
                        C${index + 1}
                    </div>
                `
            ).join("");

        const rows = [];

        for (
            let floor = block.floors;
            floor >= 1;
            floor -= 1
        ) {
            rows.push(`
                <div
                    class="matrix-editor__floor-label"
                >
                    ${floor}º
                </div>
            `);

            for (
                let column = 1;
                column <= block.columns;
                column += 1
            ) {
                const key =
                    `${floor}-${column}`;

                if (
                    occupiedCells.has(
                        key
                    ) &&
                    !cellsByAnchor.has(
                        key
                    )
                ) {
                    continue;
                }

                if (
                    block.isCellExcluded(
                        floor,
                        column
                    )
                ) {
                    rows.push(
                        MatrixEditorView
                            .renderExcludedCell({
                                floor,
                                column,
                            })
                    );

                    continue;
                }

                const anchoredUnit =
                    cellsByAnchor.get(
                        key
                    );

                if (anchoredUnit) {
                    rows.push(
                        MatrixEditorView
                            .renderCustomUnit(
                                anchoredUnit
                            )
                    );

                    continue;
                }

                rows.push(
                    MatrixEditorView
                        .renderStandardCell({
                            floor,
                            column,
                            block,
                        })
                );
            }
        }

        return `
            <section class="matrix-editor">
                <header class="matrix-editor__header">
                    <div>
                        <p class="matrix-editor__eyebrow">
                            Editor da matriz
                        </p>

                        <h3 class="matrix-editor__title">
                            ${block.name}
                        </h3>
                    </div>

                    <div class="matrix-editor__summary">
                        <span>
                            ${block.floors}
                            pavimentos
                        </span>

                        <span>
                            ${block.columns}
                            colunas
                        </span>

                        <span>
                            ${block.getEstimatedUnitCount()}
                            unidades estimadas
                        </span>
                    </div>
                </header>

                <div class="matrix-editor__toolbar">
    <div>
        <strong
            data-matrix-selection-count
        >
            0
        </strong>

        <span>
            células selecionadas
        </span>
    </div>

    <p class="matrix-editor__help">
        Clique para selecionar.
        Use Ctrl para múltiplas células
        ou Shift para selecionar uma área.
    </p>

    <div class="matrix-editor__actions">
        <button
            class="
                matrix-editor__toolbar-button
                matrix-editor__toolbar-button--danger
            "
            type="button"
            data-matrix-action="exclude-cells"
            data-matrix-requires-selection
            disabled
        >
            Excluir células
        </button>

        <button
            class="matrix-editor__toolbar-button"
            type="button"
            data-matrix-action="restore-cells"
            data-matrix-requires-selection
            disabled
        >
            Restaurar células
        </button>

        <button
            class="matrix-editor__toolbar-button"
            type="button"
            data-matrix-action="clear-selection"
            data-matrix-requires-selection
            disabled
        >
            Limpar seleção
        </button>
    </div>
</div>

                <div class="matrix-editor__viewport">
                    <div
                        class="matrix-editor__grid"
                        role="grid"
                        aria-label="Matriz do empreendimento"
                        style="
                            --matrix-columns:
                            ${block.columns};
                        "
                    >
                        <div
                            class="matrix-editor__corner"
                            aria-hidden="true"
                        ></div>

                        ${columnHeaders}
                        ${rows.join("")}
                    </div>
                </div>

                <footer class="matrix-editor__legend">
                    ${MatrixEditorView.renderLegendItem(
                        "standard",
                        "Unidade tipo"
                    )}

                    ${MatrixEditorView.renderLegendItem(
                        "garden",
                        "Garden"
                    )}

                    ${MatrixEditorView.renderLegendItem(
                        "custom",
                        "Unidade unificada"
                    )}

                    ${MatrixEditorView.renderLegendItem(
                        "excluded",
                        "Célula excluída"
                    )}

                    ${MatrixEditorView.renderLegendItem(
                        "selected",
                        "Selecionada"
                    )}
                </footer>
            </section>
        `;
    }

    static createAnchorMap(block) {
        const anchorMap =
            new Map();

        block.customUnits.forEach(
            (unit) => {
                const key =
                    `${unit.anchorFloor}-${unit.anchorColumn}`;

                anchorMap.set(
                    key,
                    unit
                );
            }
        );

        return anchorMap;
    }

    static createOccupiedCellsSet(
        block
    ) {
        const occupiedCells =
            new Set();

        block.customUnits.forEach(
            (unit) => {
                block.getOccupiedCells(
                    unit
                ).forEach(
                    (cell) => {
                        occupiedCells.add(
                            `${cell.floor}-${cell.column}`
                        );
                    }
                );
            }
        );

        return occupiedCells;
    }

    static renderStandardCell({
        floor,
        column,
        block,
    }) {
        const templateUnit =
            block
                .typeFloorTemplate
                .units.find(
                    (unit) =>
                        unit.column ===
                        column
                );

        const isInsideTypeRange =
            floor >=
                block
                    .typeFloorTemplate
                    .startFloor &&
            floor <=
                block
                    .typeFloorTemplate
                    .endFloor;

        if (
            !templateUnit ||
            !isInsideTypeRange
        ) {
            return `
                <button
                    class="
                        matrix-editor__cell
                        matrix-editor__cell--empty
                    "
                    type="button"
                    role="gridcell"
                    data-matrix-cell
                    data-floor="${floor}"
                    data-column="${column}"
                    data-row-span="1"
                    data-column-span="1"
                    aria-selected="false"
                >
                    <span>—</span>
                </button>
            `;
        }

        const displayCode =
            `${floor}${templateUnit.displaySuffix}`;

        return `
            <button
                class="
                    matrix-editor__cell
                    matrix-editor__cell--standard
                "
                type="button"
                role="gridcell"
                data-matrix-cell
                data-floor="${floor}"
                data-column="${column}"
                data-row-span="1"
                data-column-span="1"
                aria-label="
                    Unidade ${displayCode}.
                    Pavimento ${floor},
                    coluna ${column}.
                "
                aria-selected="false"
            >
                <strong>
                    ${displayCode}
                </strong>

                <span>
                    Tipo
                </span>
            </button>
        `;
    }

    static renderCustomUnit(unit) {
        const customClass =
            unit.visualVariant ===
            "garden"
                ? "matrix-editor__cell--garden"
                : "matrix-editor__cell--custom";

        return `
            <button
                class="
                    matrix-editor__cell
                    ${customClass}
                "
                type="button"
                role="gridcell"
                data-matrix-cell
                data-unit-id="${unit.id}"
                data-floor="${unit.anchorFloor}"
                data-column="${unit.anchorColumn}"
                data-row-span="${unit.rowSpan}"
                data-column-span="${unit.columnSpan}"
                aria-label="
                    Unidade ${unit.displayCode}.
                    ${MatrixEditorView.getUnitLabel(
                        unit
                    )}.
                "
                aria-selected="false"
                style="
                    grid-column:
                        span ${unit.columnSpan};

                    grid-row:
                        span ${unit.rowSpan};
                "
            >
                <strong>
                    ${unit.displayCode}
                </strong>

                <span>
                    ${MatrixEditorView.getUnitLabel(
                        unit
                    )}
                </span>

                <small>
                    ${unit.columnSpan}
                    ×
                    ${unit.rowSpan}
                </small>
            </button>
        `;
    }

    static renderExcludedCell({
        floor,
        column,
    }) {
        return `
            <button
                class="
                    matrix-editor__cell
                    matrix-editor__cell--excluded
                "
                type="button"
                role="gridcell"
                data-matrix-cell
                data-floor="${floor}"
                data-column="${column}"
                data-row-span="1"
                data-column-span="1"
                aria-label="
                    Célula excluída.
                    Pavimento ${floor},
                    coluna ${column}.
                "
                aria-selected="false"
            >
                ×
            </button>
        `;
    }

    static renderLegendItem(
        type,
        label
    ) {
        return `
            <span class="matrix-editor__legend-item">
                <span
                    class="
                        matrix-editor__legend-sample
                        matrix-editor__legend-sample--${type}
                    "
                    aria-hidden="true"
                ></span>

                ${label}
            </span>
        `;
    }

    static getUnitLabel(unit) {
        if (
            unit.visualVariant ===
            "garden"
        ) {
            return "Garden";
        }

        if (
            unit.type ===
            "coverage"
        ) {
            return "Cobertura";
        }

        if (
            unit.layoutType ===
            "horizontal-merge"
        ) {
            return "Junção horizontal";
        }

        if (
            unit.layoutType ===
            "vertical-merge"
        ) {
            return "Junção vertical";
        }

        if (
            unit.layoutType ===
            "rectangular-merge"
        ) {
            return "Junção retangular";
        }

        return "Personalizada";
    }
}