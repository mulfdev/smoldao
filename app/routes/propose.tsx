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
        <>
            <div className="flex flex-col w-full h-full">
                {/* Main Content Area */}
                <div className="container mx-auto p-4 overflow-hidden">
                    <h1 className="text-3xl font-bold mb-6 text-white">Submit Your Proposal</h1>

                    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                        <div className="p-6 space-y-6">
                            {/* Transfer Configuration Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="transferType"
                                        className="block text-sm font-medium text-gray-300"
                                    >
                                        Transfer Type
                                    </label>
                                    <select
                                        id="transferType"
                                        value={transferType}
                                        onChange={(e) =>
                                            setTransferType(e.target.value as TransferType)
                                        }
                                        className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="eth">ETH Transfer</option>
                                        <option value="erc20">ERC20 Transfer</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="recipient"
                                        className="block text-sm font-medium text-gray-300"
                                    >
                                        Recipient Address
                                    </label>
                                    <input
                                        id="recipient"
                                        placeholder="0x..."
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        className={`w-full p-3 bg-gray-700 border text-white rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                            !recipient || isValidAddress(recipient)
                                                ? "border-gray-600"
                                                : "border-red-500"
                                        }`}
                                    />
                                    {recipient && !isValidAddress(recipient) && (
                                        <p className="text-red-500 text-sm mt-1">
                                            Invalid address format
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="amount"
                                        className="block text-sm font-medium text-gray-300"
                                    >
                                        Amount {transferType === "eth" ? "(in ETH)" : "(in tokens)"}
                                    </label>
                                    <input
                                        id="amount"
                                        placeholder="0.0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className={`w-full p-3 bg-gray-700 border text-white rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                            !amount || isValidAmount(amount)
                                                ? "border-gray-600"
                                                : "border-red-500"
                                        }`}
                                    />
                                    {amount && !isValidAmount(amount) && (
                                        <p className="text-red-500 text-sm mt-1">
                                            Invalid amount format
                                        </p>
                                    )}
                                </div>

                                {transferType === "erc20" && (
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="tokenAddress"
                                            className="block text-sm font-medium text-gray-300"
                                        >
                                            Token Contract Address
                                        </label>
                                        <input
                                            id="tokenAddress"
                                            placeholder="0x..."
                                            value={tokenAddress}
                                            onChange={handleTokenAddressChange}
                                            className={`w-full p-3 bg-gray-700 border text-white rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                                !tokenAddress || isValidAddress(tokenAddress)
                                                    ? "border-gray-600"
                                                    : "border-red-500"
                                            }`}
                                        />
                                        <div className="text-sm mt-1">
                                            {isLoadingDecimals ? (
                                                <span className="text-yellow-500">
                                                    Loading token decimals...
                                                </span>
                                            ) : decimalsError ? (
                                                <span className="text-red-500">
                                                    Error loading token decimals. Please verify the
                                                    token address.
                                                </span>
                                            ) : isValidAddress(tokenAddress) ? (
                                                <span className="text-green-500">
                                                    Token decimals: {decimals}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description Section */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="proposal"
                                    className="block text-sm font-medium text-gray-300"
                                >
                                    Proposal Description (minimum 500 characters)
                                </label>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-42rem)]">
                                    <div className="h-full">
                                        <textarea
                                            id="proposal"
                                            onScroll={scroller}
                                            className="w-full h-full p-4 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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
                                        className="h-full p-4 prose prose-stone max-w-none prose-invert bg-gray-700 border border-gray-600 overflow-auto rounded-lg
                                        prose-headings:text-gray-100
                                        prose-p:text-gray-200
                                        prose-strong:text-white
                                        prose-blockquote:border-l-4
                                        prose-blockquote:border-gray-400
                                        prose-blockquote:bg-gray-800/50
                                        prose-blockquote:px-3
                                        prose-blockquote:py-0.5
                                        prose-blockquote:not-italic
                                        prose-pre:bg-gray-800
                                        prose-code:text-blue-300
                                        prose-code:bg-gray-800
                                        prose-code:px-2
                                        prose-code:py-0.5
                                        prose-code:rounded
                                        prose-a:text-blue-400
                                        prose-li:text-gray-200
                                        prose-table:text-gray-200
                                        prose-hr:border-gray-600"
                                        ref={previewRef}
                                        dangerouslySetInnerHTML={{ __html: preview }}
                                    />
                                </div>
                                <p className="text-sm text-gray-400">
                                    Supports markdown formatting. Preview shown on the right.
                                </p>
                            </div>
                        </div>
                        <div className="">
                            <div className="container mx-auto p-4">
                                <div className="flex items-center gap-4">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitDisabled()}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
                                    >
                                        Submit Proposal
                                    </Button>
                                    {text.length < 500 && (
                                        <span className="text-red-500">
                                            {500 - text.length} more characters needed
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Fixed Footer */}
        </>
    );
}
