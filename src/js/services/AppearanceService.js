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
        const channelShortLabels = {};

        const statuses =
            AppearanceService.createDisplayStatuses(
                UNIT_STATUS_OPTIONS,
                projectConfig.appearance
            );

        const channels =
            AppearanceService.createDisplayChannels(
                SALES_CHANNEL_OPTIONS,
                projectConfig.appearance
            );

        statuses.forEach((status) => {
            statusColors[status.value] =
                formData.get(
                    `status-color-${status.value}`
                );
        });

        channels.forEach((channel) => {
            channelColors[channel.value] =
                formData.get(
                    `channel-color-${channel.value}`
                );
            channelLabels[channel.value] =
                formData.get(
                    `channel-label-${channel.value}`
                );
            channelShortLabels[channel.value] =
                formData.get(
                    `channel-short-label-${channel.value}`
                );
        });

        const customStatuses = [
            ...projectConfig.appearance.customStatuses,
        ];
        const customChannels = [
            ...projectConfig.appearance.customChannels,
        ];

        const newStatusLabel = String(
            formData.get("new-status-label") ?? ""
        ).trim();

        if (newStatusLabel) {
            const value = AppearanceService.createUniqueValue(
                newStatusLabel,
                statuses.map((status) => status.value)
            );
            customStatuses.push({ value, label: newStatusLabel });
            statusColors[value] =
                formData.get("new-status-color") || "#64748B";
        }

        const newChannelLabel = String(
            formData.get("new-channel-label") ?? ""
        ).trim();

        if (newChannelLabel) {
            const value = AppearanceService.createUniqueValue(
                newChannelLabel,
                channels.map((channel) => channel.value)
            );
            const shortLabel = String(
                formData.get("new-channel-short-label") ||
                    newChannelLabel
            ).trim();

            customChannels.push({
                value,
                label: newChannelLabel,
                shortLabel,
                logoPath: "",
            });
            channelColors[value] =
                formData.get("new-channel-color") || "#64748B";
            channelLabels[value] = newChannelLabel;
            channelShortLabels[value] = shortLabel;
        }

        projectConfig.update({
            appearance: {
                ...projectConfig.appearance,
                statusColors,
                channelColors,
                channelLabels,
                channelShortLabels,
                customStatuses,
                customChannels,
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
        const allChannels = [
            ...channels,
            ...(appearance.customChannels ?? []),
        ];

        return allChannels.map((channel) => ({
            ...channel,
            label:
                appearance.channelLabels?.[
                    channel.value
                ] ?? channel.label,
            shortLabel:
                appearance.channelShortLabels?.[
                    channel.value
                ] ?? channel.shortLabel,
            color:
                appearance.channelColors?.[
                    channel.value
                ] ?? "#94A3B8",
        }));
    }

    static createDisplayStatuses(
        statuses,
        appearance
    ) {
        return [
            ...statuses,
            ...(appearance.customStatuses ?? []),
        ].map((status) => {
            const color =
                appearance.statusColors?.[status.value] ??
                "#64748B";

            return {
                ...status,
                color,
                textColor:
                    AppearanceService.getContrastColor(color),
            };
        });
    }

    static createUniqueValue(label, existingValues) {
        const base = String(label)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "item";

        let value = base;
        let suffix = 2;

        while (existingValues.includes(value)) {
            value = `${base}-${suffix}`;
            suffix += 1;
        }

        return value;
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
