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
        superintendent = "",
        director = "",
        partnerManager = "",
        coordinator = "",
        manager = "",
        broker = "",
        folder = {},
        conditionalClients = [],
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

        this.director =
            String(director).trim();

        this.superintendent =
            String(superintendent).trim();

        this.partnerManager =
            this.normalizePartnerField(
                partnerManager,
                this.channel
            );

        this.coordinator =
            String(coordinator).trim();

        this.manager =
            String(manager).trim();

        this.broker =
            String(broker).trim();

        this.folder =
            this.normalizeFolder(folder);

        this.conditionalClients =
            this.normalizeConditionalClients(
                conditionalClients
            );

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
                .TEGRA_PARCERIAS;

        return isPartnership
            ? String(
                  partner
              ).trim()
            : "";
    }

    normalizePartnerField(value, channel) {
        return channel === SALES_CHANNEL.TEGRA_PARCERIAS
            ? String(value ?? "").trim()
            : "";
    }

    normalizeFolder(folder = {}) {
        return {
            number: String(folder?.number ?? "").trim(),
            type: String(folder?.type ?? "").trim(),
            clientName: String(folder?.clientName ?? "").trim(),
        };
    }

    normalizeConditionalClients(clients) {
        if (!Array.isArray(clients)) {
            return [];
        }

        return clients.map((client, index) => ({
            id: String(
                client?.id ??
                `${this.id}-conditional-${index + 1}`
            ),
            name: String(client?.name ?? "").trim(),
            folderNumber: String(client?.folderNumber ?? "").trim(),
            folderType: String(client?.folderType ?? "").trim(),
            channel: this.validateChannel(client?.channel),
            partner: this.normalizePartner(
                client?.partner,
                this.validateChannel(client?.channel)
            ),
            superintendent: String(client?.superintendent ?? "").trim(),
            director: String(client?.director ?? "").trim(),
            partnerManager: this.normalizePartnerField(
                client?.partnerManager,
                this.validateChannel(client?.channel)
            ),
            coordinator: String(client?.coordinator ?? "").trim(),
            manager: String(client?.manager ?? "").trim(),
            broker: String(client?.broker ?? "").trim(),
            notes: String(client?.notes ?? "").trim(),
        }));
    }

    update({
        block = this.block,
        status = this.status,
        channel =
            this.channel,
        partner =
            this.partner,
        superintendent = this.superintendent,
        director = this.director,
        partnerManager = this.partnerManager,
        coordinator = this.coordinator,
        manager =
            this.manager,
        broker = this.broker,
        folder = this.folder,
        conditionalClients = this.conditionalClients,
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

        this.director = String(director).trim();

        this.superintendent = String(superintendent).trim();

        this.partnerManager =
            this.normalizePartnerField(
                partnerManager,
                validatedChannel
            );

        this.coordinator = String(coordinator).trim();

        this.manager =
            String(
                manager
            ).trim();

        this.broker =
            String(
                broker
            ).trim();

        this.folder = this.normalizeFolder(folder);

        this.conditionalClients =
            this.normalizeConditionalClients(
                conditionalClients
            );

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

            superintendent:
                this.superintendent,

            director:
                this.director,

            partnerManager:
                this.partnerManager,

            coordinator:
                this.coordinator,

            manager:
                this.manager,

            broker:
                this.broker,

            folder: {
                ...this.folder,
            },

            conditionalClients:
                this.conditionalClients.map(
                    (client) => ({ ...client })
                ),

            notes:
                this.notes,
        };
    }
}
