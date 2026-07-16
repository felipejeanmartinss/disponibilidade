import {
    escapeHtml,
} from "../utils/html.js";

export class AppNavigationView {
    static render(
        modeOptions,
        activeMode,
        user
    ) {
        const buttons = modeOptions
            .map((mode) => {
                const isActive =
                    mode.value === activeMode;

                return `
                    <button
                        class="app-navigation__button ${isActive ? "is-active" : ""}"
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
            <div class="user-menu">
                <button
                    class="user-avatar"
                    type="button"
                    data-user-menu-toggle
                    aria-expanded="false"
                    aria-controls="user-mode-menu"
                    aria-label="Abrir menu do usuário"
                    title="${escapeHtml(user.displayName)}"
                >
                    ${escapeHtml(user.initials)}
                </button>

                <nav
                    class="app-navigation"
                    id="user-mode-menu"
                    aria-label="Menu do usuário"
                    hidden
                >
                    <span class="app-navigation__label">
                        Visualizar como
                    </span>

                    ${buttons}

                    <div class="app-navigation__divider"></div>

                    <div class="app-navigation__user">
                        <strong>
                            ${escapeHtml(user.displayName)}
                        </strong>

                        <span>
                            ${escapeHtml(user.email)}
                        </span>
                    </div>

                    <button
                        class="app-navigation__button app-navigation__button--danger"
                        type="button"
                        data-auth-sign-out
                    >
                        Sair
                    </button>
                </nav>
            </div>
        `;
    }
}
