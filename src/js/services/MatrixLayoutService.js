export class MatrixLayoutService {
    static excludeCells(
        block,
        selectedCells
    ) {
        MatrixLayoutService.validateBlock(
            block
        );

        const cells =
            MatrixLayoutService.normalizeCells(
                selectedCells
            );

        if (cells.length === 0) {
            throw new Error(
                "Selecione pelo menos uma célula para excluir."
            );
        }

        MatrixLayoutService.ensureCellsAreInsideMatrix(
            block,
            cells
        );

        MatrixLayoutService.ensureCellsDoNotBelongToCustomUnits(
            block,
            cells
        );

        const currentExcludedKeys =
            new Set(
                block.excludedCells.map(
                    (cell) =>
                        block.getCellKey(
                            cell.floor,
                            cell.column
                        )
                )
            );

        cells.forEach(
            (cell) => {
                const cellKey =
                    block.getCellKey(
                        cell.floor,
                        cell.column
                    );

                if (
                    !currentExcludedKeys.has(
                        cellKey
                    )
                ) {
                    block.excludedCells.push({
                        floor:
                            cell.floor,

                        column:
                            cell.column,
                    });

                    currentExcludedKeys.add(
                        cellKey
                    );
                }
            }
        );

        MatrixLayoutService.sortExcludedCells(
            block
        );

        return block;
    }

    static restoreCells(
        block,
        selectedCells
    ) {
        MatrixLayoutService.validateBlock(
            block
        );

        const cells =
            MatrixLayoutService.normalizeCells(
                selectedCells
            );

        if (cells.length === 0) {
            throw new Error(
                "Selecione pelo menos uma célula para restaurar."
            );
        }

        MatrixLayoutService.ensureCellsAreInsideMatrix(
            block,
            cells
        );

        const selectedKeys =
            new Set(
                cells.map(
                    (cell) =>
                        block.getCellKey(
                            cell.floor,
                            cell.column
                        )
                )
            );

        block.excludedCells =
            block.excludedCells.filter(
                (cell) =>
                    !selectedKeys.has(
                        block.getCellKey(
                            cell.floor,
                            cell.column
                        )
                    )
            );

        return block;
    }

    static normalizeCells(
        cells
    ) {
        if (!Array.isArray(cells)) {
            return [];
        }

        const normalizedCells =
            cells
                .map(
                    (cell) => ({
                        floor:
                            Number(
                                cell?.floor
                            ),

                        column:
                            Number(
                                cell?.column
                            ),
                    })
                )
                .filter(
                    (cell) =>
                        Number.isInteger(
                            cell.floor
                        ) &&
                        Number.isInteger(
                            cell.column
                        )
                );

        const uniqueCells =
            new Map();

        normalizedCells.forEach(
            (cell) => {
                uniqueCells.set(
                    `${cell.floor}-${cell.column}`,
                    cell
                );
            }
        );

        return Array.from(
            uniqueCells.values()
        );
    }

    static validateBlock(
        block
    ) {
        if (
            !block ||
            typeof block.getCellKey !==
                "function"
        ) {
            throw new Error(
                "O bloco informado é inválido."
            );
        }
    }

    static ensureCellsAreInsideMatrix(
        block,
        cells
    ) {
        const invalidCell =
            cells.find(
                (cell) =>
                    !block.isCellInsideMatrix(
                        cell.floor,
                        cell.column
                    )
            );

        if (invalidCell) {
            throw new Error(
                `A célula do pavimento ${invalidCell.floor}, coluna ${invalidCell.column}, está fora da matriz.`
            );
        }
    }

    static ensureCellsDoNotBelongToCustomUnits(
        block,
        cells
    ) {
        const customOccupationMap =
            block.getCustomOccupationMap();

        const conflictingCell =
            cells.find(
                (cell) =>
                    customOccupationMap.has(
                        block.getCellKey(
                            cell.floor,
                            cell.column
                        )
                    )
            );

        if (!conflictingCell) {
            return;
        }

        const unitId =
            customOccupationMap.get(
                block.getCellKey(
                    conflictingCell.floor,
                    conflictingCell.column
                )
            );

        const customUnit =
            block.customUnits.find(
                (unit) =>
                    unit.id === unitId
            );

        const unitLabel =
            customUnit?.displayCode ??
            unitId;

        throw new Error(
            `A célula do pavimento ${conflictingCell.floor}, coluna ${conflictingCell.column}, pertence à unidade personalizada ${unitLabel}. Desfaça a unidade antes de excluir essa célula.`
        );
    }

    static sortExcludedCells(
        block
    ) {
        block.excludedCells.sort(
            (
                first,
                second
            ) => {
                if (
                    first.floor !==
                    second.floor
                ) {
                    return (
                        second.floor -
                        first.floor
                    );
                }

                return (
                    first.column -
                    second.column
                );
            }
        );
    }
}