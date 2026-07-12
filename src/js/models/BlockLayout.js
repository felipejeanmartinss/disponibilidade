const UNIT_TYPES = Object.freeze([
    "standard",
    "garden",
    "coverage",
]);

const LAYOUT_TYPES = Object.freeze([
    "single-cell",
    "horizontal-merge",
    "vertical-merge",
    "rectangular-merge",
]);

export class BlockLayout {
    constructor({
        id,
        name,
        floors = 8,
        columns = 8,
        typeFloorTemplate = null,
        customUnits = [],
        excludedCells = [],
    } = {}) {
        this.id = this.normalizeText(
            id,
            "single-block"
        );

        this.name = this.normalizeText(
            name,
            "Bloco Único"
        );

        this.floors =
            this.normalizePositiveInteger(
                floors,
                8,
                1,
                200
            );

        this.columns =
            this.normalizePositiveInteger(
                columns,
                8,
                1,
                100
            );

        this.typeFloorTemplate =
            this.normalizeTypeFloorTemplate(
                typeFloorTemplate
            );

        this.excludedCells =
            this.normalizeExcludedCells(
                excludedCells
            );

        this.customUnits =
            this.normalizeCustomUnits(
                customUnits
            );

        this.validateLayout();
    }

    normalizeText(
        value,
        fallback = ""
    ) {
        const normalized =
            String(value ?? "").trim();

        return normalized || fallback;
    }

    normalizePositiveInteger(
        value,
        fallback,
        minimum = 1,
        maximum = 200
    ) {
        const number =
            Number(value);

        if (
            !Number.isInteger(number) ||
            number < minimum ||
            number > maximum
        ) {
            return fallback;
        }

        return number;
    }

    normalizeTypeFloorTemplate(
        template
    ) {
        const defaultUnits =
            Array.from(
                {
                    length:
                        this.columns,
                },
                (_, index) => {
                    const column =
                        index + 1;

                    return {
                        column,

                        displaySuffix:
                            String(
                                column
                            ).padStart(
                                2,
                                "0"
                            ),
                    };
                }
            );

        const startFloor =
            this.normalizePositiveInteger(
                template?.startFloor,
                1,
                1,
                this.floors
            );

        const endFloor =
            this.normalizePositiveInteger(
                template?.endFloor,
                this.floors,
                startFloor,
                this.floors
            );

        const providedUnits =
            Array.isArray(
                template?.units
            )
                ? template.units
                : defaultUnits;

        const normalizedUnits =
            providedUnits
                .map((unit) => {
                    const column =
                        this.normalizePositiveInteger(
                            unit?.column,
                            1,
                            1,
                            this.columns
                        );

                    return {
                        column,

                        displaySuffix:
                            this.normalizeText(
                                unit
                                    ?.displaySuffix,
                                String(
                                    column
                                ).padStart(
                                    2,
                                    "0"
                                )
                            ),
                    };
                })
                .filter(
                    (
                        unit,
                        index,
                        units
                    ) =>
                        units.findIndex(
                            (item) =>
                                item.column ===
                                unit.column
                        ) === index
                )
                .sort(
                    (first, second) =>
                        first.column -
                        second.column
                );

        return {
            startFloor,
            endFloor,
            units:
                normalizedUnits,
        };
    }

    normalizeExcludedCells(
        cells
    ) {
        if (!Array.isArray(cells)) {
            return [];
        }

        const normalizedCells =
            cells.map((cell) => ({
                floor:
                    this.normalizePositiveInteger(
                        cell?.floor,
                        1,
                        1,
                        this.floors
                    ),

                column:
                    this.normalizePositiveInteger(
                        cell?.column,
                        1,
                        1,
                        this.columns
                    ),
            }));

        return normalizedCells.filter(
            (
                cell,
                index,
                allCells
            ) =>
                allCells.findIndex(
                    (item) =>
                        item.floor ===
                            cell.floor &&
                        item.column ===
                            cell.column
                ) === index
        );
    }

    normalizeCustomUnits(
        units
    ) {
        if (!Array.isArray(units)) {
            return [];
        }

        return units.map(
            (unit, index) => {
                const type =
                    UNIT_TYPES.includes(
                        unit?.type
                    )
                        ? unit.type
                        : "standard";

                const columnSpan =
                    this.normalizePositiveInteger(
                        unit?.columnSpan,
                        1,
                        1,
                        this.columns
                    );

                const rowSpan =
                    this.normalizePositiveInteger(
                        unit?.rowSpan,
                        1,
                        1,
                        this.floors
                    );

                return {
                    id:
                        this.normalizeText(
                            unit?.id,
                            `${this.id}-custom-${
                                index + 1
                            }`
                        ),

                    displayCode:
                        this.normalizeText(
                            unit
                                ?.displayCode,
                            `UN-${
                                index + 1
                            }`
                        ),

                    type,

                    layoutType:
                        this.normalizeLayoutType(
                            unit?.layoutType,
                            columnSpan,
                            rowSpan
                        ),

                    visualVariant:
                        this.normalizeText(
                            unit
                                ?.visualVariant,
                            type === "garden"
                                ? "garden"
                                : "default"
                        ),

                    anchorFloor:
                        this.normalizePositiveInteger(
                            unit
                                ?.anchorFloor,
                            1,
                            1,
                            this.floors
                        ),

                    anchorColumn:
                        this.normalizePositiveInteger(
                            unit
                                ?.anchorColumn,
                            1,
                            1,
                            this.columns
                        ),

                    columnSpan,

                    rowSpan,
                };
            }
        );
    }

    normalizeLayoutType(
        layoutType,
        columnSpan,
        rowSpan
    ) {
        if (
            LAYOUT_TYPES.includes(
                layoutType
            )
        ) {
            return layoutType;
        }

        if (
            columnSpan > 1 &&
            rowSpan > 1
        ) {
            return "rectangular-merge";
        }

        if (columnSpan > 1) {
            return "horizontal-merge";
        }

        if (rowSpan > 1) {
            return "vertical-merge";
        }

        return "single-cell";
    }

    getCellKey(
        floor,
        column
    ) {
        return `${floor}-${column}`;
    }

    isCellInsideMatrix(
        floor,
        column
    ) {
        return (
            floor >= 1 &&
            floor <= this.floors &&
            column >= 1 &&
            column <= this.columns
        );
    }

    isCellExcluded(
        floor,
        column
    ) {
        return this.excludedCells.some(
            (cell) =>
                cell.floor === floor &&
                cell.column === column
        );
    }

    getOccupiedCells(unit) {
        const cells = [];

        for (
            let floorOffset = 0;
            floorOffset <
            unit.rowSpan;
            floorOffset += 1
        ) {
            for (
                let columnOffset = 0;
                columnOffset <
                unit.columnSpan;
                columnOffset += 1
            ) {
                cells.push({
                    floor:
                        unit.anchorFloor +
                        floorOffset,

                    column:
                        unit.anchorColumn +
                        columnOffset,
                });
            }
        }

        return cells;
    }

    validateLayout() {
        const occupationMap =
            new Map();

        const displayCodes =
            new Set();

        this.customUnits.forEach(
            (unit) => {
                if (
                    displayCodes.has(
                        unit.displayCode
                    )
                ) {
                    throw new Error(
                        `O código ${unit.displayCode} está duplicado no bloco ${this.name}.`
                    );
                }

                displayCodes.add(
                    unit.displayCode
                );

                const occupiedCells =
                    this.getOccupiedCells(
                        unit
                    );

                occupiedCells.forEach(
                    (cell) => {
                        if (
                            !this.isCellInsideMatrix(
                                cell.floor,
                                cell.column
                            )
                        ) {
                            throw new Error(
                                `A unidade ${unit.displayCode} ultrapassa os limites do bloco ${this.name}.`
                            );
                        }

                        if (
                            this.isCellExcluded(
                                cell.floor,
                                cell.column
                            )
                        ) {
                            throw new Error(
                                `A unidade ${unit.displayCode} ocupa uma célula excluída: pavimento ${cell.floor}, coluna ${cell.column}.`
                            );
                        }

                        const cellKey =
                            this.getCellKey(
                                cell.floor,
                                cell.column
                            );

                        const existingUnitId =
                            occupationMap.get(
                                cellKey
                            );

                        if (
                            existingUnitId
                        ) {
                            throw new Error(
                                `Existe sobreposição na célula pavimento ${cell.floor}, coluna ${cell.column}.`
                            );
                        }

                        occupationMap.set(
                            cellKey,
                            unit.id
                        );
                    }
                );
            }
        );
    }

    getCustomOccupationMap() {
        const occupationMap =
            new Map();

        this.customUnits.forEach(
            (unit) => {
                this.getOccupiedCells(
                    unit
                ).forEach((cell) => {
                    occupationMap.set(
                        this.getCellKey(
                            cell.floor,
                            cell.column
                        ),
                        unit.id
                    );
                });
            }
        );

        return occupationMap;
    }

    getEstimatedUnitCount() {
        const customOccupationMap =
            this.getCustomOccupationMap();

        let standardUnitCount = 0;

        for (
            let floor =
                this.typeFloorTemplate
                    .startFloor;
            floor <=
            this.typeFloorTemplate
                .endFloor;
            floor += 1
        ) {
            this.typeFloorTemplate
                .units
                .forEach(
                    (templateUnit) => {
                        const cellKey =
                            this.getCellKey(
                                floor,
                                templateUnit
                                    .column
                            );

                        const isAvailable =
                            !this.isCellExcluded(
                                floor,
                                templateUnit
                                    .column
                            ) &&
                            !customOccupationMap
                                .has(cellKey);

                        if (isAvailable) {
                            standardUnitCount +=
                                1;
                        }
                    }
                );
        }

        return (
            standardUnitCount +
            this.customUnits.length
        );
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            floors: this.floors,
            columns: this.columns,

            typeFloorTemplate: {
                startFloor:
                    this
                        .typeFloorTemplate
                        .startFloor,

                endFloor:
                    this
                        .typeFloorTemplate
                        .endFloor,

                units:
                    this
                        .typeFloorTemplate
                        .units
                        .map(
                            (unit) => ({
                                ...unit,
                            })
                        ),
            },

            excludedCells:
                this.excludedCells.map(
                    (cell) => ({
                        ...cell,
                    })
                ),

            customUnits:
                this.customUnits.map(
                    (unit) => ({
                        ...unit,
                    })
                ),
        };
    }
}