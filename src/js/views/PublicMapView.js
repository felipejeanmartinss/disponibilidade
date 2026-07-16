import {
    escapeHtml,
} from "../utils/html.js";

export class PublicMapView {
    constructor(rootElement) {
        this.rootElement = rootElement;
    }

    render(snapshot) {
        const matrices =
            snapshot.blocks.map(
                (block) =>
                    PublicMapView.renderMatrix({
                        block,
                        units:
                            snapshot.units,
                        statuses:
                            snapshot.statuses,
                        channels:
                            snapshot.channels,
                    })
            ).join("");

        this.rootElement.innerHTML = `
            <main class="public-map">
                ${matrices}
            </main>
        `;
    }

    renderError(message) {
        this.rootElement.innerHTML = `
            <main class="public-map-message">
                <h1>Mapa indisponível</h1>
                <p>${escapeHtml(message)}</p>
            </main>
        `;
    }

    static renderMatrix({
        block,
        units,
        statuses,
        channels,
    }) {
        const blockUnits =
            units.filter(
                (unit) =>
                    unit.blockId === block.id
            );

        const unitsByAnchor =
            new Map(
                blockUnits.map((unit) => [
                    PublicMapView.getCellKey(
                        unit.anchorFloor,
                        unit.anchorColumn
                    ),
                    unit,
                ])
            );

        const occupiedCells =
            PublicMapView.createOccupiedCellsSet(
                blockUnits
            );

        const excludedCells =
            new Set(
                block.excludedCells.map(
                    (cell) =>
                        PublicMapView.getCellKey(
                            cell.floor,
                            cell.column
                        )
                )
            );

        const content = [];

        for (
            let floor = block.floors;
            floor >= 1;
            floor -= 1
        ) {
            content.push(`
                <div class="public-matrix__floor">
                    ${floor}º
                </div>
            `);

            for (
                let column = 1;
                column <= block.columns;
                column += 1
            ) {
                const key =
                    PublicMapView.getCellKey(
                        floor,
                        column
                    );

                const unit =
                    unitsByAnchor.get(key);

                if (
                    occupiedCells.has(key) &&
                    !unit
                ) {
                    continue;
                }

                if (excludedCells.has(key)) {
                    content.push(
                        '<div class="public-matrix__empty"></div>'
                    );
                    continue;
                }

                if (!unit) {
                    content.push(
                        '<div class="public-matrix__empty"></div>'
                    );
                    continue;
                }

                content.push(
                    PublicMapView.renderUnit({
                        unit,
                        statuses,
                        channels,
                    })
                );
            }
        }

        return `
            <section class="public-matrix__viewport">
                <div
                    class="public-matrix"
                    style="
                        --public-columns: ${block.columns};
                        --public-fit-row: calc(
                            ${(100 / block.floors).toFixed(4)}vh - 0.5vw
                        );
                    "
                >
                    ${content.join("")}
                </div>
            </section>
        `;
    }

    static renderUnit({
        unit,
        statuses,
        channels,
    }) {
        const status =
            statuses.find(
                (item) =>
                    item.value === unit.status
            ) ?? {
                label: unit.status,
                color: "#DCDCDC",
                textColor: "#0F172A",
            };

        const channel =
            channels.find(
                (item) =>
                    item.value === unit.channel
            );

        const channelLabel = channel
            ? `
                <span
                    class="public-unit-card__channel"
                    style="--public-channel: ${escapeHtml(channel.color)};"
                >
                    ${escapeHtml(channel.shortLabel)}
                </span>
            `
            : "";

        return `
            <article
                class="public-matrix__unit public-unit-card"
                style="
                    grid-column: span ${unit.columnSpan};
                    grid-row: span ${unit.rowSpan};
                    --public-status: ${escapeHtml(status.color)};
                    --public-text: ${escapeHtml(status.textColor)};
                "
                aria-label="Unidade ${escapeHtml(unit.displayCode)}, ${escapeHtml(status.label)}"
            >
                ${channelLabel}

                <strong class="public-unit-card__number">
                    ${escapeHtml(unit.displayCode)}
                </strong>

                <span class="public-unit-card__status">
                    ${escapeHtml(status.label)}
                </span>
            </article>
        `;
    }

    static createOccupiedCellsSet(units) {
        const cells = new Set();

        units.forEach((unit) => {
            for (
                let floorOffset = 0;
                floorOffset < unit.rowSpan;
                floorOffset += 1
            ) {
                for (
                    let columnOffset = 0;
                    columnOffset < unit.columnSpan;
                    columnOffset += 1
                ) {
                    cells.add(
                        PublicMapView.getCellKey(
                            unit.anchorFloor +
                                (unit.rowSpan > 1
                                    ? -floorOffset
                                    : floorOffset),
                            unit.anchorColumn +
                                columnOffset
                        )
                    );
                }
            }
        });

        return cells;
    }

    static getCellKey(
        floor,
        column
    ) {
        return `${floor}-${column}`;
    }
}
