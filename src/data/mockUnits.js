import {
    UNIT_STATUS,
} from "../js/config/statuses.js";

import {
    SALES_CHANNEL,
} from "../js/config/channels.js";

import {
    Unit,
} from "../js/models/Unit.js";

const SPECIAL_UNITS = Object.freeze({
    808: Object.freeze({
        status: UNIT_STATUS.SOLD,
        channel: SALES_CHANNEL.TEGRA_SALES,
    }),

    807: Object.freeze({
        status: UNIT_STATUS.RESERVED,
        channel: SALES_CHANNEL.LOPES_RIO,
    }),

    806: Object.freeze({
        status: UNIT_STATUS.APPROVED,
        channel: SALES_CHANNEL.TEGRA_PARTNERSHIPS,
        partner: "Parceira exemplo",
    }),

    805: Object.freeze({
        status: UNIT_STATUS.SIGNING,
        channel: SALES_CHANNEL.SOMMA_RIO,
    }),

    804: Object.freeze({
        status: UNIT_STATUS.CONTRACT_PROCESS,
        channel: SALES_CHANNEL.EVS,
    }),

    708: Object.freeze({
        status: UNIT_STATUS.RESERVED,
        channel: SALES_CHANNEL.TEGRA_SALES,
    }),

    707: Object.freeze({
        status: UNIT_STATUS.SOLD,
        channel: SALES_CHANNEL.LOPES_RIO,
    }),

    606: Object.freeze({
        status: UNIT_STATUS.APPROVED,
        channel: SALES_CHANNEL.SOMMA_RIO,
    }),

    505: Object.freeze({
        status: UNIT_STATUS.SIGNING,
        channel: SALES_CHANNEL.TEGRA_PARTNERSHIPS,
        partner: "Parceira exemplo",
    }),

    404: Object.freeze({
        status: UNIT_STATUS.CONTRACT_PROCESS,
        channel: SALES_CHANNEL.EVS,
    }),
});

function createUnit(number) {
    const specialData =
        SPECIAL_UNITS[number] ?? {};

    return new Unit({
        number,
        block: "Único",

        status:
            specialData.status ??
            UNIT_STATUS.AVAILABLE,

        channel:
            specialData.channel ??
            null,

        partner:
            specialData.partner ??
            "",
    });
}

export function createMockUnits() {
    const units = [];

    for (
        let floor = 8;
        floor >= 1;
        floor -= 1
    ) {
        for (
            let column = 1;
            column <= 8;
            column += 1
        ) {
            const number =
                floor * 100 + column;

            units.push(
                createUnit(number)
            );
        }
    }

    return units;
}