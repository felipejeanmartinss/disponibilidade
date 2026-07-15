export class AppNavigationView {
    static render(modeOptions, activeMode) {
        const buttons = modeOptions
            .map((mode) => {
                const isActive = mode.value === activeMode;

                return `
                    <button class="app-navigation__button ${isActive ? "is-active" : ""}"
                        type="button" data-app-mode="${mode.value}"
                        aria-pressed="${isActive}">
                        ${mode.label}
                    </button>
                `;
            })
            .join("");

        return `
            <div class="user-menu">
                <button class="user-avatar" type="button"
                    data-user-menu-toggle aria-expanded="false"
                    aria-controls="user-mode-menu"
                    aria-label="Abrir modos da aplicação" title="Felipe Martins">
                    FM
                </button>

                <nav class="app-navigation" id="user-mode-menu"
                    aria-label="Modos da aplicação" hidden>
                    <span class="app-navigation__label">Visualizar como</span>
                    ${buttons}
                </nav>
            </div>
        `;
    }
}
