import { UNIT_STATUS } from "../js/config/statuses.js";

import {
    SALES_CHANNEL,
} from "../js/config/channels.js";

const SPECIAL_UNITS = Object.freeze({
    808: {
        status: UNIT_STATUS.SOLD,
        channel: SALES_CHANNEL.TEGRA_SALAO,
    },

    807: {
        status: UNIT_STATUS.RESERVED,
        channel: SALES_CHANNEL.LOPES_RIO,
    },

    806: {
        status: UNIT_STATUS.APPROVED,
        channel: SALES_CHANNEL.TEGRA_PARCERIAS,
    },

    805: {
        status: UNIT_STATUS.SIGNING,
        channel: SALES_CHANNEL.SOMMA_RIO,
    },

    804: {
        status: UNIT_STATUS.CONTRACT_PROCESS,
        channel: SALES_CHANNEL.EVS,
    },

    708: {
        status: UNIT_STATUS.RESERVED,
        channel: SALES_CHANNEL.TEGRA_SALAO,
    },

    707: {
        status: UNIT_STATUS.SOLD,
        channel: SALES_CHANNEL.LOPES_RIO,
    },

    606: {
        status: UNIT_STATUS.APPROVED,
        channel: SALES_CHANNEL.SOMMA_RIO,
    },

    505: {
        status: UNIT_STATUS.SIGNING,
        channel: SALES_CHANNEL.TEGRA_PARCERIAS,
    },

    404: {
        status: UNIT_STATUS.CONTRACT_PROCESS,
        channel: SALES_CHANNEL.EVS,
    },
});

function createUnit(number) {
    const specialData = SPECIAL_UNITS[number] ?? {};

    return Object.freeze({
        id: String(number),
        number,
        block: "Único",

        status:
            specialData.status ??
            UNIT_STATUS.AVAILABLE,

        channel:
            specialData.channel ??
            null,

        manager: "",
        broker: "",
        partner: "",
        notes: "",
    });
}

function createUnits() {
    const units = [];

    for (let floor = 8; floor >= 1; floor -= 1) {
        for (let column = 1; column <= 8; column += 1) {
            const number = floor * 100 + column;

            units.push(createUnit(number));
        }
    }

    return units;
}

export const MOCK_UNITS = Object.freeze(createUnits());