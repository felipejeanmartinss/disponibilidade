import {
    BlockLayout,
} from "./BlockLayout.js";

const DEFAULT_STATUS_COLORS =
    Object.freeze({
        available: "#DCDCDC",
        sold: "#0043C8",
        signing: "#9664C8",
        "contract-process":
            "#50AAE1",
        approved: "#EBB92D",
        reserved: "#FFFF00",
    });

const DEFAULT_CHANNEL_COLORS =
    Object.freeze({
        "tegra-sales": "#0057B8",
        "tegra-partnerships":
            "#008F68",
        "lopes-rio": "#D6262F",
        "somma-rio": "#00205F",
        evs: "#7C3AED",
    });

const DEFAULT_APPEARANCE =
    Object.freeze({
        channelIndicatorSize: 16,
        showStatusLegend: true,
        showChannelLegend: true,
        gardenBorderColor:
            "#15803D",

        statusColors:
            DEFAULT_STATUS_COLORS,

        channelColors:
            DEFAULT_CHANNEL_COLORS,
    });

export class ProjectConfig {
    constructor({
        id = "default-project",
        projectName =
            "Península Collection",
        blocks = [],
        appearance =
            DEFAULT_APPEARANCE,
    } = {}) {
        this.id =
            this.normalizeText(
                id,
                "default-project"
            );

        this.projectName =
            this.normalizeText(
                projectName,
                "Empreendimento"
            );

        this.blocks =
            this.normalizeBlocks(
                blocks
            );

        this.appearance =
            this.normalizeAppearance(
                appearance
            );
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
            !Number.isInteger(
                number
            ) ||
            number < minimum ||
            number > maximum
        ) {
            return fallback;
        }

        return number;
    }

    normalizeBoolean(
        value,
        fallback
    ) {
        return typeof value ===
            "boolean"
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

        const isValid =
            /^#[0-9A-F]{6}$/.test(
                normalizedColor
            );

        return isValid
            ? normalizedColor
            : fallback;
    }

    normalizeBlocks(
        blocks
    ) {
        if (
            !Array.isArray(blocks) ||
            blocks.length === 0
        ) {
            return [
                new BlockLayout(),
            ];
        }

        return blocks.map(
            (block) =>
                block instanceof
                BlockLayout
                    ? block
                    : new BlockLayout(
                          block
                      )
        );
    }

    normalizeColorMap(
        providedColors,
        defaultColors
    ) {
        const colors = {};

        Object.entries(
            defaultColors
        ).forEach(
            ([key, defaultColor]) => {
                colors[key] =
                    this.normalizeColor(
                        providedColors?.[
                            key
                        ],
                        defaultColor
                    );
            }
        );

        return colors;
    }

    normalizeAppearance(
        appearance
    ) {
        return {
            channelIndicatorSize:
                this
                    .normalizePositiveInteger(
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
                    true
                ),

            showChannelLegend:
                this.normalizeBoolean(
                    appearance
                        ?.showChannelLegend,
                    true
                ),

            gardenBorderColor:
                this.normalizeColor(
                    appearance
                        ?.gardenBorderColor,
                    DEFAULT_APPEARANCE
                        .gardenBorderColor
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
            (total, block) =>
                total +
                block
                    .getEstimatedUnitCount(),
            0
        );
    }

    update({
        projectName =
            this.projectName,
        blocks = this.blocks,
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
                    (block) =>
                        block.toJSON()
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

                gardenBorderColor:
                    this.appearance
                        .gardenBorderColor,

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