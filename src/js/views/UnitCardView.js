import {
    getStatusByValue,
} from "../config/statuses.js";

import {
    getChannelByValue,
} from "../config/channels.js";

export class UnitCardView {
    static render(unit) {
        const status = getStatusByValue(unit.status);

        const channel = unit.channel
            ? getChannelByValue(unit.channel)
            : null;

        const channelIndicator = channel
            ? `
                <span
                    class="unit-card__channel-dot"
                    data-channel="${channel.value}"
                    aria-hidden="true"
                ></span>
            `
            : "";

        const channelDescription = channel
            ? `
                <span class="unit-card__channel-name">
                    ${channel.label}
                </span>
            `
            : `
                <span class="unit-card__channel-name">
                    Sem canal definido
                </span>
            `;

        const accessibleChannel = channel
            ? `Canal ${channel.label}.`
            : "Sem canal definido.";

        return `
            <button
                class="unit-card"
                type="button"
                data-unit="${unit.number}"
                data-status="${status.value}"
                data-channel="${channel?.value ?? ""}"
                aria-label="
                    Unidade ${unit.number}.
                    Status ${status.label}.
                    ${accessibleChannel}
                "
            >
                ${channelIndicator}

                <span class="unit-card__number">
                    ${unit.number}
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
            .map((unit) => UnitCardView.render(unit))
            .join("");
    }
}