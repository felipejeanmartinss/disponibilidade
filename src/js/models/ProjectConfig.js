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
        "tegra-salao": "#0057B8",
        "tegra-parcerias":
            "#008F68",
        "lopes-rio": "#D6262F",
        "somma-rio": "#00205F",
        evs: "#7C3AED",
    });

const DEFAULT_CHANNEL_LABELS =
    Object.freeze({
        "tegra-salao": "Tegra Vendas - Salão",
        "tegra-parcerias": "Tegra Vendas - Parcerias",
        "lopes-rio": "Lopes Rio",
        "somma-rio": "Somma Rio",
        evs: "EV's",
    });

const DEFAULT_CHANNEL_SHORT_LABELS =
    Object.freeze({
        "tegra-salao": "TEGRA",
        "tegra-parcerias": "PARCERIAS",
        "lopes-rio": "LOPES",
        "somma-rio": "SOMMA",
        evs: "EV'S",
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

        channelLabels:
            DEFAULT_CHANNEL_LABELS,

        channelShortLabels:
            DEFAULT_CHANNEL_SHORT_LABELS,

        customStatuses: [],

        customChannels: [],
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

        Object.entries(providedColors ?? {}).forEach(
            ([key, color]) => {
                if (!(key in colors) && /^[a-z0-9-]+$/.test(key)) {
                    colors[key] = this.normalizeColor(
                        color,
                        "#64748B"
                    );
                }
            }
        );

        return colors;
    }

    normalizeTextMap(
        providedTexts,
        defaultTexts
    ) {
        const texts = {};

        Object.entries(defaultTexts).forEach(
            ([key, defaultText]) => {
                texts[key] = this.normalizeText(
                    providedTexts?.[key],
                    defaultText
                );
            }
        );

        Object.entries(providedTexts ?? {}).forEach(
            ([key, value]) => {
                if (!(key in texts) && /^[a-z0-9-]+$/.test(key)) {
                    texts[key] = this.normalizeText(value, key);
                }
            }
        );

        return texts;
    }

    normalizeCustomStatuses(statuses) {
        if (!Array.isArray(statuses)) {
            return [];
        }

        return statuses
            .map((status) => ({
                value: String(status?.value ?? "")
                    .trim()
                    .toLowerCase(),
                label: String(status?.label ?? "").trim(),
            }))
            .filter((status) =>
                /^[a-z0-9-]+$/.test(status.value) &&
                status.label
            );
    }

    normalizeCustomChannels(channels) {
        if (!Array.isArray(channels)) {
            return [];
        }

        return channels
            .map((channel) => ({
                value: String(channel?.value ?? "")
                    .trim()
                    .toLowerCase(),
                label: String(channel?.label ?? "").trim(),
                shortLabel: String(
                    channel?.shortLabel ?? channel?.label ?? ""
                ).trim(),
                logoPath: String(channel?.logoPath ?? "").trim(),
            }))
            .filter((channel) =>
                /^[a-z0-9-]+$/.test(channel.value) &&
                channel.label &&
                channel.shortLabel
            );
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

            channelLabels:
                this.normalizeTextMap(
                    appearance
                        ?.channelLabels,
                    DEFAULT_CHANNEL_LABELS
                ),

            channelShortLabels:
                this.normalizeTextMap(
                    appearance
                        ?.channelShortLabels,
                    DEFAULT_CHANNEL_SHORT_LABELS
                ),

            customStatuses:
                this.normalizeCustomStatuses(
                    appearance?.customStatuses
                ),

            customChannels:
                this.normalizeCustomChannels(
                    appearance?.customChannels
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

                channelLabels: {
                    ...this.appearance
                        .channelLabels,
                },

                channelShortLabels: {
                    ...this.appearance
                        .channelShortLabels,
                },

                customStatuses:
                    this.appearance.customStatuses.map(
                        (status) => ({ ...status })
                    ),

                customChannels:
                    this.appearance.customChannels.map(
                        (channel) => ({ ...channel })
                    ),
            },
        };
    }

    static createDefault() {
        return new ProjectConfig();
    }
}
