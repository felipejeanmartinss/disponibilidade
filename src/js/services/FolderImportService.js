import {
    FOLDER_TYPE_OPTIONS,
} from "../config/folderTypes.js";

/**
 * Converte linhas de uma base comercial em um catálogo de clientes indexado
 * pelo número da pasta. Nenhuma unidade é alterada durante a importação.
 */
export class FolderImportService {
    static FIELD_ALIASES = Object.freeze({
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

    static normalizeText(value) {
        return String(value ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();
    }

    static normalizeHeader(value) {
        return FolderImportService.normalizeText(value)
            .replace(/[º°#._-]/g, " ")
            .replace(/\s+/g, " ");
    }

    static normalizeRow(row) {
        const normalizedEntries = Object.entries(row ?? {}).map(
            ([key, value]) => [FolderImportService.normalizeHeader(key), value]
        );
        const source = Object.fromEntries(normalizedEntries);

        return Object.fromEntries(
            Object.entries(FolderImportService.FIELD_ALIASES).map(
                ([field, aliases]) => {
                    const alias = aliases.find((item) => source[item] !== undefined);
                    return [field, alias ? String(source[alias] ?? "").trim() : ""];
                }
            )
        );
    }

    static prepare(rows, channels = []) {
        if (!Array.isArray(rows)) {
            throw new Error("A base de pastas precisa ser uma lista de linhas.");
        }

        const records = [];
        const errors = [];
        const importedFolders = new Set();

        rows.forEach((rawRow, index) => {
            const line = index + 2;
            const row = FolderImportService.normalizeRow(rawRow);

            if (!row.folderNumber) {
                errors.push({ line, message: "Número da pasta não informado." });
                return;
            }

            if (!row.clientName) {
                errors.push({ line, message: "Nome do cliente não informado." });
                return;
            }

            if (importedFolders.has(row.folderNumber)) {
                errors.push({
                    line,
                    message: `A pasta ${row.folderNumber} aparece mais de uma vez na base.`,
                });
                return;
            }

            const folderType = FolderImportService.resolveFolderType(row.folderType);

            if (row.folderType && !folderType) {
                errors.push({
                    line,
                    message: `Tipo de pasta "${row.folderType}" inválido. Use Ouro, Prata ou Bronze.`,
                });
                return;
            }

            const channel = FolderImportService.resolveChannel(row.channel, channels);

            if (row.channel && !channel) {
                errors.push({
                    line,
                    message: `Canal de vendas "${row.channel}" não encontrado.`,
                });
                return;
            }

            importedFolders.add(row.folderNumber);
            records.push({
                folderNumber: row.folderNumber,
                folderType: folderType?.value ?? "",
                folderTypeLabel: folderType?.label ?? "",
                clientName: row.clientName,
                channel: channel?.value ?? "",
                channelLabel: channel?.label ?? "",
                partner: row.partner,
                superintendent: row.superintendent,
                director: row.director,
                partnerManager: row.partnerManager,
                coordinator: row.coordinator,
                manager: row.manager,
                broker: row.broker,
                line,
            });
        });

        return { records, errors };
    }

    static resolveFolderType(value) {
        const normalizedValue = FolderImportService.normalizeText(value);

        if (!normalizedValue) {
            return null;
        }

        return FOLDER_TYPE_OPTIONS.find(
            (option) =>
                FolderImportService.normalizeText(option.value) === normalizedValue ||
                FolderImportService.normalizeText(option.label) === normalizedValue
        ) ?? null;
    }

    static resolveChannel(value, channels) {
        const normalizedValue = FolderImportService.normalizeText(value);

        if (!normalizedValue) {
            return null;
        }

        return channels.find((channel) =>
            [channel.value, channel.label, channel.shortLabel]
                .filter(Boolean)
                .some(
                    (candidate) =>
                        FolderImportService.normalizeText(candidate) === normalizedValue
                )
        ) ?? null;
    }
}
