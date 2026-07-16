export const FOLDER_TYPE = Object.freeze({
    GOLD: "ouro",
    SILVER: "prata",
    BRONZE: "bronze",
});

export const FOLDER_TYPE_OPTIONS = Object.freeze([
    Object.freeze({ value: FOLDER_TYPE.GOLD, label: "Ouro" }),
    Object.freeze({ value: FOLDER_TYPE.SILVER, label: "Prata" }),
    Object.freeze({ value: FOLDER_TYPE.BRONZE, label: "Bronze" }),
]);

export function getFolderTypeLabel(value) {
    return FOLDER_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? "";
}
