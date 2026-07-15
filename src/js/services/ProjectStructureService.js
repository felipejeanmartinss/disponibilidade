import {
    BlockLayout,
} from "../models/BlockLayout.js";

export class ProjectStructureService {
    static updatePrimaryBlock(projectConfig, {
        projectName,
        blockName,
        floors,
        columns,
    }) {
        const currentBlock = projectConfig.blocks[0];
        if (!currentBlock) {
            throw new Error("Nenhum bloco foi encontrado.");
        }

        const nextFloors = ProjectStructureService.toInteger(floors, 1, 200);
        const nextColumns = ProjectStructureService.toInteger(columns, 1, 100);

        const excludedCells = currentBlock.excludedCells.filter(
            (cell) => cell.floor <= nextFloors && cell.column <= nextColumns
        );

        const customUnits = currentBlock.customUnits.filter(
            (unit) =>
                unit.anchorFloor + unit.rowSpan - 1 <= nextFloors &&
                unit.anchorColumn + unit.columnSpan - 1 <= nextColumns
        );

        const templateUnits = Array.from(
            { length: nextColumns },
            (_, index) => ({
                column: index + 1,
                displaySuffix: String(index + 1).padStart(2, "0"),
            })
        );

        const updatedBlock = new BlockLayout({
            ...currentBlock.toJSON(),
            name: String(blockName ?? "").trim() || currentBlock.name,
            floors: nextFloors,
            columns: nextColumns,
            excludedCells,
            customUnits,
            typeFloorTemplate: {
                startFloor: 1,
                endFloor: nextFloors,
                units: templateUnits,
            },
        });

        projectConfig.update({
            projectName,
            blocks: [updatedBlock, ...projectConfig.blocks.slice(1)],
        });

        return projectConfig;
    }

    static toInteger(value, minimum, maximum) {
        const number = Number(value);
        if (!Number.isInteger(number) || number < minimum || number > maximum) {
            throw new Error(`Informe um número inteiro entre ${minimum} e ${maximum}.`);
        }
        return number;
    }
}
