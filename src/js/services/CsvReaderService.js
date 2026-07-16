export class CsvReaderService {
    static async read(file) {
        if (
            !file ||
            typeof file.name !== "string" ||
            typeof file.text !== "function"
        ) {
            throw new Error("Selecione um arquivo CSV válido.");
        }

        if (!file.name.toLowerCase().endsWith(".csv")) {
            throw new Error("Nesta etapa, o arquivo precisa estar no formato CSV.");
        }

        const content = await file.text();
        return CsvReaderService.parse(content);
    }

    static parse(content) {
        const source = String(content ?? "").replace(/^\uFEFF/, "");

        if (!source.trim()) {
            throw new Error("O arquivo CSV está vazio.");
        }

        const delimiter = CsvReaderService.detectDelimiter(source);
        const records = CsvReaderService.parseRecords(source, delimiter)
            .filter((record) => record.some((value) => value.trim()));

        if (records.length < 2) {
            throw new Error("O CSV precisa ter cabeçalho e pelo menos uma linha de dados.");
        }

        const headers = records[0].map((header) => header.trim());

        if (headers.some((header) => !header)) {
            throw new Error("O cabeçalho do CSV possui uma coluna sem nome.");
        }

        return records.slice(1).map((record) =>
            Object.fromEntries(
                headers.map((header, index) => [
                    header,
                    record[index]?.trim() ?? "",
                ])
            )
        );
    }

    static detectDelimiter(content) {
        const firstLine = content.split(/\r?\n/, 1)[0] ?? "";
        const candidates = [";", ",", "\t"];

        return candidates.reduce(
            (best, candidate) =>
                CsvReaderService.countDelimiter(firstLine, candidate) >
                CsvReaderService.countDelimiter(firstLine, best)
                    ? candidate
                    : best,
            ";"
        );
    }

    static countDelimiter(line, delimiter) {
        let count = 0;
        let quoted = false;

        for (let index = 0; index < line.length; index += 1) {
            const character = line[index];

            if (character === '"') {
                if (quoted && line[index + 1] === '"') {
                    index += 1;
                } else {
                    quoted = !quoted;
                }
            } else if (character === delimiter && !quoted) {
                count += 1;
            }
        }

        return count;
    }

    static parseRecords(content, delimiter) {
        const records = [];
        let record = [];
        let field = "";
        let quoted = false;

        for (let index = 0; index < content.length; index += 1) {
            const character = content[index];

            if (character === '"') {
                if (quoted && content[index + 1] === '"') {
                    field += '"';
                    index += 1;
                } else {
                    quoted = !quoted;
                }
                continue;
            }

            if (character === delimiter && !quoted) {
                record.push(field);
                field = "";
                continue;
            }

            if ((character === "\n" || character === "\r") && !quoted) {
                if (character === "\r" && content[index + 1] === "\n") {
                    index += 1;
                }
                record.push(field);
                records.push(record);
                record = [];
                field = "";
                continue;
            }

            field += character;
        }

        if (quoted) {
            throw new Error("O CSV possui aspas abertas sem fechamento.");
        }

        if (field || record.length) {
            record.push(field);
            records.push(record);
        }

        return records;
    }
}
