import {
    AppearanceService,
} from "../services/AppearanceService.js";

export class AppearanceController {
    constructor({
        rootElement,
        projectConfig,
        onAppearanceChange,
    }) {
        this.rootElement = rootElement;
        this.projectConfig = projectConfig;
        this.onAppearanceChange =
            onAppearanceChange;
        this.handleSubmit =
            this.handleSubmit.bind(this);
    }

    init() {
        this.rootElement.addEventListener(
            "submit",
            this.handleSubmit
        );
    }

    handleSubmit(event) {
        if (
            !event.target.matches(
                "[data-appearance-form]"
            )
        ) {
            return;
        }

        event.preventDefault();

        try {
            AppearanceService.update(
                this.projectConfig,
                new FormData(event.target)
            );
            this.onAppearanceChange(
                this.projectConfig
            );
        } catch (error) {
            window.alert(error.message);
        }
    }
}
