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

        let refreshQueue =
            Promise.resolve();

        const unsubscribe =
            service.subscribe(
                slug,
                () => {
                    refreshQueue =
                        refreshQueue
                            .then(async () => {
                                const updatedMap =
                                    await service.load(
                                        slug
                                    );

                                if (
                                    updatedMap?.snapshot
                                ) {
                                    view.render(
                                        updatedMap.snapshot
                                    );
                                }
                            })
                            .catch((error) => {
                                console.error(
                                    "Falha ao atualizar o mapa público:",
                                    error
                                );
                            });
                }
            );

        window.addEventListener(
            "beforeunload",
            unsubscribe,
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
