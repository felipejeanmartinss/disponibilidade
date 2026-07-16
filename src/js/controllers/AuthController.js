export class AuthController {
    constructor({
        rootElement,
        authService,
    }) {
        this.rootElement = rootElement;
        this.authService = authService;
        this.handleClick =
            this.handleClick.bind(this);
        this.handleSubmit =
            this.handleSubmit.bind(this);
    }

    init() {
        this.rootElement.addEventListener(
            "click",
            this.handleClick
        );

        this.rootElement.addEventListener(
            "submit",
            this.handleSubmit
        );
    }

    async handleSubmit(event) {
        const form =
            event.target.closest(
                "[data-auth-form]"
            );

        if (!form) {
            return;
        }

        event.preventDefault();

        await this.signIn(form);
    }

    async handleClick(event) {

        const signOutButton =
            event.target.closest(
                "[data-auth-sign-out]"
            );

        if (signOutButton) {
            await this.signOut(
                signOutButton
            );
        }
    }

    async signIn(form) {
        const button =
            form.querySelector(
                "[data-auth-sign-in]"
            );

        const formData =
            new FormData(form);

        this.showError("");

        this.setButtonState(
            button,
            true,
            "Entrando..."
        );

        try {
            await this.authService
                .signInWithPassword({
                    email:
                        formData.get("email"),
                    password:
                        formData.get("password"),
                });

            window.location.reload();
        } catch (error) {
            console.error(
                "Falha no login:",
                error
            );

            this.showError(
                "E-mail ou senha inválidos. Verifique os dados e tente novamente."
            );

            this.setButtonState(
                button,
                false,
                "Entrar"
            );
        }
    }

    async signOut(button) {
        this.setButtonState(
            button,
            true,
            "Saindo..."
        );

        try {
            await this.authService.signOut();
            window.location.reload();
        } catch (error) {
            console.error(
                "Falha ao encerrar a sessão:",
                error
            );

            window.alert(
                "Não foi possível encerrar a sessão. Tente novamente."
            );

            this.setButtonState(
                button,
                false,
                "Sair"
            );
        }
    }

    setButtonState(
        button,
        disabled,
        label
    ) {
        button.disabled = disabled;
        button.textContent = label;
    }

    showError(message) {
        const errorElement =
            this.rootElement.querySelector(
                "[data-auth-error]"
            );

        if (!errorElement) {
            return;
        }

        errorElement.textContent = message;
        errorElement.hidden = !message;
    }
}
