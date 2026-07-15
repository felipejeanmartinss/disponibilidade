import {
    UNIT_STATUS_OPTIONS,
} from "../config/statuses.js";

import {
    SALES_CHANNEL_OPTIONS,
} from "../config/channels.js";

const STATUS_CSS_NAMES = Object.freeze({
    available: "available",
    sold: "sold",
    signing: "signing",
    "contract-process": "contract",
    approved: "approved",
    reserved: "reserved",
});

export class AppearanceService {
    static update(
        projectConfig,
        formData
    ) {
        if (
            !projectConfig ||
            typeof formData?.get !== "function"
        ) {
            throw new Error(
                "Os dados de aparência são inválidos."
            );
        }

        const statusColors = {};
        const channelColors = {};
        const channelLabels = {};

        UNIT_STATUS_OPTIONS.forEach((status) => {
            statusColors[status.value] =
                formData.get(
                    `status-color-${status.value}`
                );
        });

        SALES_CHANNEL_OPTIONS.forEach((channel) => {
            channelColors[channel.value] =
                formData.get(
                    `channel-color-${channel.value}`
                );
            channelLabels[channel.value] =
                formData.get(
                    `channel-label-${channel.value}`
                );
        });

        projectConfig.update({
            appearance: {
                ...projectConfig.appearance,
                statusColors,
                channelColors,
                channelLabels,
            },
        });

        return projectConfig;
    }

    static applyToDocument(appearance) {
        if (!appearance || typeof document === "undefined") {
            return;
        }

        const rootStyle =
            document.documentElement.style;

        Object.entries(
            appearance.statusColors
        ).forEach(([status, color]) => {
            const cssName =
                STATUS_CSS_NAMES[status];

            if (!cssName) {
                return;
            }

            rootStyle.setProperty(
                `--status-${cssName}-background`,
                color
            );
            rootStyle.setProperty(
                `--status-${cssName}-text`,
                AppearanceService.getContrastColor(
                    color
                )
            );
        });

        Object.entries(
            appearance.channelColors
        ).forEach(([channel, color]) => {
            rootStyle.setProperty(
                `--channel-${channel}`,
                color
            );
        });
    }

    static createDisplayChannels(
        channels,
        appearance
    ) {
        return channels.map((channel) => ({
            ...channel,
            label:
                appearance.channelLabels?.[
                    channel.value
                ] ?? channel.label,
            color:
                appearance.channelColors?.[
                    channel.value
                ] ?? "#94A3B8",
        }));
    }

    static getContrastColor(color) {
        const normalized = String(color)
            .replace("#", "");
        const red = Number.parseInt(
            normalized.slice(0, 2),
            16
        );
        const green = Number.parseInt(
            normalized.slice(2, 4),
            16
        );
        const blue = Number.parseInt(
            normalized.slice(4, 6),
            16
        );
        const luminance =
            (red * 299 + green * 587 + blue * 114) /
            1000;

        return luminance >= 150
            ? "#0F172A"
            : "#FFFFFF";
    }
}
