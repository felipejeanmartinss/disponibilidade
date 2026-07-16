const STORAGE_KEY = "disponibilidade-catalogo-pastas";

export class FolderCatalogService {
    static load() {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);

            if (!storedData) {
                return [];
            }

            const records = JSON.parse(storedData);

            if (!Array.isArray(records)) {
                throw new Error("O catálogo de pastas armazenado é inválido.");
            }

            return records;
        } catch (error) {
            console.warn("Não foi possível carregar o catálogo de pastas:", error);
            return [];
        }
    }

    static save(records) {
        if (!Array.isArray(records)) {
            throw new Error("O catálogo precisa receber uma lista de clientes.");
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        return records;
    }

    static findByNumber(folderNumber) {
        const normalizedNumber = String(folderNumber ?? "").trim();

        if (!normalizedNumber) {
            return null;
        }

        return FolderCatalogService.load().find(
            (record) => String(record.folderNumber).trim() === normalizedNumber
        ) ?? null;
    }

    static upsert(records) {
        const catalogByNumber = new Map(
            FolderCatalogService.load().map((record) => [
                String(record.folderNumber).trim(),
                record,
            ])
        );

        records.forEach((record) => {
            catalogByNumber.set(String(record.folderNumber).trim(), record);
        });

        return FolderCatalogService.save([...catalogByNumber.values()]);
    }

    static count() {
        return FolderCatalogService.load().length;
    }
}
