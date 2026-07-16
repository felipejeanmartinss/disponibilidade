import {
    UnitModalView,
} from "../views/UnitModalView.js";

import {
    FolderCatalogService,
} from "../services/FolderCatalogService.js";

export class UnitController {
    constructor({
        rootElement,
        units,
        onUnitsChange,
    }) {
        if (!(rootElement instanceof HTMLElement)) {
            throw new Error(
                "UnitController precisa de um elemento válido."
            );
        }

        if (!Array.isArray(units)) {
            throw new Error(
                "UnitController precisa receber uma lista de unidades."
            );
        }

        if (typeof onUnitsChange !== "function") {
            throw new Error(
                "UnitController precisa de uma função de atualização."
            );
        }

        this.rootElement = rootElement;
        this.units = units;
        this.onUnitsChange = onUnitsChange;
        this.lastActiveCard = null;

        this.handleClick =
            this.handleClick.bind(this);

        this.handleChange =
            this.handleChange.bind(this);

        this.handleSubmit =
            this.handleSubmit.bind(this);

        this.handleKeydown =
            this.handleKeydown.bind(this);
    }

    init() {
        this.rootElement.addEventListener(
            "click",
            this.handleClick
        );

        this.rootElement.addEventListener(
            "change",
            this.handleChange
        );

        this.rootElement.addEventListener(
            "submit",
            this.handleSubmit
        );

        document.addEventListener(
            "keydown",
            this.handleKeydown
        );
    }

    handleClick(event) {
        const conditionalSave =
            event.target.closest("[data-conditional-save]");

        if (conditionalSave) {
            UnitModalView.saveConditionalDraft(this.rootElement);
            return;
        }

        const conditionalCancel =
            event.target.closest("[data-conditional-cancel]");

        if (conditionalCancel) {
            const form = this.rootElement.querySelector("#unit-form");
            UnitModalView.clearConditionalEditor(form);
            return;
        }

        const conditionalEdit =
            event.target.closest("[data-conditional-edit]");

        if (conditionalEdit) {
            UnitModalView.editConditionalClient(
                this.rootElement,
                conditionalEdit.dataset.conditionalEdit
            );
            return;
        }

        const conditionalDelete =
            event.target.closest("[data-conditional-delete]");

        if (conditionalDelete) {
            UnitModalView.removeConditionalClient(
                this.rootElement,
                conditionalDelete.dataset.conditionalDelete
            );
            return;
        }

        const unitCard =
            event.target.closest(".unit-card");

        if (unitCard) {
            this.lastActiveCard = unitCard;

            this.openUnit(
                unitCard.dataset.unitId
            );

            return;
        }

        const closeButton =
            event.target.closest(
                "[data-modal-close]"
            );

        const clickedModalBackground =
            event.target.matches(
                "#unit-modal"
            );

        if (
            closeButton ||
            clickedModalBackground
        ) {
            this.closeModal();
        }
    }

    handleChange(event) {
        if (
            event.target.id === "folder-number" ||
            event.target.id === "conditional-folder-number"
        ) {
            const prefix = event.target.id === "folder-number"
                ? "unit"
                : "conditional";
            const record = FolderCatalogService.findByNumber(
                event.target.value
            );

            UnitModalView.applyFolderRecord(
                this.rootElement,
                prefix,
                record,
                event.target.value
            );
        }

        if (event.target.id === "unit-channel") {
            UnitModalView.updatePartnerFields(
                this.rootElement,
                "unit",
                event.target.value
            );
        }

        if (event.target.id === "conditional-channel") {
            UnitModalView.updatePartnerFields(
                this.rootElement,
                "conditional",
                event.target.value
            );
        }
    }

    handleSubmit(event) {
        if (
            event.target.id !==
            "unit-form"
        ) {
            return;
        }

        event.preventDefault();

        const formData =
            UnitModalView.getFormData(
                this.rootElement
            );

        const unit = this.findUnitById(
            formData.unitId
        );

        unit.update({
            block: formData.block,
            status: formData.status,
            channel: formData.channel,
            partner: formData.partner,
            superintendent: formData.superintendent,
            director: formData.director,
            partnerManager: formData.partnerManager,
            coordinator: formData.coordinator,
            manager: formData.manager,
            broker: formData.broker,
            folder: formData.folder,
            conditionalClients: formData.conditionalClients,
            notes: formData.notes,
        });

        this.closeModal();

        this.onUnitsChange(
            this.units
        );

        this.restoreCardFocus(
            unit.number
        );
    }

    handleKeydown(event) {
        if (event.key !== "Escape") {
            return;
        }

        this.closeModal();
    }

    findUnitById(unitId) {
        const unit = this.units.find(
            (item) =>
                item.id === String(unitId)
        );

        if (!unit) {
            throw new Error(
                "A unidade selecionada não foi encontrada."
            );
        }

        return unit;
    }

    findUnitByNumber(unitNumber) {
        const unit = this.units.find(
            (item) =>
                String(item.number) ===
                String(unitNumber)
        );

        if (!unit) {
            throw new Error(
                `Unidade ${unitNumber} não encontrada.`
            );
        }

        return unit;
    }

    openUnit(unitId) {
        const unit = this.findUnitById(unitId);

        UnitModalView.open(
            this.rootElement,
            unit
        );
    }

    closeModal() {
        UnitModalView.close(
            this.rootElement
        );
    }

    restoreCardFocus(unitNumber) {
        requestAnimationFrame(() => {
            const updatedCard =
                this.rootElement.querySelector(
                    `.unit-card[data-unit="${unitNumber}"]`
                );

            if (updatedCard) {
                updatedCard.focus();
                this.lastActiveCard =
                    updatedCard;

                return;
            }

            this.lastActiveCard?.focus();
        });
    }
}
