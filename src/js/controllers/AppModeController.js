export class AppModeController {
    constructor({
        rootElement,
        onModeChange,
    }) {
        if (
            !(
                rootElement instanceof
                HTMLElement
            )
        ) {
            throw new Error(
                "AppModeController precisa receber um elemento HTML válido."
            );
        }

        if (
            typeof onModeChange !==
            "function"
        ) {
            throw new Error(
                "AppModeController precisa receber uma função de alteração."
            );
        }

        this.rootElement =
            rootElement;

        this.onModeChange =
            onModeChange;

        this.handleClick =
            this.handleClick.bind(
                this
            );
    }

    init() {
        this.rootElement
            .addEventListener(
                "click",
                this.handleClick
            );
    }

    handleClick(event) {
        const menuToggle =
            event.target.closest("[data-user-menu-toggle]");

        if (menuToggle) {
            const menu = this.rootElement.querySelector("#user-mode-menu");
            if (!menu) return;

            const shouldOpen = menu.hidden;
            menu.hidden = !shouldOpen;
            menuToggle.setAttribute("aria-expanded", String(shouldOpen));
            return;
        }

        const modeButton =
            event.target.closest(
                "[data-app-mode]"
            );

        if (!modeButton) {
            return;
        }

        const selectedMode =
            modeButton.dataset
                .appMode;

        this.onModeChange(
            selectedMode
        );
    }
}
