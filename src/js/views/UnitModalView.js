import {
    UNIT_STATUS,
    UNIT_STATUS_OPTIONS,
} from "../config/statuses.js";

import {
    SALES_CHANNEL,
    SALES_CHANNEL_OPTIONS,
} from "../config/channels.js";

export class UnitModalView {
    static render() {
        const statusOptions = UNIT_STATUS_OPTIONS
            .map(
                (status) => `
                    <option value="${status.value}">
                        ${status.label}
                    </option>
                `
            )
            .join("");

        const channelOptions = SALES_CHANNEL_OPTIONS
            .map(
                (channel) => `
                    <option value="${channel.value}">
                        ${channel.label}
                    </option>
                `
            )
            .join("");

        return `
            <div
                class="modal"
                id="unit-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="unit-modal-title"
                aria-hidden="true"
            >
                <div class="modal__dialog">
                    <header class="modal__header">
                        <div>
                            <p class="modal__eyebrow">
                                Gestão comercial
                            </p>

                            <h2
                                class="modal__title"
                                id="unit-modal-title"
                            >
                                Unidade
                            </h2>
                        </div>

                        <button
                            class="modal__close"
                            type="button"
                            data-modal-close
                            aria-label="Fechar modal"
                        >
                            ×
                        </button>
                    </header>

                    <form id="unit-form">
                        <div class="modal__body">
                            <section class="modal__section">
                                <h3 class="modal__section-title">
                                    Posição comercial
                                </h3>

                                <div class="form-grid">
                                    <div class="form-field">
                                        <label
                                            class="form-label"
                                            for="unit-block"
                                        >
                                            Bloco
                                        </label>

                                        <input
                                            class="form-control"
                                            id="unit-block"
                                            name="block"
                                            type="text"
                                        >
                                    </div>

                                    <div class="form-field">
                                        <label
                                            class="form-label"
                                            for="unit-status"
                                        >
                                            Status
                                        </label>

                                        <select
                                            class="form-control"
                                            id="unit-status"
                                            name="status"
                                            required
                                        >
                                            ${statusOptions}
                                        </select>
                                    </div>

                                    <div class="form-field form-field--full">
                                        <label
                                            class="form-label"
                                            for="unit-channel"
                                        >
                                            Canal
                                        </label>

                                        <select
                                            class="form-control"
                                            id="unit-channel"
                                            name="channel"
                                        >
                                            <option value="">
                                                Sem canal definido
                                            </option>

                                            ${channelOptions}
                                        </select>
                                    </div>

                                    <div
                                        class="
                                            form-field
                                            form-field--full
                                        "
                                        id="partner-field"
                                        hidden
                                    >
                                        <label
                                            class="form-label"
                                            for="unit-partner"
                                        >
                                            Parceira
                                        </label>

                                        <input
                                            class="form-control"
                                            id="unit-partner"
                                            name="partner"
                                            type="text"
                                            placeholder="Nome da imobiliária parceira"
                                        >
                                    </div>
                                </div>
                            </section>

                            <section class="modal__section">
                                <h3 class="modal__section-title">
                                    Equipe responsável
                                </h3>

                                <div class="form-grid">
                                    <div class="form-field">
                                        <label
                                            class="form-label"
                                            for="unit-manager"
                                        >
                                            Gerente
                                        </label>

                                        <input
                                            class="form-control"
                                            id="unit-manager"
                                            name="manager"
                                            type="text"
                                        >
                                    </div>

                                    <div class="form-field">
                                        <label
                                            class="form-label"
                                            for="unit-broker"
                                        >
                                            Corretor
                                        </label>

                                        <input
                                            class="form-control"
                                            id="unit-broker"
                                            name="broker"
                                            type="text"
                                        >
                                    </div>
                                </div>
                            </section>

                            <section class="modal__section">
                                <h3 class="modal__section-title">
                                    Observações
                                </h3>

                                <div class="form-field">
                                    <label
                                        class="form-label"
                                        for="unit-notes"
                                    >
                                        Informações adicionais
                                    </label>

                                    <textarea
                                        class="form-control"
                                        id="unit-notes"
                                        name="notes"
                                        placeholder="Registre informações importantes sobre a negociação."
                                    ></textarea>
                                </div>
                            </section>
                        </div>

                        <footer class="modal__footer">
                            <button
                                class="
                                    modal-button
                                    modal-button--secondary
                                "
                                type="button"
                                data-modal-close
                            >
                                Cancelar
                            </button>

                            <button
                                class="
                                    modal-button
                                    modal-button--primary
                                "
                                type="submit"
                            >
                                Salvar alterações
                            </button>
                        </footer>
                    </form>
                </div>
            </div>
        `;
    }

    static open(rootElement, unit) {
        const modal =
            rootElement.querySelector("#unit-modal");

        const form =
            rootElement.querySelector("#unit-form");

        if (!modal || !form) {
            throw new Error(
                "O modal de unidade não foi encontrado."
            );
        }

        modal.dataset.unitId = unit.id;

        rootElement.querySelector(
            "#unit-modal-title"
        ).textContent = `Unidade ${unit.number}`;

        form.elements.block.value =
            unit.block ?? "";

        form.elements.status.value =
            unit.status ?? UNIT_STATUS.AVAILABLE;

        form.elements.channel.value =
            unit.channel ?? "";

        form.elements.partner.value =
            unit.partner ?? "";

        form.elements.manager.value =
            unit.manager ?? "";

        form.elements.broker.value =
            unit.broker ?? "";

        form.elements.notes.value =
            unit.notes ?? "";

        UnitModalView.updatePartnerField(
            rootElement,
            unit.channel
        );

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");

        document.body.classList.add("modal-open");

        form.elements.status.focus();
    }

    static close(rootElement) {
        const modal =
            rootElement.querySelector("#unit-modal");

        if (!modal) {
            return;
        }

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        modal.dataset.unitId = "";

        document.body.classList.remove("modal-open");
    }

    static updatePartnerField(
        rootElement,
        channelValue
    ) {
        const partnerField =
            rootElement.querySelector("#partner-field");

        const partnerInput =
            rootElement.querySelector("#unit-partner");

        if (!partnerField || !partnerInput) {
            return;
        }

        const shouldShow =
            channelValue ===
            SALES_CHANNEL.TEGRA_PARTNERSHIPS;

        partnerField.hidden = !shouldShow;

        if (!shouldShow) {
            partnerInput.value = "";
        }
    }

    static getFormData(rootElement) {
        const modal =
            rootElement.querySelector("#unit-modal");

        const form =
            rootElement.querySelector("#unit-form");

        if (!modal || !form) {
            throw new Error(
                "Não foi possível ler o formulário."
            );
        }

        return {
            unitId: modal.dataset.unitId,

            block:
                form.elements.block.value.trim(),

            status:
                form.elements.status.value,

            channel:
                form.elements.channel.value || null,

            partner:
                form.elements.partner.value.trim(),

            manager:
                form.elements.manager.value.trim(),

            broker:
                form.elements.broker.value.trim(),

            notes:
                form.elements.notes.value.trim(),
        };
    }
}