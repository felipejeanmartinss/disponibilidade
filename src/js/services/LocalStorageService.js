const STORAGE_KEY =
    "disponibilidade-unidades";

export class LocalStorageService {
    static load() {
        try {
            const storedData =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!storedData) {
                return null;
            }

            const parsedData =
                JSON.parse(storedData);

            if (!Array.isArray(parsedData)) {
                throw new Error(
                    "Os dados armazenados não possuem o formato esperado."
                );
            }

            return parsedData;
        } catch (error) {
            console.warn(
                "Não foi possível carregar os dados salvos:",
                error
            );

            return null;
        }
    }

    static save(units) {
        if (!Array.isArray(units)) {
            throw new Error(
                "O serviço de armazenamento precisa receber uma lista de unidades."
            );
        }

        try {
            const serializedData =
                JSON.stringify(units);

            localStorage.setItem(
                STORAGE_KEY,
                serializedData
            );
        } catch (error) {
            console.error(
                "Não foi possível salvar as unidades:",
                error
            );

            throw error;
        }
    }

    static clear() {
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