import {
    ProjectConfig,
} from "../models/ProjectConfig.js";

const STORAGE_KEY =
    "disponibilidade-project-config";

export class ProjectConfigService {
    static load(defaultConfig) {
        try {
            const storedData =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!storedData) {
                return defaultConfig;
            }

            const parsedData =
                JSON.parse(storedData);

            return new ProjectConfig(
                parsedData
            );
        } catch (error) {
            console.warn(
                "Não foi possível carregar a configuração salva:",
                error
            );

            ProjectConfigService.reset();

            return defaultConfig;
        }
    }

    static save(projectConfig) {
        if (
            !projectConfig ||
            typeof projectConfig.toJSON !==
                "function"
        ) {
            throw new Error(
                "A configuração do empreendimento é inválida."
            );
        }

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    projectConfig
                )
            );
        } catch (error) {
            console.error(
                "Não foi possível salvar a configuração:",
                error
            );

            throw error;
        }
    }

    static reset() {
        localStorage.removeItem(
            STORAGE_KEY
        );
    }

    static hasData() {
        return (
            localStorage.getItem(
                STORAGE_KEY
            ) !== null
        );
    }
}