export class AppNavigationView {
    static render(
        modeOptions,
        activeMode
    ) {
        const buttons = modeOptions
            .map((mode) => {
                const isActive =
                    mode.value === activeMode;

                return `
                    <button
                        class="
                            app-navigation__button
                            ${
                                isActive
                                    ? "is-active"
                                    : ""
                            }
                        "
                        type="button"
                        data-app-mode="${mode.value}"
                        aria-pressed="${isActive}"
                    >
                        ${mode.label}
                    </button>
                `;
            })
            .join("");

        return `
            <nav
                class="app-navigation"
                aria-label="Modos da aplicação"
            >
                ${buttons}
            </nav>
        `;
    }
}