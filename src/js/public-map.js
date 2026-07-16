import {
    PublicMapService,
} from "./services/PublicMapService.js";

import {
    PublicMapView,
} from "./views/PublicMapView.js";

function startPageRotation(
    rootElement
) {
    const map =
        rootElement.querySelector(
            "[data-public-map]"
        );

    const pages =
        Array.from(
            rootElement.querySelectorAll(
                "[data-public-page]"
            )
        );

    const indicator =
        rootElement.querySelector(
            "[data-public-page-indicator]"
        );

    const countdown =
        rootElement.querySelector(
            "[data-public-page-countdown]"
        );

    const rotationSeconds =
        Math.max(
            3,
            Number(
                map?.dataset
                    .rotationSeconds ?? 15
            ) || 15
        );

    let activePage = 0;
    let remainingSeconds =
        rotationSeconds;

    const updateControls =
        () => {
            pages.forEach(
                (page, index) => {
                    const isActive =
                        index === activePage;

                    page.hidden =
                        !isActive;

                    page.setAttribute(
                        "aria-hidden",
                        String(!isActive)
                    );
                }
            );

            if (indicator) {
                indicator.textContent =
                    `Página ${activePage + 1} de ${pages.length}`;
            }

            if (countdown) {
                countdown.textContent =
                    pages.length > 1
                        ? `${remainingSeconds}s`
                        : "";
            }
        };

    updateControls();

    if (pages.length <= 1) {
        return () => {};
    }

    const timerId =
        window.setInterval(
            () => {
                remainingSeconds -= 1;

                if (remainingSeconds <= 0) {
                    activePage =
                        (activePage + 1) %
                        pages.length;

                    remainingSeconds =
                        rotationSeconds;
                }

                updateControls();
            },
            1000
        );

    return () => {
        window.clearInterval(
            timerId
        );
    };
}

async function bootstrapPublicMap() {
    const rootElement =
        document.getElementById(
            "public-map-app"
        );

    if (!rootElement) {
        return;
    }

    const view =
        new PublicMapView(rootElement);

    const slug =
        new URLSearchParams(
            window.location.search
        ).get("map");

    if (!slug) {
        view.renderError(
            "O endereço do mapa está incompleto."
        );
        return;
    }

    try {
        const service =
            new PublicMapService();

        const publicMap =
            await service.load(slug);

        if (!publicMap?.snapshot) {
            view.renderError(
                "Este link não existe ou foi desativado."
            );
            return;
        }

        view.render(
            publicMap.snapshot
        );

        let stopPageRotation =
            startPageRotation(
                rootElement
            );

        let lastUpdatedAt =
            publicMap.updated_at;

        let refreshQueue =
            Promise.resolve();

        const refreshMap =
            () => {
                refreshQueue =
                    refreshQueue
                        .then(async () => {
                            const updatedMap =
                                await service.load(
                                    slug
                                );

                            if (
                                !updatedMap?.snapshot ||
                                updatedMap.updated_at ===
                                    lastUpdatedAt
                            ) {
                                return;
                            }

                            lastUpdatedAt =
                                updatedMap.updated_at;

                            const scrollPosition = {
                                x: window.scrollX,
                                y: window.scrollY,
                            };

                            stopPageRotation();

                            view.render(
                                updatedMap.snapshot
                            );

                            stopPageRotation =
                                startPageRotation(
                                    rootElement
                                );

                            window.scrollTo(
                                scrollPosition.x,
                                scrollPosition.y
                            );
                        })
                        .catch((error) => {
                            console.error(
                                "Falha ao atualizar o mapa público:",
                                error
                            );
                        });

                return refreshQueue;
            };

        const unsubscribe =
            service.subscribe(
                slug,
                refreshMap
            );

        const pollingId =
            window.setInterval(
                refreshMap,
                5000
            );

        window.addEventListener(
            "beforeunload",
            () => {
                window.clearInterval(
                    pollingId
                );

                stopPageRotation();
                unsubscribe();
            },
            { once: true }
        );
    } catch (error) {
        console.error(
            "Falha ao carregar o mapa público:",
            error
        );

        view.renderError(
            "Não foi possível carregar o mapa neste momento."
        );
    }
}

await bootstrapPublicMap();
