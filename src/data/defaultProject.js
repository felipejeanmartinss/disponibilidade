import {
    ProjectConfig,
} from "../js/models/ProjectConfig.js";

export function createDefaultProjectConfig() {
    return new ProjectConfig({
        id: "peninsula-collection",

        projectName:
            "Península Collection",

        blocks: [
            {
                id: "single-block",
                name: "Bloco Único",
                floors: 8,
                unitsPerFloor: 8,
            },
        ],

        appearance: {
            channelIndicatorSize: 16,

            showStatusLegend: true,
            showChannelLegend: true,

            statusColors: {
                available: "#DCDCDC",
                sold: "#0043C8",
                signing: "#9664C8",
                "contract-process": "#50AAE1",
                approved: "#EBB92D",
                reserved: "#FFFF00",
            },

            channelColors: {
                "tegra-sales": "#0057B8",
                "tegra-partnerships": "#008F68",
                "lopes-rio": "#D6262F",
                "somma-rio": "#00205F",
                evs: "#7C3AED",
            },
        },
    });
}