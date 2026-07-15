export const UNIT_TYPE = Object.freeze({
    STANDARD: "standard",
    GARDEN: "garden",
    COVERAGE_LINEAR: "coverage-linear",
    COVERAGE_DUPLEX: "coverage-duplex",
});

export const UNIT_TYPE_OPTIONS = Object.freeze([
    {
        value: UNIT_TYPE.STANDARD,
        label: "Tipo",
    },
    {
        value: UNIT_TYPE.GARDEN,
        label: "Garden",
    },
    {
        value: UNIT_TYPE.COVERAGE_LINEAR,
        label: "Cobertura linear",
    },
    {
        value: UNIT_TYPE.COVERAGE_DUPLEX,
        label: "Cobertura dúplex",
    },
]);

export function getUnitTypeByValue(value) {
    return UNIT_TYPE_OPTIONS.find(
        (option) => option.value === value
    ) ?? UNIT_TYPE_OPTIONS[0];
}
