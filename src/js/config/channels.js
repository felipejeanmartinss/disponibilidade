export const SALES_CHANNEL = Object.freeze({
    TEGRA_SALAO: "tegra-salao",
    TEGRA_PARCERIAS: "tegra-parcerias",
    LOPES_RIO: "lopes-rio",
    SOMMA_RIO: "somma-rio",
    EVS: "evs",
});

export const SALES_CHANNEL_OPTIONS = Object.freeze([
    Object.freeze({
        value: SALES_CHANNEL.TEGRA_SALAO,
        label: "Tegra Vendas - Salão",
        shortLabel: "Tegra",
        logoPath: "./assets/logos/channels/tegra.svg",
    }),

    Object.freeze({
        value: SALES_CHANNEL.TEGRA_PARCERIAS,
        label: "Tegra Vendas - Parcerias",
        shortLabel: "Parcerias",
        logoPath: "./assets/logos/channels/tegra-parcerias.svg",
    }),

    Object.freeze({
        value: SALES_CHANNEL.LOPES_RIO,
        label: "Lopes Rio",
        shortLabel: "Lopes",
        logoPath: "./assets/logos/channels/lopes-rio.svg",
    }),

    Object.freeze({
        value: SALES_CHANNEL.SOMMA_RIO,
        label: "Somma Rio",
        shortLabel: "Somma",
        logoPath: "./assets/logos/channels/somma-rio.svg",
    }),

    Object.freeze({
        value: SALES_CHANNEL.EVS,
        label: "EV's",
        shortLabel: "EV's",
        logoPath: "./assets/logos/channels/evs.svg",
    }),
]);

export function getChannelByValue(channelValue) {
    return (
        SALES_CHANNEL_OPTIONS.find(
            (channel) => channel.value === channelValue
        ) ?? null
    );
}
