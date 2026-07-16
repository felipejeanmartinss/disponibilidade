import {
    PublicMapService,
} from "./services/PublicMapService.js";

import {
    PublicMapView,
} from "./views/PublicMapView.js";

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

                            view.render(
                                updatedMap.snapshot
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
