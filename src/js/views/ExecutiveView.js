import {
    escapeHtml,
} from "../utils/html.js";

export class ExecutiveView {
    static render({
        units,
        statuses,
        channels,
    }) {
        const statusSummary =
            ExecutiveView.createStatusSummary(
                units,
                statuses
            );
        const channelRanking =
            ExecutiveView.createRanking(
                units,
                "channel",
                channels
            );
        const managerRanking =
            ExecutiveView.createRanking(
                units,
                "manager"
            ).slice(0, 10);
        const sold = statusSummary.find(
            (status) => status.value === "sold"
        )?.count ?? 0;
        const salesRate = units.length
            ? Math.round((sold / units.length) * 100)
            : 0;

        return `
            <section class="executive-dashboard">
                <header class="executive-dashboard__header">
                    <div>
                        <p class="modal__eyebrow">Gestão</p>
                        <h2>Visão executiva</h2>
                        <p>
                            Indicadores consolidados da posição comercial
                            do empreendimento.
                        </p>
                    </div>

                    <div class="executive-dashboard__headline">
                        <span>VSO</span>
                        <strong>${salesRate}%</strong>
                    </div>
                </header>

                <section class="executive-summary" aria-label="Resumo por status">
                    ${statusSummary.map(
                        (status) => ExecutiveView.renderStatusCard(status)
                    ).join("")}
                </section>

                <div class="executive-grid executive-grid--overview">
                    <section class="executive-panel">
                        <header class="executive-panel__header">
                            <div>
                                <h3>Distribuição por status</h3>
                                <p>${units.length} unidades no total</p>
                            </div>
                        </header>

                        <div class="status-chart">
                            <div class="status-chart__pie"
                                style="background: ${ExecutiveView.createPieGradient(statusSummary)};"
                                role="img"
                                aria-label="${ExecutiveView.createPieDescription(statusSummary)}">
                                <div>
                                    <strong>${units.length}</strong>
                                    <span>unidades</span>
                                </div>
                            </div>

                            <div class="status-chart__legend">
                                ${statusSummary.map(
                                    (status) => ExecutiveView.renderPieLegend(status)
                                ).join("")}
                            </div>
                        </div>
                    </section>

                    <section class="executive-panel">
                        <header class="executive-panel__header">
                            <div>
                                <h3>Ranking de canais</h3>
                                <p>Unidades com canal atribuído</p>
                            </div>
                        </header>

                        ${ExecutiveView.renderRanking(channelRanking, "Nenhum canal informado")}
                    </section>
                </div>

                <div class="executive-grid executive-grid--details">
                    <section class="executive-panel">
                        <header class="executive-panel__header">
                            <div>
                                <h3>Top 10 gerentes</h3>
                                <p>Quantidade de propostas por responsável</p>
                            </div>
                        </header>

                        ${ExecutiveView.renderRanking(managerRanking, "Nenhum gerente informado")}
                    </section>

                    <section class="executive-panel" data-composition-panel>
                        <header class="executive-panel__header executive-panel__header--filter">
                            <div>
                                <h3>Composição de propostas</h3>
                                <p>
                                    <strong data-composition-total>${units.length}</strong>
                                    propostas consideradas
                                </p>
                            </div>

                            <label class="executive-channel-filter">
                                <span>Canal de vendas</span>
                                <select data-executive-channel-filter>
                                    <option value="">Todos</option>
                                    ${channels.map((channel) => `
                                        <option value="${escapeHtml(channel.value)}">
                                            ${escapeHtml(channel.label)}
                                        </option>
                                    `).join("")}
                                </select>
                            </label>
                        </header>

                        <div class="composition-chart">
                            ${statusSummary.map(
                                (status) => ExecutiveView.renderCompositionRow(status)
                            ).join("")}
                        </div>
                    </section>
                </div>
            </section>
        `;
    }

    static createStatusSummary(units, statuses) {
        return statuses.map((status) => {
            const count = units.filter(
                (unit) => unit.status === status.value
            ).length;

            return {
                ...status,
                count,
                percentage: units.length
                    ? Math.round((count / units.length) * 100)
                    : 0,
            };
        });
    }

    static createRanking(units, field, options = null) {
        const labels = new Map(
            (options ?? []).map((option) => [
                option.value,
                option.label,
            ])
        );
        const counts = new Map();

        units.forEach((unit) => {
            const rawValue = String(unit[field] ?? "").trim();
            if (!rawValue) return;

            const label = labels.get(rawValue) ?? rawValue;
            counts.set(label, (counts.get(label) ?? 0) + 1);
        });

        return Array.from(counts, ([label, count]) => ({
            label,
            count,
        })).sort((first, second) =>
            second.count - first.count ||
            first.label.localeCompare(second.label, "pt-BR")
        );
    }

    static renderStatusCard(status) {
        return `
            <article class="executive-status-card"
                style="--executive-status-color: ${status.color};">
                <span>${escapeHtml(status.label)}</span>
                <strong>${status.count}</strong>
                <small>${status.percentage}% do estoque</small>
            </article>
        `;
    }

    static createPieGradient(statuses) {
        const total = statuses.reduce(
            (sum, status) => sum + status.count,
            0
        );

        if (!total) {
            return "var(--color-gray-200) 0 100%";
        }

        let start = 0;
        return `conic-gradient(${statuses
            .filter((status) => status.count > 0)
            .map((status) => {
                const end = start + (status.count / total) * 100;
                const segment = `${status.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
                start = end;
                return segment;
            })
            .join(", ")})`;
    }

    static createPieDescription(statuses) {
        return statuses
            .filter((status) => status.count > 0)
            .map((status) =>
                `${status.label}: ${status.count}`
            )
            .join(". ") || "Nenhuma unidade cadastrada";
    }

    static renderPieLegend(status) {
        return `
            <div class="status-chart__legend-item">
                <span style="background: ${status.color};" aria-hidden="true"></span>
                <div>
                    <strong>${escapeHtml(status.label)}</strong>
                    <small>${status.count} · ${status.percentage}%</small>
                </div>
            </div>
        `;
    }

    static renderRanking(ranking, emptyMessage) {
        if (!ranking.length) {
            return `<p class="executive-empty">${emptyMessage}</p>`;
        }

        const maximum = ranking[0].count;
        return `
            <ol class="executive-ranking">
                ${ranking.map((item, index) => `
                    <li>
                        <span class="executive-ranking__position">${index + 1}</span>
                        <div class="executive-ranking__content">
                            <div>
                                <span>${escapeHtml(item.label)}</span>
                                <strong>${item.count}</strong>
                            </div>
                            <span class="executive-ranking__track">
                                <span style="width: ${(item.count / maximum) * 100}%;"></span>
                            </span>
                        </div>
                    </li>
                `).join("")}
            </ol>
        `;
    }

    static renderCompositionRow(status) {
        return `
            <div class="composition-chart__row" data-composition-status="${status.value}">
                <div>
                    <span class="composition-chart__dot"
                        style="background: ${status.color};" aria-hidden="true"></span>
                    <span>${escapeHtml(status.label)}</span>
                    <strong data-composition-value>${status.count}</strong>
                </div>
                <span class="composition-chart__track">
                    <span data-composition-bar
                        style="width: ${status.percentage}%; background: ${status.color};"></span>
                </span>
            </div>
        `;
    }
}
