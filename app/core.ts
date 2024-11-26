type BasicType =
    | "string"
    | "number"
    | "boolean"
    | "undefined"
    | "object"
    | "symbol"
    | "bigint"
    | "function"
    | "null";

export function assertType(val: unknown, type: BasicType, errMsg?: string): asserts val is never {
    if (type === "null" && val === null) return;

    if (typeof val === type) return;

    if (errMsg) {
        throw new Error(errMsg);
    }

    throw new Error(`Type of val ${typeof val} did not match expected ${type}`);
}
