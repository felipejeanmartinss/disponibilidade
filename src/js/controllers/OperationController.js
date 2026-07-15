export class OperationController {
    constructor({ rootElement }) {
        this.rootElement = rootElement;
        this.zoom = 1;
        this.filters = {
            block: "",
            floor: "",
            status: "",
            channel: "",
            search: "",
        };
        this.timerId = null;
        this.handleClick = this.handleClick.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
    }

    init() {
        this.rootElement.addEventListener("click", this.handleClick);
        this.rootElement.addEventListener("input", this.handleFilter);
        this.rootElement.addEventListener("change", this.handleFilter);
        this.updateTimers();
        this.restoreState();
        this.timerId = window.setInterval(() => this.updateTimers(), 30000);
    }

    handleClick(event) {
        if (event.target.closest("[data-operation-zoom-in]")) {
            this.setZoom(this.zoom + 0.1);
            return;
        }

        if (event.target.closest("[data-operation-zoom-out]")) {
            this.setZoom(this.zoom - 0.1);
            return;
        }

        if (event.target.closest("[data-operation-fullscreen]")) {
            this.toggleFullscreen();
        }
    }

    handleFilter(event) {
        if (!["block-filter", "floor-filter", "status-filter",
            "channel-filter", "unit-search"].includes(event.target.id)) {
            return;
        }

        this.captureFilters();
        this.applyFilters();
    }

    getValue(id) {
        return this.rootElement.querySelector(`#${id}`)?.value.trim().toLowerCase() ?? "";
    }

    captureFilters() {
        this.filters = {
            block: this.getValue("block-filter"),
            floor: this.getValue("floor-filter"),
            status: this.getValue("status-filter"),
            channel: this.getValue("channel-filter"),
            search: this.getValue("unit-search"),
        };
    }

    restoreState() {
        const fields = [
            ["block-filter", "block"],
            ["floor-filter", "floor"],
            ["status-filter", "status"],
            ["channel-filter", "channel"],
            ["unit-search", "search"],
        ];

        fields.forEach(([id, key]) => {
            const field = this.rootElement.querySelector(`#${id}`);
            if (!field) return;

            field.value = this.filters[key];

            if (field.value !== this.filters[key]) {
                field.value = "";
                this.filters[key] = "";
            }
        });

        this.setZoom(this.zoom);
        this.applyFilters();
        this.updateTimers();
    }

    applyFilters() {
        const filters = this.filters;
        let visibleCount = 0;

        this.rootElement.querySelectorAll("[data-operation-unit]").forEach((element) => {
            const matches =
                (!filters.block || element.dataset.block === filters.block) &&
                (!filters.floor || element.dataset.floor === filters.floor) &&
                (!filters.status || element.dataset.status === filters.status) &&
                (!filters.channel || element.dataset.channel === filters.channel) &&
                (!filters.search || element.dataset.code.toLowerCase().includes(filters.search));
            element.hidden = !matches;
            if (matches) visibleCount += 1;
        });

        this.rootElement.querySelectorAll("[data-operation-block]").forEach((element) => {
            element.hidden = Boolean(filters.block) &&
                element.dataset.operationBlock !== filters.block;
        });

        const result = this.rootElement.querySelector("[data-operation-results]");
        if (result) result.textContent = `${visibleCount} unidades exibidas`;
    }

    setZoom(value) {
        this.zoom = Math.min(1.5, Math.max(0.7, Number(value.toFixed(1))));
        this.rootElement.querySelectorAll(".operation-matrix").forEach((matrix) => {
            matrix.style.setProperty("--operation-zoom", String(this.zoom));
            matrix.style.setProperty(
                "--operation-card-width",
                `${132 * this.zoom}px`
            );
            matrix.style.setProperty(
                "--operation-card-height",
                `${142 * this.zoom}px`
            );
            const columns = Number(matrix.dataset.operationColumns ?? 1);
            matrix.style.setProperty(
                "--operation-min-width",
                `${56 + columns * 144 * this.zoom}px`
            );
        });
        const output = this.rootElement.querySelector("[data-operation-zoom-value]");
        if (output) output.textContent = `${Math.round(this.zoom * 100)}%`;
    }

    async toggleFullscreen() {
        const workspace = this.rootElement.querySelector("[data-operation-workspace]");
        if (!workspace) return;

        if (workspace.classList.contains("is-fullscreen-fallback")) {
            workspace.classList.remove("is-fullscreen-fallback");
            return;
        }

        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else if (workspace.requestFullscreen) {
                await workspace.requestFullscreen();
            } else {
                workspace.classList.add("is-fullscreen-fallback");
            }
        } catch (error) {
            console.warn("Não foi possível ativar a tela cheia nativa:", error);
            workspace.classList.toggle("is-fullscreen-fallback");
        }
    }

    updateTimers() {
        const fiveHours = 5 * 60 * 60 * 1000;
        const now = Date.now();
        this.rootElement.querySelectorAll("[data-status-timer]").forEach((timer) => {
            const startedAt = new Date(timer.dataset.startedAt).getTime();
            const elapsed = now - startedAt;
            if (!Number.isFinite(startedAt) || elapsed < 0 || elapsed >= fiveHours) {
                timer.hidden = true;
                return;
            }
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            timer.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
            timer.hidden = false;
        });
    }
}
