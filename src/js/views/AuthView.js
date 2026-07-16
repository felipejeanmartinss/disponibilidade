import {
    escapeHtml,
} from "../utils/html.js";

export class AuthView {
    constructor(rootElement) {
        this.rootElement = rootElement;
    }

    renderLogin({
        appName,
        errorMessage = "",
    }) {
        this.rootElement.innerHTML = `
            <main class="auth-page">
                <section
                    class="auth-card"
                    aria-labelledby="auth-title"
                >
                    <div
                        class="auth-card__symbol"
                        aria-hidden="true"
                    >
                        D
                    </div>

                    <p class="auth-card__eyebrow">
                        Painel comercial
                    </p>

                    <h1
                        class="auth-card__title"
                        id="auth-title"
                    >
                        ${escapeHtml(appName)}
                    </h1>

                    <p class="auth-card__description">
                        Entre com o e-mail e a senha cadastrados para
                        acessar os dados comerciais.
                    </p>

                    <form
                        class="auth-form"
                        data-auth-form
                    >
                        <div class="auth-form__field">
                            <label for="auth-email">
                                E-mail
                            </label>

                            <input
                                id="auth-email"
                                name="email"
                                type="email"
                                autocomplete="username"
                                required
                            >
                        </div>

                        <div class="auth-form__field">
                            <label for="auth-password">
                                Senha
                            </label>

                            <input
                                id="auth-password"
                                name="password"
                                type="password"
                                autocomplete="current-password"
                                minlength="10"
                                required
                            >
                        </div>

                        <p
                            class="auth-card__error"
                            role="alert"
                            data-auth-error
                            ${errorMessage ? "" : "hidden"}
                        >
                            ${escapeHtml(errorMessage)}
                        </p>

                        <button
                            class="auth-card__button"
                            type="submit"
                            data-auth-sign-in
                        >
                            Entrar
                        </button>
                    </form>

                    <p class="auth-card__security">
                        As credenciais são protegidas pelo Supabase Auth.
                        A aplicação não armazena nem consulta sua senha.
                    </p>
                </section>
            </main>
        `;
    }
}
