import {
    UNIT_STATUS,
    UNIT_STATUS_OPTIONS,
} from "../config/statuses.js";

import {
    SALES_CHANNEL,
    SALES_CHANNEL_OPTIONS,
} from "../config/channels.js";

import {
    escapeHtml,
} from "../utils/html.js";

export class UnitModalView {
    static renderOptions(options) {
        return options
            .map(({ value, label }) => `
                <option value="${escapeHtml(value)}">${escapeHtml(label)}</option>
            `)
            .join("");
    }

    static render(
        channels = SALES_CHANNEL_OPTIONS,
        statuses = UNIT_STATUS_OPTIONS
    ) {
        const statusOptions =
            UnitModalView.renderOptions(statuses);

        const channelOptions =
            UnitModalView.renderOptions(channels);

        return `
            <div class="modal" id="unit-modal" role="dialog"
                aria-modal="true" aria-labelledby="unit-modal-title"
                aria-hidden="true">
                <div class="modal__dialog">
                    <header class="modal__header">
                        <div>
                            <p class="modal__eyebrow">Gestão comercial</p>
                            <h2 class="modal__title" id="unit-modal-title">Unidade</h2>
                        </div>
                        <button class="modal__close" type="button"
                            data-modal-close aria-label="Fechar modal">×</button>
                    </header>

                    <form id="unit-form">
                        <div class="modal__body">
                            <section class="modal__section">
                                <h3 class="modal__section-title">Posição comercial</h3>
                                <div class="form-grid">
                                    ${UnitModalView.renderInput("unit-block", "block", "Bloco")}
                                    <div class="form-field">
                                        <label class="form-label" for="unit-status">Status</label>
                                        <select class="form-control" id="unit-status"
                                            name="status" required>${statusOptions}</select>
                                    </div>
                                    <div class="form-field form-field--full">
                                        <label class="form-label" for="unit-channel">Canal</label>
                                        <select class="form-control" id="unit-channel" name="channel">
                                            <option value=""></option>
                                            ${channelOptions}
                                        </select>
                                    </div>
                                    <div class="form-field form-field--full" id="partner-field" hidden>
                                        <label class="form-label" for="unit-partner">Parceiro</label>
                                        <input class="form-control" id="unit-partner"
                                            name="partner" type="text">
                                    </div>
                                </div>
                            </section>

                            <section class="modal__section">
                                <h3 class="modal__section-title">Equipe responsável</h3>
                                <div class="form-grid">
                                    ${UnitModalView.renderInput("unit-director", "director", "Diretor")}
                                    ${UnitModalView.renderInput("unit-superintendent", "superintendent", "Superintendente")}
                                    ${UnitModalView.renderInput("unit-coordinator", "coordinator", "Coordenador")}
                                    <div class="form-field form-field--full"
                                        id="partner-manager-field" hidden>
                                        <label class="form-label" for="unit-partner-manager">
                                            Gerente Parceiro
                                        </label>
                                        <input class="form-control" id="unit-partner-manager"
                                            name="partnerManager" type="text">
                                    </div>
                                    ${UnitModalView.renderInput("unit-manager", "manager", "Gerente")}
                                    ${UnitModalView.renderInput("unit-broker", "broker", "Corretor")}
                                </div>
                            </section>

                            <section class="modal__section">
                                <h3 class="modal__section-title">Pasta</h3>
                                <div class="form-grid form-grid--three">
                                    ${UnitModalView.renderInput("folder-number", "folderNumber", "Nº")}
                                    ${UnitModalView.renderInput("folder-type", "folderType", "Tipo")}
                                    ${UnitModalView.renderInput("folder-client-name", "folderClientName", "Nome do cliente")}
                                </div>
                            </section>

                            <section class="modal__section">
                                <div class="modal__section-heading">
                                    <div>
                                        <h3 class="modal__section-title">Clientes condicionais</h3>
                                        <p class="modal__section-description">
                                            Fila de interessados caso a negociação atual não se concretize.
                                        </p>
                                    </div>
                                </div>

                                <input type="hidden" name="conditionalClients" value="[]">
                                <input type="hidden" name="conditionalEditingId" value="">

                                <div class="conditional-editor">
                                    <div class="form-grid form-grid--three">
                                        ${UnitModalView.renderInput("conditional-name", "conditionalName", "Nome do cliente")}
                                        ${UnitModalView.renderInput("conditional-folder-number", "conditionalFolderNumber", "Nº da pasta")}
                                        ${UnitModalView.renderInput("conditional-folder-type", "conditionalFolderType", "Tipo da pasta")}
                                        <div class="form-field">
                                            <label class="form-label" for="conditional-channel">Canal</label>
                                            <select class="form-control" id="conditional-channel"
                                                name="conditionalChannel">
                                                <option value=""></option>
                                                ${channelOptions}
                                            </select>
                                        </div>
                                        <div class="form-field" id="conditional-partner-field" hidden>
                                            <label class="form-label" for="conditional-partner">Parceiro</label>
                                            <input class="form-control" id="conditional-partner"
                                                name="conditionalPartner" type="text">
                                        </div>
                                        ${UnitModalView.renderInput("conditional-director", "conditionalDirector", "Diretor")}
                                        ${UnitModalView.renderInput("conditional-superintendent", "conditionalSuperintendent", "Superintendente")}
                                        <div class="form-field" id="conditional-partner-manager-field" hidden>
                                            <label class="form-label" for="conditional-partner-manager">
                                                Gerente Parceiro
                                            </label>
                                            <input class="form-control" id="conditional-partner-manager"
                                                name="conditionalPartnerManager" type="text">
                                        </div>
                                        ${UnitModalView.renderInput("conditional-coordinator", "conditionalCoordinator", "Coordenador")}
                                        ${UnitModalView.renderInput("conditional-manager", "conditionalManager", "Gerente")}
                                        ${UnitModalView.renderInput("conditional-broker", "conditionalBroker", "Corretor")}
                                        <div class="form-field form-field--full">
                                            <label class="form-label" for="conditional-notes">Observações</label>
                                            <textarea class="form-control" id="conditional-notes"
                                                name="conditionalNotes"></textarea>
                                        </div>
                                    </div>
                                    <div class="conditional-editor__actions">
                                        <button class="modal-button modal-button--secondary" type="button"
                                            data-conditional-cancel hidden>Cancelar substituição</button>
                                        <button class="modal-button modal-button--primary" type="button"
                                            data-conditional-save>Incluir na fila</button>
                                    </div>
                                </div>

                                <div class="conditional-list" data-conditional-list></div>
                            </section>

                            <section class="modal__section">
                                <h3 class="modal__section-title">Observações</h3>
                                <div class="form-field">
                                    <label class="form-label" for="unit-notes">Informações adicionais</label>
                                    <textarea class="form-control" id="unit-notes" name="notes"></textarea>
                                </div>
                            </section>
                        </div>

                        <footer class="modal__footer">
                            <button class="modal-button modal-button--secondary"
                                type="button" data-modal-close>Cancelar</button>
                            <button class="modal-button modal-button--primary"
                                type="submit">Salvar alterações</button>
                        </footer>
                    </form>
                </div>
            </div>
        `;
    }

    static renderInput(id, name, label) {
        return `
            <div class="form-field">
                <label class="form-label" for="${id}">${label}</label>
                <input class="form-control" id="${id}" name="${name}" type="text">
            </div>
        `;
    }

    static open(rootElement, unit) {
        const modal = rootElement.querySelector("#unit-modal");
        const form = rootElement.querySelector("#unit-form");

        if (!modal || !form) {
            throw new Error("O modal de unidade não foi encontrado.");
        }

        modal.dataset.unitId = unit.id;
        rootElement.querySelector("#unit-modal-title").textContent =
            `Unidade ${unit.number}`;

        const values = {
            block: unit.block,
            status: unit.status ?? UNIT_STATUS.AVAILABLE,
            channel: unit.channel ?? "",
            partner: unit.partner,
            superintendent: unit.superintendent,
            director: unit.director,
            partnerManager: unit.partnerManager,
            coordinator: unit.coordinator,
            manager: unit.manager,
            broker: unit.broker,
            folderNumber: unit.folder?.number,
            folderType: unit.folder?.type,
            folderClientName: unit.folder?.clientName,
            notes: unit.notes,
        };

        Object.entries(values).forEach(([name, value]) => {
            if (form.elements[name]) {
                form.elements[name].value = value ?? "";
            }
        });

        form.elements.conditionalClients.value =
            JSON.stringify(unit.conditionalClients ?? []);
        UnitModalView.clearConditionalEditor(form);
        UnitModalView.renderConditionalList(rootElement);
        UnitModalView.updatePartnerFields(rootElement, "unit", unit.channel);

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        form.elements.status.focus();
    }

    static close(rootElement) {
        const modal = rootElement.querySelector("#unit-modal");
        if (!modal) return;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        modal.dataset.unitId = "";
        document.body.classList.remove("modal-open");
    }

    static updatePartnerFields(rootElement, prefix, channelValue) {
        const isPartnership = channelValue === SALES_CHANNEL.TEGRA_PARCERIAS;
        const partnerField = rootElement.querySelector(`#${prefix === "unit" ? "partner" : "conditional-partner"}-field`);
        const managerField = rootElement.querySelector(`#${prefix === "unit" ? "partner-manager" : "conditional-partner-manager"}-field`);
        [partnerField, managerField].forEach((field) => {
            if (field) field.hidden = !isPartnership;
        });
    }

    static readConditionalClients(form) {
        try {
            const value = JSON.parse(form.elements.conditionalClients.value || "[]");
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }

    static getConditionalDraft(form) {
        return {
            id: form.elements.conditionalEditingId.value ||
                `conditional-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            name: form.elements.conditionalName.value.trim(),
            folderNumber: form.elements.conditionalFolderNumber.value.trim(),
            folderType: form.elements.conditionalFolderType.value.trim(),
            channel: form.elements.conditionalChannel.value || null,
            partner: form.elements.conditionalPartner.value.trim(),
            superintendent: form.elements.conditionalSuperintendent.value.trim(),
            director: form.elements.conditionalDirector.value.trim(),
            partnerManager: form.elements.conditionalPartnerManager.value.trim(),
            coordinator: form.elements.conditionalCoordinator.value.trim(),
            manager: form.elements.conditionalManager.value.trim(),
            broker: form.elements.conditionalBroker.value.trim(),
            notes: form.elements.conditionalNotes.value.trim(),
        };
    }

    static saveConditionalDraft(rootElement) {
        const form = rootElement.querySelector("#unit-form");
        const draft = UnitModalView.getConditionalDraft(form);
        if (!draft.name) {
            form.elements.conditionalName.focus();
            return;
        }

        const clients = UnitModalView.readConditionalClients(form);
        const index = clients.findIndex((client) => client.id === draft.id);
        if (index >= 0) clients[index] = draft;
        else clients.push(draft);

        form.elements.conditionalClients.value = JSON.stringify(clients);
        UnitModalView.clearConditionalEditor(form);
        UnitModalView.renderConditionalList(rootElement);
    }

    static editConditionalClient(rootElement, clientId) {
        const form = rootElement.querySelector("#unit-form");
        const client = UnitModalView.readConditionalClients(form)
            .find((item) => item.id === clientId);
        if (!client) return;

        const fields = {
            conditionalEditingId: client.id,
            conditionalName: client.name,
            conditionalFolderNumber: client.folderNumber,
            conditionalFolderType: client.folderType,
            conditionalChannel: client.channel,
            conditionalPartner: client.partner,
            conditionalSuperintendent: client.superintendent,
            conditionalDirector: client.director,
            conditionalPartnerManager: client.partnerManager,
            conditionalCoordinator: client.coordinator,
            conditionalManager: client.manager,
            conditionalBroker: client.broker,
            conditionalNotes: client.notes,
        };
        Object.entries(fields).forEach(([name, value]) => {
            form.elements[name].value = value ?? "";
        });
        UnitModalView.updatePartnerFields(rootElement, "conditional", client.channel);
        rootElement.querySelector("[data-conditional-save]").textContent = "Salvar substituição";
        rootElement.querySelector("[data-conditional-cancel]").hidden = false;
        form.elements.conditionalName.focus();
    }

    static removeConditionalClient(rootElement, clientId) {
        const form = rootElement.querySelector("#unit-form");
        const clients = UnitModalView.readConditionalClients(form)
            .filter((client) => client.id !== clientId);
        form.elements.conditionalClients.value = JSON.stringify(clients);
        UnitModalView.clearConditionalEditor(form);
        UnitModalView.renderConditionalList(rootElement);
    }

    static clearConditionalEditor(form) {
        ["conditionalEditingId", "conditionalName", "conditionalFolderNumber",
            "conditionalFolderType", "conditionalChannel", "conditionalPartner",
            "conditionalSuperintendent", "conditionalDirector", "conditionalPartnerManager", "conditionalCoordinator",
            "conditionalManager", "conditionalBroker", "conditionalNotes"].forEach((name) => {
            form.elements[name].value = "";
        });
        const root = form.closest(".app-shell") ?? document;
        const saveButton = root.querySelector("[data-conditional-save]");
        const cancelButton = root.querySelector("[data-conditional-cancel]");
        if (saveButton) saveButton.textContent = "Incluir na fila";
        if (cancelButton) cancelButton.hidden = true;
        UnitModalView.updatePartnerFields(root, "conditional", null);
    }

    static escape(value) {
        const element = document.createElement("div");
        element.textContent = String(value ?? "");
        return element.innerHTML;
    }

    static renderConditionalList(rootElement) {
        const form = rootElement.querySelector("#unit-form");
        const list = rootElement.querySelector("[data-conditional-list]");
        if (!form || !list) return;
        const clients = UnitModalView.readConditionalClients(form);

        list.innerHTML = clients.length
            ? clients.map((client, index) => `
                <article class="conditional-client">
                    <span class="conditional-client__position">${index + 1}</span>
                    <div class="conditional-client__content">
                        <strong>${UnitModalView.escape(client.name)}</strong>
                        <span>Pasta ${UnitModalView.escape(client.folderNumber || "—")}
                            ${client.folderType ? `• ${UnitModalView.escape(client.folderType)}` : ""}</span>
                    </div>
                    <div class="conditional-client__actions">
                        <button type="button" data-conditional-edit="${client.id}">Substituir</button>
                        <button type="button" data-conditional-delete="${client.id}">Excluir</button>
                    </div>
                </article>
            `).join("")
            : `<p class="conditional-list__empty">Nenhum cliente na fila.</p>`;
    }

    static getFormData(rootElement) {
        const modal = rootElement.querySelector("#unit-modal");
        const form = rootElement.querySelector("#unit-form");
        if (!modal || !form) throw new Error("Não foi possível ler o formulário.");

        return {
            unitId: modal.dataset.unitId,
            block: form.elements.block.value.trim(),
            status: form.elements.status.value,
            channel: form.elements.channel.value || null,
            partner: form.elements.partner.value.trim(),
            superintendent: form.elements.superintendent.value.trim(),
            director: form.elements.director.value.trim(),
            partnerManager: form.elements.partnerManager.value.trim(),
            coordinator: form.elements.coordinator.value.trim(),
            manager: form.elements.manager.value.trim(),
            broker: form.elements.broker.value.trim(),
            folder: {
                number: form.elements.folderNumber.value.trim(),
                type: form.elements.folderType.value.trim(),
                clientName: form.elements.folderClientName.value.trim(),
            },
            conditionalClients: UnitModalView.readConditionalClients(form),
            notes: form.elements.notes.value.trim(),
        };
    }
}
