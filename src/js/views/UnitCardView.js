import {
    getStatusByValue,
} from "../config/statuses.js";

import {
    getChannelByValue,
} from "../config/channels.js";

export class UnitCardView {
    static render(unit) {
        const status =
            getStatusByValue(
                unit.status
            );

        const channel =
            unit.channel
                ? getChannelByValue(
                      unit.channel
                  )
                : null;

        const displayCode =
            String(
                unit.displayCode ??
                    unit.number
            );

        const channelIndicator =
            channel
                ? `
                    <span class="unit-card__channel-logo">
                        <img
                            src="${channel.logoPath}"
                            alt="${channel.label}"
                        >
                    </span>
                `
                : "";

        const channelDescription =
            channel
                ? `
                    <span class="unit-card__channel-name">
                        ${channel.label}
                    </span>
                `
                : "";

        const accessibleChannel =
            channel
                ? `Canal ${channel.label}.`
                : "";

        const gardenClass =
            unit.visualVariant ===
            "garden"
                ? "unit-card--garden"
                : "";

        return `
            <button
                class="
                    unit-card
                    ${gardenClass}
                "
                type="button"
                data-unit="${displayCode}"
                data-unit-id="${unit.id}"
                data-status="${status.value}"
                data-channel="${channel?.value ?? ""}"
                data-visual-variant="${unit.visualVariant ?? "default"}"
                aria-label="
                    Unidade ${displayCode}.
                    Status ${status.label}.
                    ${accessibleChannel}
                "
            >
                ${channelIndicator}

                <span class="unit-card__number">
                    ${displayCode}
                </span>

                <span class="unit-card__status">
                    ${status.label}
                </span>

                ${channelDescription}
            </button>
        `;
    }

    static renderList(units) {
        return units
            .map(
                (unit) =>
                    UnitCardView.render(
                        unit
                    )
            )
            .join("");
    }
}
