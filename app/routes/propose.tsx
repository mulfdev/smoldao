import { ChangeEvent, useEffect, useState, useRef } from "react";
import { useWriteContract, useReadContract } from "wagmi";
import { parseEther, parseUnits, encodeFunctionData } from "viem";
import { marked } from "marked";
import DOMPurify from "dompurify";
import Button from "~/components/Button";

const GOVERNOR_ADDRESS = "0x0B70F10f27badCd1341E78387607c6fd6fD8F8Dc" as const;

type TransferType = "eth" | "erc20";

const governorABI = [
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

const erc20ABI = [
    {
        name: "decimals",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint8" }],
    },
] as const;

const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const isValidAmount = (value: string) => {
    return /^\d*\.?\d*$/.test(value) && value !== "";
};

export default function ProposePage() {
    const [text, setText] = useState("");
    const [preview, setPreview] = useState("");
    const [transferType, setTransferType] = useState<TransferType>("eth");
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [tokenAddress, setTokenAddress] = useState("");
    const [decimals, setDecimals] = useState<number>(18);
    const [isLoadingDecimals, setIsLoadingDecimals] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    let timeout: NodeJS.Timeout | null = null;

    const { writeContractAsync: propose } = useWriteContract();

    const { data: fetchedDecimals, error: decimalsError } = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: "decimals",
        query: {
            enabled: transferType === "erc20" && isValidAddress(tokenAddress),
        },
    });

    useEffect(() => {
        if (fetchedDecimals !== undefined) {
            setDecimals(Number(fetchedDecimals));
            setIsLoadingDecimals(false);
        }
        if (decimalsError) {
            setIsLoadingDecimals(false);
            console.error("Error fetching decimals:", decimalsError);
        }
    }, [fetchedDecimals, decimalsError]);

    function scroller() {
        if (previewRef.current === null || textareaRef.current === null) return;
        const scrollPercentage =
            textareaRef.current.scrollTop /
            (textareaRef.current.scrollHeight - textareaRef.current.clientHeight);

        previewRef.current.scrollTop =
            scrollPercentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
    }

    function renderPreview() {
        if (timeout) return;

        timeout = setTimeout(() => {
            marked.use({ async: true });
            const result = marked.parse(text);

            if (result instanceof Promise) {
                result
                    .then((p) => {
                        setPreview(DOMPurify.sanitize(p));
                        timeout = null;
                    })
                    .catch((e) => {
                        console.log(e);
                        timeout = null;
                    });
            } else {
                setPreview(result);
                timeout = null;
            }
        }, 500);
    }

    const handleSubmit = async () => {
        if (!recipient || !amount || text.length < 500) return;

        let targets: `0x${string}`[] = [];
        let values: bigint[] = [];
        let calldatas: `0x${string}`[] = [];

        if (transferType === "eth") {
            targets = [recipient as `0x${string}`];
            values = [parseEther(amount)];
            calldatas = ["0x"];
        } else if (transferType === "erc20" && tokenAddress) {
            targets = [tokenAddress as `0x${string}`];
            values = [0n];
            calldatas = [
                encodeFunctionData({
                    abi: [
                        {
                            name: "transfer",
                            type: "function",
                            inputs: [
                                { name: "recipient", type: "address" },
                                { name: "amount", type: "uint256" },
                            ],
                            outputs: [{ type: "bool" }],
                        },
                    ],
                    functionName: "transfer",
                    args: [recipient as `0x${string}`, parseUnits(amount, decimals)],
                }),
            ];
        }

        try {
            await propose({
                address: GOVERNOR_ADDRESS,
                abi: governorABI,
                functionName: "propose",
                args: [targets, values, calldatas, text],
            });
        } catch (error) {
            console.error("Error submitting proposal:", error);
        }
    };

    useEffect(() => {
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, []);

    const handleTokenAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newAddress = e.target.value;
        setTokenAddress(newAddress);
        if (isValidAddress(newAddress)) {
            setIsLoadingDecimals(true);
        }
    };

    const isSubmitDisabled = () => {
        const basicValidation =
            !isValidAddress(recipient) || !isValidAmount(amount) || text.length < 500;

        if (transferType === "erc20") {
            return (
                basicValidation ||
                !isValidAddress(tokenAddress) ||
                isLoadingDecimals ||
                decimalsError !== null
            );
        }

        return basicValidation;
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Submit Your Proposal</h1>

            <div className="mb-6 grid grid-cols-1 gap-4 max-w-xl">
                <div className="space-y-2">
                    <label htmlFor="transferType" className="block text-sm font-medium">
                        Transfer Type
                    </label>
                    <select
                        id="transferType"
                        value={transferType}
                        onChange={(e) => setTransferType(e.target.value as TransferType)}
                        className="w-full p-2 bg-white text-black rounded"
                    >
                        <option value="eth">ETH Transfer</option>
                        <option value="erc20">ERC20 Transfer</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="recipient" className="block text-sm font-medium">
                        Recipient Address
                    </label>
                    <input
                        id="recipient"
                        placeholder="0x..."
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className={`w-full p-2 text-black rounded ${!recipient || isValidAddress(recipient) ? "" : "border-red-500 border-2"}`}
                    />
                    {recipient && !isValidAddress(recipient) && (
                        <p className="text-red-500 text-sm">Invalid address format</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="amount" className="block text-sm font-medium">
                        Amount {transferType === "eth" ? "(in ETH)" : "(in tokens)"}
                    </label>
                    <input
                        id="amount"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={`w-full p-2 text-black rounded ${!amount || isValidAmount(amount) ? "" : "border-red-500 border-2"}`}
                    />
                    {amount && !isValidAmount(amount) && (
                        <p className="text-red-500 text-sm">Invalid amount format</p>
                    )}
                </div>

                {transferType === "erc20" && (
                    <div className="space-y-2">
                        <label htmlFor="tokenAddress" className="block text-sm font-medium">
                            Token Contract Address
                        </label>
                        <input
                            id="tokenAddress"
                            placeholder="0x..."
                            value={tokenAddress}
                            onChange={handleTokenAddressChange}
                            className={`w-full p-2 text-black rounded ${!tokenAddress || isValidAddress(tokenAddress) ? "" : "border-red-500 border-2"}`}
                        />
                        <div className="text-sm">
                            {isLoadingDecimals ? (
                                <span className="text-yellow-500">Loading token decimals...</span>
                            ) : decimalsError ? (
                                <span className="text-red-500">
                                    Error loading token decimals. Please verify the token address.
                                </span>
                            ) : isValidAddress(tokenAddress) ? (
                                <span className="text-green-500">Token decimals: {decimals}</span>
                            ) : null}
                        </div>
                        {tokenAddress && !isValidAddress(tokenAddress) && (
                            <p className="text-red-500 text-sm">Invalid token address format</p>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-2 mb-6">
                <label htmlFor="proposal" className="block text-sm font-medium">
                    Proposal Description (minimum 500 characters)
                </label>
                <div className="w-full flex gap-4 h-[600px]">
                    <div className="w-1/2">
                        <textarea
                            id="proposal"
                            onScroll={scroller}
                            className="w-full h-full text-black p-2 outline-none rounded"
                            value={text}
                            ref={textareaRef}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                setText(e.target.value)
                            }
                            onKeyUp={renderPreview}
                            placeholder="# Title&#10;&#10;## Summary&#10;&#10;## Details&#10;&#10;## Impact"
                        ></textarea>
                    </div>
                    <div
                        className="w-1/2 p-2 prose prose-slate prose-invert border overflow-scroll rounded"
                        ref={previewRef}
                        dangerouslySetInnerHTML={{ __html: preview }}
                    />
                </div>
                <p className="text-sm text-gray-400">
                    Supports markdown formatting. Preview shown on the right.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <Button onClick={handleSubmit} disabled={isSubmitDisabled()}>
                    Submit Proposal
                </Button>
                {text.length < 500 && (
                    <span className="text-red-500">{500 - text.length} more characters needed</span>
                )}
            </div>
        </div>
    );
}
