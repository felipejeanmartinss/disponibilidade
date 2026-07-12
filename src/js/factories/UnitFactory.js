import {
    UNIT_STATUS,
} from "../config/statuses.js";

import {
    Unit,
} from "../models/Unit.js";

export class UnitFactory {
    static createFromProjectConfig(
        projectConfig
    ) {
        if (
            !projectConfig ||
            !Array.isArray(
                projectConfig.blocks
            )
        ) {
            throw new Error(
                "A configuração do empreendimento é inválida."
            );
        }

        return projectConfig.blocks
            .flatMap(
                (block) =>
                    UnitFactory
                        .createBlockUnits(
                            block
                        )
            );
    }

    static createBlockUnits(
        block
    ) {
        const standardUnits =
            UnitFactory
                .createStandardUnits(
                    block
                );

        const customUnits =
            UnitFactory
                .createCustomUnits(
                    block
                );

        return [
            ...standardUnits,
            ...customUnits,
        ].sort(
            (first, second) => {
                if (
                    first.anchorFloor !==
                    second.anchorFloor
                ) {
                    return (
                        second
                            .anchorFloor -
                        first
                            .anchorFloor
                    );
                }

                return (
                    first
                        .anchorColumn -
                    second
                        .anchorColumn
                );
            }
        );
    }

    static createStandardUnits(
        block
    ) {
        const units = [];

        const customOccupation =
            block
                .getCustomOccupationMap();

        for (
            let floor =
                block
                    .typeFloorTemplate
                    .endFloor;
            floor >=
            block
                .typeFloorTemplate
                .startFloor;
            floor -= 1
        ) {
            block
                .typeFloorTemplate
                .units
                .forEach(
                    (
                        templateUnit
                    ) => {
                        const column =
                            templateUnit
                                .column;

                        const cellKey =
                            block.getCellKey(
                                floor,
                                column
                            );

                        const isExcluded =
                            block.isCellExcluded(
                                floor,
                                column
                            );

                        const isReplaced =
                            customOccupation
                                .has(cellKey);

                        if (
                            isExcluded ||
                            isReplaced
                        ) {
                            return;
                        }

                        const displayCode =
                            `${floor}${templateUnit.displaySuffix}`;

                        units.push(
                            new Unit({
                                id:
                                    `${block.id}-type-${floor}-${column}`,

                                displayCode,

                                block:
                                    block.name,

                                blockId:
                                    block.id,

                                type:
                                    "standard",

                                layoutType:
                                    "single-cell",

                                visualVariant:
                                    "default",

                                anchorFloor:
                                    floor,

                                anchorColumn:
                                    column,

                                columnSpan:
                                    1,

                                rowSpan:
                                    1,

                                status:
                                    UNIT_STATUS.AVAILABLE,
                            })
                        );
                    }
                );
        }

        return units;
    }

    static createCustomUnits(
        block
    ) {
        return block.customUnits.map(
            (customUnit) =>
                new Unit({
                    id:
                        customUnit.id,

                    displayCode:
                        customUnit
                            .displayCode,

                    block:
                        block.name,

                    blockId:
                        block.id,

                    type:
                        customUnit.type,

                    layoutType:
                        customUnit
                            .layoutType,

                    visualVariant:
                        customUnit
                            .visualVariant,

                    anchorFloor:
                        customUnit
                            .anchorFloor,

                    anchorColumn:
                        customUnit
                            .anchorColumn,

                    columnSpan:
                        customUnit
                            .columnSpan,

                    rowSpan:
                        customUnit
                            .rowSpan,

                    status:
                        UNIT_STATUS
                            .AVAILABLE,
                })
        );
    }
}