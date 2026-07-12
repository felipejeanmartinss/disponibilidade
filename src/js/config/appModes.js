export const APP_MODE = Object.freeze({
    OPERATION: "operation",
    CONFIGURATION: "configuration",
    EXECUTIVE: "executive",
});

export const APP_MODE_OPTIONS = Object.freeze([
    Object.freeze({
        value: APP_MODE.OPERATION,
        label: "Operação",
    }),

    Object.freeze({
        value: APP_MODE.CONFIGURATION,
        label: "Configuração",
    }),

    Object.freeze({
        value: APP_MODE.EXECUTIVE,
        label: "Visão executiva",
    }),
]);