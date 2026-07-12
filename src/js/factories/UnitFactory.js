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
        if (!projectConfig) {
            throw new Error(
                "UnitFactory precisa receber uma configuração de empreendimento."
            );
        }

        if (
            !Array.isArray(
                projectConfig.blocks
            )
        ) {
            throw new Error(
                "A configuração precisa possuir uma lista de blocos."
            );
        }

        const units = [];

        projectConfig.blocks.forEach(
            (block) => {
                const blockUnits =
                    UnitFactory.createBlockUnits(
                        block
                    );

                units.push(
                    ...blockUnits
                );
            }
        );

        return units;
    }

    static createBlockUnits(block) {
        const units = [];

        for (
            let floor = block.floors;
            floor >= 1;
            floor -= 1
        ) {
            for (
                let position = 1;
                position <=
                    block.unitsPerFloor;
                position += 1
            ) {
                const unitNumber =
                    UnitFactory.createUnitNumber(
                        floor,
                        position,
                        block.unitsPerFloor
                    );

                units.push(
                    new Unit({
                        id:
                            `${block.id}-${unitNumber}`,

                        number:
                            unitNumber,

                        block:
                            block.name,

                        status:
                            UNIT_STATUS.AVAILABLE,

                        channel:
                            null,

                        partner:
                            "",

                        manager:
                            "",

                        broker:
                            "",

                        notes:
                            "",
                    })
                );
            }
        }

        return units;
    }

    static createUnitNumber(
        floor,
        position,
        unitsPerFloor
    ) {
        const positionDigits =
            Math.max(
                2,
                String(
                    unitsPerFloor
                ).length
            );

        const formattedPosition =
            String(position).padStart(
                positionDigits,
                "0"
            );

        return Number(
            `${floor}${formattedPosition}`
        );
    }
}