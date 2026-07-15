import {
    UNIT_TYPE,
    getUnitTypeByValue,
} from "../config/unitTypes.js";

export class MatrixLayoutService {
    static mergeCells(
        block,
        selectedCells,
        direction
    ) {
        MatrixLayoutService.validateBlock(block);

        const cells =
            MatrixLayoutService.normalizeCells(
                selectedCells
            );

        if (cells.length < 2) {
            throw new Error(
                "Selecione pelo menos duas células para unificar."
            );
        }

        MatrixLayoutService.ensureCellsAreInsideMatrix(
            block,
            cells
        );
        MatrixLayoutService.ensureCellsAreAvailable(
            block,
            cells
        );
        MatrixLayoutService.ensureCellsDoNotBelongToCustomUnits(
            block,
            cells
        );

        const geometry =
            MatrixLayoutService.getMergeGeometry(
                cells,
                direction
            );

        const displayCode =
            MatrixLayoutService.getStandardDisplayCode(
                block,
                geometry.anchorFloor,
                geometry.anchorColumn
            );

        block.customUnits.push({
            id:
                `${block.id}-type-${geometry.anchorFloor}-${geometry.anchorColumn}`,
            displayCode,
            type: UNIT_TYPE.STANDARD,
            layoutType:
                direction === "horizontal"
                    ? "horizontal-merge"
                    : "vertical-merge",
            visualVariant: "default",
            anchorFloor: geometry.anchorFloor,
            anchorColumn: geometry.anchorColumn,
            columnSpan: geometry.columnSpan,
            rowSpan: geometry.rowSpan,
        });

        block.validateLayout();
        return block;
    }

    static unmergeUnit(
        block,
        selectedCells
    ) {
        MatrixLayoutService.validateBlock(block);

        const customUnit =
            MatrixLayoutService.getSingleSelectedCustomUnit(
                block,
                selectedCells
            );

        if (
            customUnit.columnSpan === 1 &&
            customUnit.rowSpan === 1
        ) {
            throw new Error(
                "A unidade selecionada não está unificada. Para voltar ao tipo padrão, use Aplicar tipo."
            );
        }

        block.customUnits =
            block.customUnits.filter(
                (unit) => unit.id !== customUnit.id
            );

        block.validateLayout();
        return block;
    }

    static applyUnitType(
        block,
        selectedCells,
        requestedType
    ) {
        MatrixLayoutService.validateBlock(block);

        const cells =
            MatrixLayoutService.normalizeCells(
                selectedCells
            );

        if (cells.length === 0) {
            throw new Error(
                "Selecione uma unidade para atualizar o tipo."
            );
        }

        const type =
            getUnitTypeByValue(requestedType).value;
        const selectedCustomUnits =
            MatrixLayoutService.getSelectedCustomUnits(
                block,
                cells
            );

        if (selectedCustomUnits.length > 1) {
            throw new Error(
                "Selecione apenas uma unidade por vez para atualizar o tipo."
            );
        }

        if (selectedCustomUnits.length === 1) {
            const unit = selectedCustomUnits[0];

            MatrixLayoutService.ensureSelectionMatchesUnit(
                block,
                cells,
                unit
            );

            if (
                type === UNIT_TYPE.STANDARD &&
                unit.columnSpan === 1 &&
                unit.rowSpan === 1
            ) {
                block.customUnits =
                    block.customUnits.filter(
                        (item) => item.id !== unit.id
                    );
            } else {
                unit.type = type;
                unit.visualVariant =
                    MatrixLayoutService.getVisualVariant(type);
            }

            block.validateLayout();
            return block;
        }

        if (cells.length !== 1) {
            throw new Error(
                "Para atualizar várias células, unifique-as primeiro."
            );
        }

        const [cell] = cells;
        MatrixLayoutService.ensureCellsAreInsideMatrix(
            block,
            cells
        );
        MatrixLayoutService.ensureCellsAreAvailable(
            block,
            cells
        );

        if (type === UNIT_TYPE.STANDARD) {
            return block;
        }

        const displayCode =
            MatrixLayoutService.getStandardDisplayCode(
                block,
                cell.floor,
                cell.column
            );

        block.customUnits.push({
            id:
                `${block.id}-type-${cell.floor}-${cell.column}`,
            displayCode,
            type,
            layoutType: "single-cell",
            visualVariant:
                MatrixLayoutService.getVisualVariant(type),
            anchorFloor: cell.floor,
            anchorColumn: cell.column,
            columnSpan: 1,
            rowSpan: 1,
        });

        block.validateLayout();
        return block;
    }

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

    static ensureCellsAreAvailable(
        block,
        cells
    ) {
        const unavailableCell = cells.find(
            (cell) =>
                block.isCellExcluded(
                    cell.floor,
                    cell.column
                ) ||
                !MatrixLayoutService.hasStandardUnitAt(
                    block,
                    cell.floor,
                    cell.column
                )
        );

        if (unavailableCell) {
            throw new Error(
                `A célula do pavimento ${unavailableCell.floor}, coluna ${unavailableCell.column}, não contém uma unidade disponível para esta ação.`
            );
        }
    }

    static hasStandardUnitAt(
        block,
        floor,
        column
    ) {
        const template = block.typeFloorTemplate;

        return (
            floor >= template.startFloor &&
            floor <= template.endFloor &&
            template.units.some(
                (unit) => unit.column === column
            )
        );
    }

    static getStandardDisplayCode(
        block,
        floor,
        column
    ) {
        if (
            !MatrixLayoutService.hasStandardUnitAt(
                block,
                floor,
                column
            )
        ) {
            throw new Error(
                "A célula selecionada não possui uma unidade tipo."
            );
        }

        const templateUnit =
            block.typeFloorTemplate.units.find(
                (unit) => unit.column === column
            );

        return `${floor}${templateUnit.displaySuffix}`;
    }

    static getMergeGeometry(
        cells,
        direction
    ) {
        const floors = cells.map((cell) => cell.floor);
        const columns = cells.map((cell) => cell.column);
        const uniqueFloors = new Set(floors);
        const uniqueColumns = new Set(columns);

        if (direction === "horizontal") {
            if (
                uniqueFloors.size !== 1 ||
                !MatrixLayoutService.isConsecutive(columns)
            ) {
                throw new Error(
                    "A unificação horizontal exige células consecutivas no mesmo pavimento."
                );
            }

            return {
                anchorFloor: floors[0],
                anchorColumn: Math.min(...columns),
                columnSpan: cells.length,
                rowSpan: 1,
            };
        }

        if (direction === "vertical") {
            if (
                uniqueColumns.size !== 1 ||
                !MatrixLayoutService.isConsecutive(floors)
            ) {
                throw new Error(
                    "A unificação vertical exige células consecutivas na mesma coluna."
                );
            }

            return {
                anchorFloor: Math.max(...floors),
                anchorColumn: columns[0],
                columnSpan: 1,
                rowSpan: cells.length,
            };
        }

        throw new Error(
            "A direção de unificação é inválida."
        );
    }

    static isConsecutive(values) {
        const sorted = Array.from(new Set(values))
            .sort((first, second) => first - second);

        return (
            sorted.length === values.length &&
            sorted.every(
                (value, index) =>
                    index === 0 ||
                    value === sorted[index - 1] + 1
            )
        );
    }

    static getSelectedCustomUnits(
        block,
        selectedCells
    ) {
        const cells =
            MatrixLayoutService.normalizeCells(
                selectedCells
            );
        const occupationMap =
            block.getCustomOccupationMap();
        const selectedIds = new Set();

        cells.forEach((cell) => {
            const unitId = occupationMap.get(
                block.getCellKey(
                    cell.floor,
                    cell.column
                )
            );

            if (unitId) {
                selectedIds.add(unitId);
            }
        });

        return block.customUnits.filter(
            (unit) => selectedIds.has(unit.id)
        );
    }

    static getSingleSelectedCustomUnit(
        block,
        selectedCells
    ) {
        const units =
            MatrixLayoutService.getSelectedCustomUnits(
                block,
                selectedCells
            );

        if (units.length !== 1) {
            throw new Error(
                "Selecione uma única unidade personalizada para desfazer a unificação."
            );
        }

        MatrixLayoutService.ensureSelectionMatchesUnit(
            block,
            MatrixLayoutService.normalizeCells(
                selectedCells
            ),
            units[0]
        );

        return units[0];
    }

    static ensureSelectionMatchesUnit(
        block,
        selectedCells,
        unit
    ) {
        const selectedKeys = new Set(
            selectedCells.map(
                (cell) =>
                    block.getCellKey(
                        cell.floor,
                        cell.column
                    )
            )
        );
        const occupiedCells =
            block.getOccupiedCells(unit);

        const isExactSelection =
            selectedKeys.size === occupiedCells.length &&
            occupiedCells.every(
                (cell) =>
                    selectedKeys.has(
                        block.getCellKey(
                            cell.floor,
                            cell.column
                        )
                    )
            );

        if (!isExactSelection) {
            throw new Error(
                "Selecione somente uma unidade completa para executar esta ação."
            );
        }
    }

    static getVisualVariant(type) {
        if (type === UNIT_TYPE.GARDEN) {
            return "garden";
        }

        if (type === UNIT_TYPE.COVERAGE_LINEAR) {
            return "coverage-linear";
        }

        if (type === UNIT_TYPE.COVERAGE_DUPLEX) {
            return "coverage-duplex";
        }

        return "default";
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
