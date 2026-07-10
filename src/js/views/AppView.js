export class AppView {
    constructor(rootElement) {
        if (!(rootElement instanceof HTMLElement)) {
            throw new Error(
                "AppView precisa receber um elemento HTML válido."
            );
        }

        this.rootElement = rootElement;
    }

    render(config) {
        this.rootElement.innerHTML = `
            <div class="app-shell">
                <header class="app-header">
                    <p class="app-header__eyebrow">
                        Painel comercial
                    </p>

                    <h1 class="app-header__title">
                        ${config.name}
                    </h1>

                    <p class="app-header__description">
                        ${config.description}
                    </p>
                </header>

                <main class="app-content">
                    <p class="app-content__status">
                        Aplicação iniciada com sucesso
                    </p>
                </main>
            </div>
        `;
    }
}
