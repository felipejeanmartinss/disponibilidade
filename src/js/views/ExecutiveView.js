export class ExecutiveView {
    static render({
        units,
    }) {
        const statistics =
            ExecutiveView.calculateStatistics(
                units
            );

        return `
            <section class="workspace-panel">
                <header class="workspace-panel__header">
                    <div>
                        <p class="modal__eyebrow">
                            Gestão
                        </p>

                        <h2 class="workspace-panel__title">
                            Visão executiva
                        </h2>

                        <p class="workspace-panel__description">
                            Resumo consolidado da posição
                            comercial do empreendimento.
                        </p>
                    </div>

                    <span class="system-status">
                        Atualizado
                    </span>
                </header>

                <div class="kpi-list">
                    ${ExecutiveView.renderKpiItem(
                        "Total",
                        statistics.total
                    )}

                    ${ExecutiveView.renderKpiItem(
                        "Disponíveis",
                        statistics.available
                    )}

                    ${ExecutiveView.renderKpiItem(
                        "Reservadas",
                        statistics.reserved
                    )}

                    ${ExecutiveView.renderKpiItem(
                        "Vendidas",
                        statistics.sold
                    )}

                    ${ExecutiveView.renderKpiItem(
                        "VSO",
                        `${statistics.salesRate}%`
                    )}
                </div>

                <div class="workspace-panel__placeholder">
                    <div>
                        <h3>
                            Dashboard executivo
                        </h3>

                        <p>
                            Gráficos e indicadores
                            consolidados serão adicionados
                            nesta área.
                        </p>
                    </div>
                </div>
            </section>
        `;
    }

    static calculateStatistics(units) {
        const available =
            units.filter(
                (unit) =>
                    unit.status ===
                    "available"
            ).length;

        const reserved =
            units.filter(
                (unit) =>
                    unit.status ===
                    "reserved"
            ).length;

        const sold =
            units.filter(
                (unit) =>
                    unit.status ===
                    "sold"
            ).length;

        const salesRate =
            units.length > 0
                ? Math.round(
                      (sold /
                          units.length) *
                          100
                  )
                : 0;

        return {
            total: units.length,
            available,
            reserved,
            sold,
            salesRate,
        };
    }

    static renderKpiItem(
        label,
        value
    ) {
        return `
            <div class="kpi-item">
                <span class="kpi-item__label">
                    ${label}
                </span>

                <strong class="kpi-item__value">
                    ${value}
                </strong>
            </div>
        `;
    }
}