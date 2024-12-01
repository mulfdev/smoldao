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

export type TransferType = "eth" | "erc20";

export function assertType(val: unknown, type: BasicType, errMsg?: string): asserts val is never {
    if (type === "null" && val === null) return;

    if (typeof val === type) return;

    if (errMsg) {
        throw new Error(errMsg);
    }

    throw new Error(`Type of val ${typeof val} did not match expected ${type}`);
}

export function truncateString(str: string): string {
    if (!str) return "";
    return str.slice(0, 12);
}

export const GOVERNOR_ADDRESS = "0xfeCbE182F83b0FC3A1a7aF0727b9989405b65e81" as const;

export const governorABI = [
    {
        name: "propose",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "targets", type: "address[]" },
            { name: "values", type: "uint256[]" },
            { name: "calldatas", type: "bytes[]" },
            { name: "description", type: "string" },
        ],
        outputs: [{ name: "", type: "uint256" }],
    },
] as const;

export const erc20ABI = [
    {
        name: "decimals",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint8" }],
    },
] as const;
