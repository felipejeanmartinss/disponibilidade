import {
    UNIT_STATUS,
    getStatusByValue,
} from "../config/statuses.js";

import {
    SALES_CHANNEL,
    getChannelByValue,
} from "../config/channels.js";

export class Unit {
    constructor({
        id,
        number,
        block = "Único",
        status = UNIT_STATUS.AVAILABLE,
        channel = null,
        partner = "",
        manager = "",
        broker = "",
        notes = "",
    }) {
        if (number === undefined || number === null) {
            throw new Error(
                "Uma unidade precisa possuir um número."
            );
        }

        this.id = String(id ?? number);
        this.number = Number(number);
        this.block = String(block).trim();

        this.status =
            this.validateStatus(status);

        this.channel =
            this.validateChannel(channel);

        this.partner =
            this.normalizePartner(
                partner,
                this.channel
            );

        this.manager = String(manager).trim();
        this.broker = String(broker).trim();
        this.notes = String(notes).trim();
    }

    validateStatus(status) {
        return getStatusByValue(status).value;
    }

    validateChannel(channel) {
        if (!channel) {
            return null;
        }

        const validChannel =
            getChannelByValue(channel);

        return validChannel
            ? validChannel.value
            : null;
    }

    normalizePartner(
        partner,
        channel
    ) {
        const isPartnershipChannel =
            channel ===
            SALES_CHANNEL.TEGRA_PARTNERSHIPS;

        return isPartnershipChannel
            ? String(partner).trim()
            : "";
    }

    update({
        block = this.block,
        status = this.status,
        channel = this.channel,
        partner = this.partner,
        manager = this.manager,
        broker = this.broker,
        notes = this.notes,
    }) {
        const validatedChannel =
            this.validateChannel(channel);

        this.block = String(block).trim();

        this.status =
            this.validateStatus(status);

        this.channel =
            validatedChannel;

        this.partner =
            this.normalizePartner(
                partner,
                validatedChannel
            );

        this.manager =
            String(manager).trim();

        this.broker =
            String(broker).trim();

        this.notes =
            String(notes).trim();

        return this;
    }

    toJSON() {
        return {
            id: this.id,
            number: this.number,
            block: this.block,
            status: this.status,
            channel: this.channel,
            partner: this.partner,
            manager: this.manager,
            broker: this.broker,
            notes: this.notes,
        };
    }
}