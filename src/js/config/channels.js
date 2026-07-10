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
    }),

    Object.freeze({
        value: SALES_CHANNEL.TEGRA_PARCERIAS,
        label: "Tegra Vendas - Parcerias",
    }),

    Object.freeze({
        value: SALES_CHANNEL.LOPES_RIO,
        label: "Lopes Rio",
    }),

    Object.freeze({
        value: SALES_CHANNEL.SOMMA_RIO,
        label: "Somma Rio",
    }),

    Object.freeze({
        value: SALES_CHANNEL.EVS,
        label: "EV's",
    }),
]);

export function getChannelByValue(channelValue) {
    return (
        SALES_CHANNEL_OPTIONS.find(
            (channel) => channel.value === channelValue
        ) ?? null
    );
}