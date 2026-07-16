export class ExecutiveController {
    constructor({
        rootElement,
        units,
    }) {
        this.rootElement = rootElement;
        this.units = units;
        this.selectedChannel = "";
        this.handleChange = this.handleChange.bind(this);
    }

    init() {
        this.rootElement.addEventListener(
            "change",
            this.handleChange
        );
        this.restoreState();
    }

    handleChange(event) {
        if (!event.target.matches("[data-executive-channel-filter]")) {
            return;
        }

        this.selectedChannel = event.target.value;
        this.updateComposition();
    }

    restoreState() {
        const filter = this.rootElement.querySelector(
            "[data-executive-channel-filter]"
        );

        if (!filter) return;

        filter.value = this.selectedChannel;
        if (filter.value !== this.selectedChannel) {
            this.selectedChannel = "";
            filter.value = "";
        }

        this.updateComposition();
    }

    updateComposition() {
        const filteredUnits = this.selectedChannel
            ? this.units.filter(
                  (unit) => unit.channel === this.selectedChannel
              )
            : this.units;

        const total = filteredUnits.length;
        const totalElement = this.rootElement.querySelector(
            "[data-composition-total]"
        );

        if (totalElement) {
            totalElement.textContent = String(total);
        }

        this.rootElement.querySelectorAll(
            "[data-composition-status]"
        ).forEach((row) => {
            const count = filteredUnits.filter(
                (unit) => unit.status === row.dataset.compositionStatus
            ).length;
            const percentage = total
                ? Math.round((count / total) * 100)
                : 0;
            const value = row.querySelector("[data-composition-value]");
            const bar = row.querySelector("[data-composition-bar]");

            if (value) value.textContent = String(count);
            if (bar) bar.style.width = `${percentage}%`;
        });
    }
}
