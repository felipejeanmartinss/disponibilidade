export const UNIT_STATUS = Object.freeze({
    AVAILABLE: "available",
    SOLD: "sold",
    SIGNING: "signing",
    CONTRACT_PROCESS: "contract-process",
    APPROVED: "approved",
    RESERVED: "reserved",
});

export const UNIT_STATUS_OPTIONS = Object.freeze([
    Object.freeze({
        value: UNIT_STATUS.AVAILABLE,
        label: "Disponível",
    }),

    Object.freeze({
        value: UNIT_STATUS.SOLD,
        label: "Vendida",
    }),

    Object.freeze({
        value: UNIT_STATUS.SIGNING,
        label: "Em assinatura",
    }),

    Object.freeze({
        value: UNIT_STATUS.CONTRACT_PROCESS,
        label: "Contrato em processo",
    }),

    Object.freeze({
        value: UNIT_STATUS.APPROVED,
        label: "Aprovada",
    }),

    Object.freeze({
        value: UNIT_STATUS.RESERVED,
        label: "Reservada",
    }),
]);

export const UNIT_STATUS_BY_VALUE = Object.freeze(
    Object.fromEntries(
        UNIT_STATUS_OPTIONS.map((status) => [
            status.value,
            status,
        ])
    )
);

export function getStatusByValue(statusValue) {
    return (
        UNIT_STATUS_BY_VALUE[statusValue] ??
        UNIT_STATUS_BY_VALUE[UNIT_STATUS.AVAILABLE]
    );
}