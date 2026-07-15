/**
 * Camada de domínio para futuras importações CSV/XLSX.
 * O adaptador de arquivo deverá transformar a planilha em um array de objetos
 * e entregar as linhas para `prepare` ou `apply`.
 */
export class FolderImportService {
    static FIELD_ALIASES = Object.freeze({
        unit: ["unidade", "unit", "codigo unidade"],
        block: ["bloco", "block"],
        folderNumber: ["pasta", "numero pasta", "n pasta", "pasta numero"],
        folderType: ["tipo", "tipo pasta"],
        clientName: ["cliente", "nome cliente", "nome do cliente"],
        channel: ["canal", "canal de vendas"],
        partner: ["parceira", "imobiliaria parceira"],
        director: ["diretor"],
        partnerManager: ["gerente parceiro"],
        coordinator: ["coordenador"],
        manager: ["gerente"],
        broker: ["corretor"],
    });

    static normalizeHeader(value) {
        return String(value ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[º°#._-]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }

    static normalizeRow(row) {
        const normalizedEntries = Object.entries(row ?? {}).map(
            ([key, value]) => [FolderImportService.normalizeHeader(key), value]
        );
        const source = Object.fromEntries(normalizedEntries);
        const result = {};

        Object.entries(FolderImportService.FIELD_ALIASES).forEach(
            ([field, aliases]) => {
                const alias = aliases.find((item) => source[item] !== undefined);
                result[field] = alias ? String(source[alias] ?? "").trim() : "";
            }
        );

        return result;
    }

    static prepare(rows, units) {
        if (!Array.isArray(rows)) {
            throw new Error("A base de pastas precisa ser uma lista de linhas.");
        }

        const unitIndex = new Map();
        units.forEach((unit) => {
            const code = String(unit.displayCode).toLowerCase();
            unitIndex.set(`${String(unit.blockId).toLowerCase()}|${code}`, unit);
            unitIndex.set(`${String(unit.block).toLowerCase()}|${code}`, unit);
        });

        const updates = [];
        const errors = [];

        rows.forEach((rawRow, index) => {
            const row = FolderImportService.normalizeRow(rawRow);
            const matchingUnits = units.filter(
                (unit) => String(unit.displayCode).toLowerCase() === row.unit.toLowerCase()
            );
            const unit = matchingUnits.length === 1
                ? matchingUnits[0]
                : unitIndex.get(
                    `${row.block.toLowerCase()}|${row.unit.toLowerCase()}`
                );

            if (!row.unit) {
                errors.push({ line: index + 2, message: "Unidade não informada." });
                return;
            }

            if (!unit) {
                errors.push({
                    line: index + 2,
                    message: `Unidade ${row.unit} não encontrada ou ambígua.`,
                });
                return;
            }

            updates.push({ unit, data: row, line: index + 2 });
        });

        return { updates, errors };
    }

    static apply(rows, units) {
        const preview = FolderImportService.prepare(rows, units);

        preview.updates.forEach(({ unit, data }) => {
            unit.update({
                channel: data.channel || unit.channel,
                partner: data.partner,
                director: data.director,
                partnerManager: data.partnerManager,
                coordinator: data.coordinator,
                manager: data.manager,
                broker: data.broker,
                folder: {
                    number: data.folderNumber,
                    type: data.folderType,
                    clientName: data.clientName,
                },
            });
        });

        return preview;
    }
}
