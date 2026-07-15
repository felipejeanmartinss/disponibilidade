import {
    UnitCardView,
} from "./UnitCardView.js";

export class OperationMatrixView {
    static render({
        block,
        units,
    }) {
        if (!block) {
            return `
                <div class="operation-matrix__empty">
                    Nenhum bloco configurado.
                </div>
            `;
        }

        const unitsByAnchor =
            OperationMatrixView.createUnitsByAnchor(
                units,
                block.id
            );

        const occupiedCells =
            OperationMatrixView.createOccupiedCellsSet(
                units,
                block.id
            );

        const matrixContent = [];

        for (
            let floor = block.floors;
            floor >= 1;
            floor -= 1
        ) {
            matrixContent.push(`
                <div class="operation-matrix__floor-label">
                    ${floor}º
                </div>
            `);

            for (
                let column = 1;
                column <= block.columns;
                column += 1
            ) {
                const cellKey =
                    OperationMatrixView.getCellKey(
                        floor,
                        column
                    );

                const anchoredUnit =
                    unitsByAnchor.get(
                        cellKey
                    );

                const isOccupiedByAnotherAnchor =
                    occupiedCells.has(
                        cellKey
                    ) &&
                    !anchoredUnit;

                if (
                    isOccupiedByAnotherAnchor
                ) {
                    continue;
                }

                if (
                    block.isCellExcluded(
                        floor,
                        column
                    )
                ) {
                    matrixContent.push(
                        OperationMatrixView.renderExcludedCell({
                            floor,
                            column,
                        })
                    );

                    continue;
                }

                if (anchoredUnit) {
                    matrixContent.push(
                        OperationMatrixView.renderUnit(
                            anchoredUnit
                        )
                    );

                    continue;
                }

                matrixContent.push(
                    OperationMatrixView.renderEmptyCell({
                        floor,
                        column,
                    })
                );
            }
        }

        return `
            <div class="operation-matrix__viewport">
                <div
                    class="operation-matrix"
                    data-operation-columns="${block.columns}"
                    style="
                        --operation-matrix-columns:
                        ${block.columns};
                        --operation-min-width:
                        ${56 + block.columns * 144}px;
                    "
                >
                    ${matrixContent.join("")}
                </div>
            </div>
        `;
    }

    static createUnitsByAnchor(
        units,
        blockId
    ) {
        const unitMap =
            new Map();

        units
            .filter(
                (unit) =>
                    unit.blockId ===
                    blockId
            )
            .forEach(
                (unit) => {
                    unitMap.set(
                        OperationMatrixView.getCellKey(
                            unit.anchorFloor,
                            unit.anchorColumn
                        ),
                        unit
                    );
                }
            );

        return unitMap;
    }

    static createOccupiedCellsSet(
        units,
        blockId
    ) {
        const occupiedCells =
            new Set();

        units
            .filter(
                (unit) =>
                    unit.blockId ===
                    blockId
            )
            .forEach(
                (unit) => {
                    for (
                        let floorOffset = 0;
                        floorOffset < unit.rowSpan;
                        floorOffset += 1
                    ) {
                        for (
                            let columnOffset = 0;
                            columnOffset < unit.columnSpan;
                            columnOffset += 1
                        ) {
                            occupiedCells.add(
                                OperationMatrixView.getCellKey(
                                    unit.anchorFloor +
                                        floorOffset,
                                    unit.anchorColumn +
                                        columnOffset
                                )
                            );
                        }
                    }
                }
            );

        return occupiedCells;
    }

    static renderUnit(unit) {
        return `
            <div
                class="operation-matrix__unit"
                data-operation-unit
                data-block="${unit.blockId}"
                data-floor="${unit.anchorFloor}"
                data-code="${unit.displayCode}"
                data-status="${unit.status}"
                data-channel="${unit.channel ?? ""}"
                style="
                    grid-column:
                        span ${unit.columnSpan};

                    grid-row:
                        span ${unit.rowSpan};
                "
            >
                ${UnitCardView.render(
                    unit
                )}
            </div>
        `;
    }

    static renderExcludedCell({
        floor,
        column,
    }) {
        return `
            <div
                class="
                    operation-matrix__cell
                    operation-matrix__cell--excluded
                "
                data-floor="${floor}"
                data-column="${column}"
                aria-hidden="true"
            ></div>
        `;
    }

    static renderEmptyCell({
        floor,
        column,
    }) {
        return `
            <div
                class="
                    operation-matrix__cell
                    operation-matrix__cell--empty
                "
                data-floor="${floor}"
                data-column="${column}"
                aria-hidden="true"
            ></div>
        `;
    }

    static getCellKey(
        floor,
        column
    ) {
        return `${floor}-${column}`;
    }
}
