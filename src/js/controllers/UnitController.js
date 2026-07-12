import {
    SALES_CHANNEL,
} from "../config/channels.js";

import {
    UnitModalView,
} from "../views/UnitModalView.js";

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
        const unitCard =
            event.target.closest(".unit-card");

        if (unitCard) {
            this.openUnit(unitCard.dataset.unit);
            return;
        }

        const closeButton =
            event.target.closest("[data-modal-close]");

        const modalBackground =
            event.target.matches("#unit-modal");

        if (closeButton || modalBackground) {
            UnitModalView.close(this.rootElement);
        }
    }

    handleChange(event) {
        if (event.target.id !== "unit-channel") {
            return;
        }

        UnitModalView.updatePartnerField(
            this.rootElement,
            event.target.value
        );
    }

    handleSubmit(event) {
        if (event.target.id !== "unit-form") {
            return;
        }

        event.preventDefault();

        const formData =
            UnitModalView.getFormData(
                this.rootElement
            );

        const unit = this.units.find(
            (item) => item.id === formData.unitId
        );

        if (!unit) {
            throw new Error(
                "A unidade selecionada não foi encontrada."
            );
        }

        unit.block = formData.block;
        unit.status = formData.status;
        unit.channel = formData.channel;

        unit.partner =
            formData.channel ===
            SALES_CHANNEL.TEGRA_PARTNERSHIPS
                ? formData.partner
                : "";

        unit.manager = formData.manager;
        unit.broker = formData.broker;
        unit.notes = formData.notes;

        UnitModalView.close(this.rootElement);

        this.onUnitsChange(this.units);
    }

    handleKeydown(event) {
        if (event.key !== "Escape") {
            return;
        }

        UnitModalView.close(this.rootElement);
    }

    openUnit(unitNumber) {
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

        UnitModalView.open(
            this.rootElement,
            unit
        );
    }
}