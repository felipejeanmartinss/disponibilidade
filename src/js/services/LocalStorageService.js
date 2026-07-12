const STORAGE_KEY = "disponibilidade-unidades";

export class LocalStorageService {

    static load() {

        const data =
            localStorage.getItem(STORAGE_KEY);

        if (!data) {
            return null;
        }

        try {

            return JSON.parse(data);

        } catch {

            console.warn(
                "Não foi possível carregar os dados salvos."
            );

            return null;
        }
    }

    static save(units) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(units)
        );

    }

    static clear() {

        localStorage.removeItem(STORAGE_KEY);

    }

}