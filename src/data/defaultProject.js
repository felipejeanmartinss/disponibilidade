import {
    ProjectConfig,
} from "../js/models/ProjectConfig.js";

export function createDefaultProjectConfig() {
    return new ProjectConfig({
        id:
            "peninsula-collection",

        projectName:
            "Península Collection",

        blocks: [
            {
                id:
                    "single-block",

                name:
                    "Bloco Único",

                floors: 8,
                columns: 8,

                typeFloorTemplate: {
                    startFloor: 1,
                    endFloor: 8,

                    units:
                        Array.from(
                            {
                                length: 8,
                            },
                            (
                                _,
                                index
                            ) => ({
                                column:
                                    index +
                                    1,

                                displaySuffix:
                                    String(
                                        index +
                                            1
                                    ).padStart(
                                        2,
                                        "0"
                                    ),
                            })
                        ),
                },

                /*
                 * Células sem unidade.
                 * Usado para empreendimentos
                 * escalonados, recuos ou vazios.
                 */
                excludedCells: [
                    /*
                    {
                        floor: 8,
                        column: 8,
                    },
                    */
                ],

                /*
                 * Toda customização substitui
                 * as unidades tipo das células
                 * que ela ocupa.
                 */
                customUnits: [
                    /*
                    {
                        id:
                            "garden-101",

                        displayCode:
                            "101",

                        type:
                            "garden",

                        layoutType:
                            "single-cell",

                        visualVariant:
                            "garden",

                        anchorFloor: 1,
                        anchorColumn: 1,

                        columnSpan: 1,
                        rowSpan: 1,
                    },

                    {
                        id:
                            "coverage-801",

                        displayCode:
                            "801",

                        type:
                            "coverage",

                        layoutType:
                            "horizontal-merge",

                        visualVariant:
                            "default",

                        anchorFloor: 8,
                        anchorColumn: 1,

                        columnSpan: 7,
                        rowSpan: 1,
                    },

                    {
                        id:
                            "remaining-802",

                        displayCode:
                            "802",

                        type:
                            "standard",

                        layoutType:
                            "single-cell",

                        visualVariant:
                            "default",

                        anchorFloor: 8,
                        anchorColumn: 8,

                        columnSpan: 1,
                        rowSpan: 1,
                    },
                    */
                ],
            },
        ],

        publicMapSettings: {
            pageCount: 1,
            rotationSeconds: 15,
        },

        appearance: {
            channelIndicatorSize:
                16,

            showStatusLegend:
                true,

            showChannelLegend:
                true,

            gardenBorderColor:
                "#15803D",

            statusColors: {
                available:
                    "#DCDCDC",

                sold:
                    "#0043C8",

                signing:
                    "#9664C8",

                "contract-process":
                    "#50AAE1",

                approved:
                    "#EBB92D",

                reserved:
                    "#FFFF00",
            },

            channelColors: {
                "tegra-salao":
                    "#0057B8",

                "tegra-parcerias":
                    "#008F68",

                "lopes-rio":
                    "#D6262F",

                "somma-rio":
                    "#00205F",

                evs:
                    "#7C3AED",
            },
        },
    });
}
