const DEFAULT_STATUS_COLORS = Object.freeze({
    available: "#DCDCDC",
    sold: "#0043C8",
    signing: "#9664C8",
    "contract-process": "#50AAE1",
    approved: "#EBB92D",
    reserved: "#FFFF00",
});

const DEFAULT_CHANNEL_COLORS = Object.freeze({
    "tegra-sales": "#0057B8",
    "tegra-partnerships": "#008F68",
    "lopes-rio": "#D6262F",
    "somma-rio": "#00205F",
    evs: "#7C3AED",
});

const DEFAULT_APPEARANCE = Object.freeze({
    channelIndicatorSize: 16,
    showStatusLegend: true,
    showChannelLegend: true,
    statusColors: DEFAULT_STATUS_COLORS,
    channelColors: DEFAULT_CHANNEL_COLORS,
});

const DEFAULT_BLOCKS = Object.freeze([
    Object.freeze({
        id: "single-block",
        name: "Bloco Único",
        floors: 8,
        unitsPerFloor: 8,
    }),
]);

export class ProjectConfig {
    constructor({
        id = "default-project",
        projectName = "Península Collection",
        blocks = DEFAULT_BLOCKS,
        appearance = DEFAULT_APPEARANCE,
    } = {}) {
        this.id = this.normalizeText(
            id,
            "default-project"
        );

        this.projectName = this.normalizeText(
            projectName,
            "Empreendimento"
        );

        this.blocks =
            this.normalizeBlocks(blocks);

        this.appearance =
            this.normalizeAppearance(
                appearance
            );
    }

    normalizeText(
        value,
        fallback = ""
    ) {
        const normalizedValue =
            String(value ?? "").trim();

        return normalizedValue || fallback;
    }

    normalizePositiveInteger(
        value,
        fallback,
        minimum = 1,
        maximum = 200
    ) {
        const numericValue =
            Number(value);

        if (
            !Number.isInteger(numericValue) ||
            numericValue < minimum ||
            numericValue > maximum
        ) {
            return fallback;
        }

        return numericValue;
    }

    normalizeBoolean(
        value,
        fallback
    ) {
        return typeof value === "boolean"
            ? value
            : fallback;
    }

    normalizeColor(
        value,
        fallback
    ) {
        const normalizedColor =
            String(value ?? "")
                .trim()
                .toUpperCase();

        const isValidHexColor =
            /^#[0-9A-F]{6}$/.test(
                normalizedColor
            );

        return isValidHexColor
            ? normalizedColor
            : fallback;
    }

    normalizeBlocks(blocks) {
        if (
            !Array.isArray(blocks) ||
            blocks.length === 0
        ) {
            return DEFAULT_BLOCKS.map(
                (block) => ({
                    ...block,
                })
            );
        }

        return blocks.map(
            (block, index) => {
                const fallbackId =
                    `block-${index + 1}`;

                const fallbackName =
                    `Bloco ${index + 1}`;

                return {
                    id: this.normalizeText(
                        block?.id,
                        fallbackId
                    ),

                    name: this.normalizeText(
                        block?.name,
                        fallbackName
                    ),

                    floors:
                        this.normalizePositiveInteger(
                            block?.floors,
                            1,
                            1,
                            200
                        ),

                    unitsPerFloor:
                        this.normalizePositiveInteger(
                            block?.unitsPerFloor,
                            1,
                            1,
                            100
                        ),
                };
            }
        );
    }

    normalizeColorMap(
        providedColors,
        defaultColors
    ) {
        const normalizedColors = {};

        Object.entries(
            defaultColors
        ).forEach(
            ([key, defaultColor]) => {
                normalizedColors[key] =
                    this.normalizeColor(
                        providedColors?.[key],
                        defaultColor
                    );
            }
        );

        return normalizedColors;
    }

    normalizeAppearance(
        appearance
    ) {
        return {
            channelIndicatorSize:
                this.normalizePositiveInteger(
                    appearance
                        ?.channelIndicatorSize,
                    DEFAULT_APPEARANCE
                        .channelIndicatorSize,
                    8,
                    32
                ),

            showStatusLegend:
                this.normalizeBoolean(
                    appearance
                        ?.showStatusLegend,
                    DEFAULT_APPEARANCE
                        .showStatusLegend
                ),

            showChannelLegend:
                this.normalizeBoolean(
                    appearance
                        ?.showChannelLegend,
                    DEFAULT_APPEARANCE
                        .showChannelLegend
                ),

            statusColors:
                this.normalizeColorMap(
                    appearance
                        ?.statusColors,
                    DEFAULT_STATUS_COLORS
                ),

            channelColors:
                this.normalizeColorMap(
                    appearance
                        ?.channelColors,
                    DEFAULT_CHANNEL_COLORS
                ),
        };
    }

    getTotalUnits() {
        return this.blocks.reduce(
            (total, block) => {
                return (
                    total +
                    block.floors *
                        block.unitsPerFloor
                );
            },
            0
        );
    }

    update({
        projectName =
            this.projectName,

        blocks =
            this.blocks,

        appearance =
            this.appearance,
    } = {}) {
        this.projectName =
            this.normalizeText(
                projectName,
                this.projectName
            );

        this.blocks =
            this.normalizeBlocks(
                blocks
            );

        this.appearance =
            this.normalizeAppearance(
                appearance
            );

        return this;
    }

    toJSON() {
        return {
            id: this.id,

            projectName:
                this.projectName,

            blocks:
                this.blocks.map(
                    (block) => ({
                        ...block,
                    })
                ),

            appearance: {
                channelIndicatorSize:
                    this.appearance
                        .channelIndicatorSize,

                showStatusLegend:
                    this.appearance
                        .showStatusLegend,

                showChannelLegend:
                    this.appearance
                        .showChannelLegend,

                statusColors: {
                    ...this.appearance
                        .statusColors,
                },

                channelColors: {
                    ...this.appearance
                        .channelColors,
                },
            },
        };
    }

    static createDefault() {
        return new ProjectConfig();
    }
}