import {
    escapeHtml,
} from "../utils/html.js";

export class PublicMapView {
    constructor(rootElement) {
        this.rootElement = rootElement;
    }

    render(snapshot) {
        const highestFloor =
            Math.max(
                1,
                ...snapshot.blocks.map(
                    (block) =>
                        block.floors
                )
            );

        const requestedPageCount =
            Number(
                snapshot.display
                    ?.pageCount ?? 1
            );

        const pageCount =
            Math.min(
                20,
                highestFloor,
                Math.max(
                    1,
                    Number.isInteger(
                        requestedPageCount
                    )
                        ? requestedPageCount
                        : 1
                )
            );

        const rotationSeconds =
            Math.min(
                3600,
                Math.max(
                    3,
                    Number(
                        snapshot.display
                            ?.rotationSeconds ?? 15
                    ) || 15
                )
            );

        const pages =
            Array.from(
                { length: pageCount },
                (_, pageIndex) => `
                    <section
                        class="public-map__page"
                        data-public-page="${pageIndex}"
                        ${pageIndex === 0 ? "" : "hidden"}
                    >
                        ${snapshot.blocks.map(
                            (block) => {
                                const floors =
                                    PublicMapView.getPageFloors({
                                        totalFloors:
                                            block.floors,
                                        pageCount,
                                        pageIndex,
                                    });

                                if (!floors.length) {
                                    return "";
                                }

                                return `
                                    ${snapshot.blocks.length > 1
                                        ? `<h2 class="public-matrix__title">${escapeHtml(block.name ?? "Bloco")}</h2>`
                                        : ""}

                                    ${PublicMapView.renderMatrix({
                                        block,
                                        floors,
                                        units:
                                            snapshot.units,
                                        statuses:
                                            snapshot.statuses,
                                        channels:
                                            snapshot.channels,
                                    })}
                                `;
                            }
                        ).join("")}
                    </section>
                `
            ).join("");

        this.rootElement.innerHTML = `
            <main
                class="public-map"
                data-public-map
                data-page-count="${pageCount}"
                data-rotation-seconds="${rotationSeconds}"
            >
                <header class="public-map__header">
                    <div
                        class="public-map__legend"
                        aria-label="Legenda de status"
                    >
                        ${PublicMapView.renderStatusLegend(
                            snapshot.statuses
                        )}
                    </div>

                    <div class="public-map__pagination">
                        <strong data-public-page-indicator>
                            Página 1 de ${pageCount}
                        </strong>

                        <span data-public-page-countdown>
                            ${pageCount > 1
                                ? `${rotationSeconds}s`
                                : ""}
                        </span>
                    </div>
                </header>

                <div class="public-map__pages">
                    ${pages}
                </div>
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
        floors,
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
            PublicMapView.createOccupiedCellsMap(
                blockUnits
            );

        const visibleFloors =
            new Set(floors);

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

        floors.forEach((floor) => {
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
                    const occupyingUnit =
                        occupiedCells.get(key);

                    if (
                        !visibleFloors.has(
                            occupyingUnit
                                .anchorFloor
                        )
                    ) {
                        content.push(
                            '<div class="public-matrix__empty"></div>'
                        );
                    }

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
                        rowSpan:
                            Math.max(
                                1,
                                Array.from(
                                    {
                                        length:
                                            unit.rowSpan,
                                    },
                                    (_, index) =>
                                        unit.anchorFloor -
                                        index
                                ).filter(
                                    (occupiedFloor) =>
                                        visibleFloors.has(
                                            occupiedFloor
                                        )
                                ).length
                            ),
                        statuses,
                        channels,
                    })
                );
            }
        });

        return `
            <section class="public-matrix__viewport">
                <div
                    class="public-matrix"
                    style="
                        --public-columns: ${block.columns};
                        --public-fit-row: calc(
                            ${(100 / floors.length).toFixed(4)}vh - ${Math.ceil(88 / floors.length)}px - 0.5vw
                        );
                    "
                >
                    ${content.join("")}
                </div>
            </section>
        `;
    }

    static getPageFloors({
        totalFloors,
        pageCount,
        pageIndex,
    }) {
        const baseSize =
            Math.floor(
                totalFloors / pageCount
            );

        const remainder =
            totalFloors % pageCount;

        const pageSize =
            baseSize +
            (pageIndex < remainder
                ? 1
                : 0);

        const precedingFloors =
            pageIndex * baseSize +
            Math.min(
                pageIndex,
                remainder
            );

        const firstFloor =
            totalFloors -
            precedingFloors;

        return Array.from(
            { length: pageSize },
            (_, index) =>
                firstFloor - index
        );
    }

    static renderStatusLegend(statuses) {
        return statuses
            .map((status) => `
                <span class="public-map__legend-item">
                    <span
                        class="public-map__legend-sample"
                        style="background: ${escapeHtml(status.color)};"
                        aria-hidden="true"
                    ></span>

                    ${escapeHtml(status.label)}
                </span>
            `)
            .join("");
    }

    static renderUnit({
        unit,
        rowSpan = unit.rowSpan,
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
                    grid-row: span ${rowSpan};
                    --public-status: ${escapeHtml(status.color)};
                    --public-text: ${escapeHtml(status.textColor)};
                "
                aria-label="Unidade ${escapeHtml(unit.displayCode)}, ${escapeHtml(status.label)}"
            >
                <div class="public-unit-card__channel-slot">
                    ${channelLabel}
                </div>

                <strong class="public-unit-card__number">
                    ${escapeHtml(unit.displayCode)}
                </strong>

                <span class="public-unit-card__status">
                    ${escapeHtml(status.label)}
                </span>
            </article>
        `;
    }

    static createOccupiedCellsMap(units) {
        const cells = new Map();

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
                    cells.set(
                        PublicMapView.getCellKey(
                            unit.anchorFloor +
                                (unit.rowSpan > 1
                                    ? -floorOffset
                                    : floorOffset),
                            unit.anchorColumn +
                                columnOffset
                        ),
                        unit
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
