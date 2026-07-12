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
        displayCode,
        block = "Bloco Único",
        blockId = "single-block",
        type = "standard",
        layoutType =
            "single-cell",
        visualVariant =
            "default",
        anchorFloor = 1,
        anchorColumn = 1,
        columnSpan = 1,
        rowSpan = 1,
        status =
            UNIT_STATUS.AVAILABLE,
        channel = null,
        partner = "",
        manager = "",
        broker = "",
        notes = "",
    }) {
        const normalizedDisplayCode =
            String(
                displayCode ??
                    number ??
                    ""
            ).trim();

        if (
            !normalizedDisplayCode
        ) {
            throw new Error(
                "Uma unidade precisa possuir um código de exibição."
            );
        }

        this.id = String(
            id ??
                `${blockId}-${normalizedDisplayCode}`
        );

        this.displayCode =
            normalizedDisplayCode;

        // Compatibilidade com as Views atuais.
        this.number =
            normalizedDisplayCode;

        this.block =
            String(block).trim();

        this.blockId =
            String(blockId).trim();

        this.type =
            String(type).trim();

        this.layoutType =
            String(
                layoutType
            ).trim();

        this.visualVariant =
            String(
                visualVariant
            ).trim();

        this.anchorFloor =
            Number(anchorFloor);

        this.anchorColumn =
            Number(anchorColumn);

        this.columnSpan =
            Number(columnSpan);

        this.rowSpan =
            Number(rowSpan);

        this.status =
            this.validateStatus(
                status
            );

        this.channel =
            this.validateChannel(
                channel
            );

        this.partner =
            this.normalizePartner(
                partner,
                this.channel
            );

        this.manager =
            String(manager).trim();

        this.broker =
            String(broker).trim();

        this.notes =
            String(notes).trim();
    }

    validateStatus(status) {
        return getStatusByValue(
            status
        ).value;
    }

    validateChannel(
        channel
    ) {
        if (!channel) {
            return null;
        }

        const validChannel =
            getChannelByValue(
                channel
            );

        return validChannel
            ? validChannel.value
            : null;
    }

    normalizePartner(
        partner,
        channel
    ) {
        const isPartnership =
            channel ===
            SALES_CHANNEL
                .TEGRA_PARTNERSHIPS;

        return isPartnership
            ? String(
                  partner
              ).trim()
            : "";
    }

    update({
        block = this.block,
        status = this.status,
        channel =
            this.channel,
        partner =
            this.partner,
        manager =
            this.manager,
        broker = this.broker,
        notes = this.notes,
    }) {
        const validatedChannel =
            this.validateChannel(
                channel
            );

        this.block =
            String(block).trim();

        this.status =
            this.validateStatus(
                status
            );

        this.channel =
            validatedChannel;

        this.partner =
            this.normalizePartner(
                partner,
                validatedChannel
            );

        this.manager =
            String(
                manager
            ).trim();

        this.broker =
            String(
                broker
            ).trim();

        this.notes =
            String(notes).trim();

        return this;
    }

    toJSON() {
        return {
            id: this.id,

            displayCode:
                this.displayCode,

            number:
                this.displayCode,

            block:
                this.block,

            blockId:
                this.blockId,

            type:
                this.type,

            layoutType:
                this.layoutType,

            visualVariant:
                this.visualVariant,

            anchorFloor:
                this.anchorFloor,

            anchorColumn:
                this.anchorColumn,

            columnSpan:
                this.columnSpan,

            rowSpan:
                this.rowSpan,

            status:
                this.status,

            channel:
                this.channel,

            partner:
                this.partner,

            manager:
                this.manager,

            broker:
                this.broker,

            notes:
                this.notes,
        };
    }
}