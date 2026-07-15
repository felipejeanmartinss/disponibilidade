import {
    UNIT_STATUS,
    getStatusByValue,
} from "../config/statuses.js";

import {
    getChannelByValue,
} from "../config/channels.js";

import {
    getUnitTypeByValue,
} from "../config/unitTypes.js";

import {
    escapeHtml,
} from "../utils/html.js";

const TIMED_STATUSES = new Set([
    UNIT_STATUS.RESERVED,
    UNIT_STATUS.APPROVED,
    UNIT_STATUS.CONTRACT_PROCESS,
    UNIT_STATUS.SIGNING,
]);

export class UnitCardView {
    static render(
        unit,
        channels = null
    ) {
        const status = getStatusByValue(unit.status);
        const channel = unit.channel
            ? channels?.find(
                (item) =>
                    item.value === unit.channel
            ) ?? getChannelByValue(unit.channel)
            : null;
        const unitType = getUnitTypeByValue(
            unit.type
        );
        const displayCode = String(unit.displayCode ?? unit.number);

        const channelIndicator = channel
            ? `
                <span class="unit-card__channel-logo">
                    <img src="${channel.logoPath}" alt="${escapeHtml(channel.label)}">
                </span>
            `
            : "";

        const timerValue = UnitCardView.getTimerValue(unit);
        const timer = timerValue
            ? `
                <span class="unit-card__timer" data-status-timer
                    data-started-at="${unit.statusChangedAt}" aria-label="Tempo no status">
                    ${timerValue}
                </span>
            `
            : "";

        return `
            <button class="unit-card ${UnitCardView.getVariantClass(unit.visualVariant)}"
                type="button" data-unit="${displayCode}" data-unit-id="${unit.id}"
                data-status="${status.value}" data-channel="${channel?.value ?? ""}"
                data-manager="${UnitCardView.escape(unit.manager)}"
                data-visual-variant="${unit.visualVariant ?? "default"}"
                aria-label="Unidade ${escapeHtml(displayCode)}. Tipo ${unitType.label}. Status ${status.label}. ${channel ? `Canal ${escapeHtml(channel.label)}.` : ""}">
                ${channelIndicator}
                ${timer}

                <span class="unit-card__number">${escapeHtml(displayCode)}</span>

                <span class="unit-card__tooltip" role="tooltip">
                    <span><strong>Tipo:</strong> ${unitType.label}</span>
                    <span><strong>Status:</strong> ${status.label}</span>
                    <span><strong>Canal:</strong> ${channel ? escapeHtml(channel.label) : "—"}</span>
                    <span><strong>Gerente:</strong> ${UnitCardView.escape(unit.manager || "—")}</span>
                </span>
            </button>
        `;
    }

    static escape(value) {
        return escapeHtml(value);
    }

    static getVariantClass(variant) {
        const classes = {
            garden: "unit-card--garden",
            "coverage-linear": "unit-card--coverage-linear",
            "coverage-duplex": "unit-card--coverage-duplex",
        };

        return classes[variant] ?? "";
    }

    static getTimerValue(unit) {
        if (!TIMED_STATUSES.has(unit.status) || !unit.statusChangedAt) return null;
        const elapsed = Date.now() - new Date(unit.statusChangedAt).getTime();
        if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed >= 18000000) return null;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }

    static renderList(
        units,
        channels = null
    ) {
        return units
            .map(
                (unit) =>
                    UnitCardView.render(
                        unit,
                        channels
                    )
            )
            .join("");
    }
}
