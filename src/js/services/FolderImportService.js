/**
 * Camada de domínio da importação de pastas.
 * Adaptadores de CSV ou XLSX convertem o arquivo em uma lista de objetos
 * antes de entregar as linhas para este serviço.
 */
export class FolderImportService {
    static FIELD_ALIASES = Object.freeze({
        unit: ["unidade", "unit", "codigo unidade"],
        block: ["bloco", "block"],
        folderNumber: [
            "pasta",
            "numero pasta",
            "numero da pasta",
            "n pasta",
            "n da pasta",
            "pasta numero",
        ],
        folderType: ["tipo", "tipo pasta", "tipo da pasta"],
        clientName: ["cliente", "nome cliente", "nome do cliente"],
        channel: ["canal", "canal de vendas"],
        partner: ["parceira", "imobiliaria parceira"],
        superintendent: ["superintendente"],
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

    static prepare(rows, units, channels = []) {
        if (!Array.isArray(rows)) {
            throw new Error("A base de pastas precisa ser uma lista de linhas.");
        }

        if (!Array.isArray(units)) {
            throw new Error("A lista de unidades é inválida.");
        }

        const unitIndex = new Map();
        units.forEach((unit) => {
            const code = String(unit.displayCode).toLowerCase();
            unitIndex.set(`${String(unit.blockId).toLowerCase()}|${code}`, unit);
            unitIndex.set(`${String(unit.block).toLowerCase()}|${code}`, unit);
        });

        const updates = [];
        const errors = [];
        const importedUnits = new Set();

        rows.forEach((rawRow, index) => {
            const row = FolderImportService.normalizeRow(rawRow);
            const matchingUnits = units.filter(
                (unit) => String(unit.displayCode).toLowerCase() === row.unit.toLowerCase()
            );
            const unit = matchingUnits.length === 1
                ? matchingUnits[0]
                : unitIndex.get(`${row.block.toLowerCase()}|${row.unit.toLowerCase()}`);

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

            if (importedUnits.has(unit.id)) {
                errors.push({
                    line: index + 2,
                    message: `A unidade ${row.unit} aparece mais de uma vez na base.`,
                });
                return;
            }

            const channel = FolderImportService.resolveChannel(row.channel, channels);

            if (row.channel && !channel) {
                errors.push({
                    line: index + 2,
                    message: `Canal de vendas "${row.channel}" não encontrado.`,
                });
                return;
            }

            importedUnits.add(unit.id);
            updates.push({
                unit,
                data: {
                    ...row,
                    channel: channel?.value ?? "",
                    channelLabel: channel?.label ?? "",
                },
                line: index + 2,
            });
        });

        return { updates, errors };
    }

    static resolveChannel(value, channels) {
        const normalizedValue = FolderImportService.normalizeHeader(value);

        if (!normalizedValue) {
            return null;
        }

        return channels.find((channel) =>
            [channel.value, channel.label, channel.shortLabel]
                .filter(Boolean)
                .some(
                    (candidate) =>
                        FolderImportService.normalizeHeader(candidate) === normalizedValue
                )
        ) ?? null;
    }

    static valueOrCurrent(value, currentValue) {
        return String(value ?? "").trim() || currentValue;
    }

    static applyPrepared(preview) {
        if (!preview || !Array.isArray(preview.updates)) {
            throw new Error("A pré-visualização da importação é inválida.");
        }

        if (preview.errors?.length) {
            throw new Error("Corrija os erros da base antes de confirmar a importação.");
        }

        preview.updates.forEach(({ unit, data }) => {
            const channel = FolderImportService.valueOrCurrent(data.channel, unit.channel);

            unit.update({
                channel,
                partner: FolderImportService.valueOrCurrent(data.partner, unit.partner),
                superintendent: FolderImportService.valueOrCurrent(
                    data.superintendent,
                    unit.superintendent
                ),
                director: FolderImportService.valueOrCurrent(data.director, unit.director),
                partnerManager: FolderImportService.valueOrCurrent(
                    data.partnerManager,
                    unit.partnerManager
                ),
                coordinator: FolderImportService.valueOrCurrent(
                    data.coordinator,
                    unit.coordinator
                ),
                manager: FolderImportService.valueOrCurrent(data.manager, unit.manager),
                broker: FolderImportService.valueOrCurrent(data.broker, unit.broker),
                folder: {
                    number: FolderImportService.valueOrCurrent(
                        data.folderNumber,
                        unit.folder.number
                    ),
                    type: FolderImportService.valueOrCurrent(
                        data.folderType,
                        unit.folder.type
                    ),
                    clientName: FolderImportService.valueOrCurrent(
                        data.clientName,
                        unit.folder.clientName
                    ),
                },
            });
        });

        return preview;
    }

    static apply(rows, units, channels = []) {
        const preview = FolderImportService.prepare(rows, units, channels);
        return FolderImportService.applyPrepared(preview);
    }
}
