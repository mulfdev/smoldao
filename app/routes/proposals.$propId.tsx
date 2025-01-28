import { ClientLoaderFunctionArgs, useLoaderData } from "@remix-run/react";
import { gql } from "urql";
import { gqlClient } from "~/gqlConfig";
import { useBlockNumber, useReadContract, useWriteContract, useAccount } from "wagmi";
import { fromUnixTime, formatDistanceToNow } from "date-fns";
import { marked } from "marked";
import { useState, useEffect } from "react";
import Button from "~/components/Button";
import DOMPurify from "dompurify";
import { GOVERNOR_ADDRESS, truncateString } from "~/core";

const PropsQuery = gql`
    query GetProposal($id: ID!) {
        proposalCreated(id: $id) {
            proposer
            proposalId
            voteEnd
            voteStart
            description
            targets
            block_number
            values
            calldatas
            timestamp_
        }
    }
`;

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
    const result = await gqlClient.query(PropsQuery, { id: params.propId }).toPromise();
    return result;
}

const ProposalDetails = () => {
    const { data: propData } = useLoaderData<typeof clientLoader>();
    const [mdContent, setMdContent] = useState("");
    const { data: blockNumber } = useBlockNumber();
    const [reason, setReason] = useState("");
    const { writeContractAsync: vote } = useWriteContract();
    const { address } = useAccount();

    const { data: tokenAddress } = useReadContract({
        address: GOVERNOR_ADDRESS,
        abi: [
            {
                name: "token",
                type: "function",
                inputs: [],
                outputs: [{ name: "", type: "address" }],
                stateMutability: "view",
            },
        ],
        functionName: "token",
    });

    const { data: votePower } = useReadContract({
        address: tokenAddress || "0x",
        abi: [
            {
                name: "getPastVotes",
                type: "function",
                inputs: [
                    { name: "account", type: "address" },
                    { name: "timepoint", type: "uint256" },
                ],
                outputs: [{ name: "", type: "uint256" }],
                stateMutability: "view",
            },
        ],
        functionName: "getPastVotes",
        args:
            address && tokenAddress
                ? [address, BigInt(propData?.proposalCreated?.block_number || 0)]
                : undefined,
        query: {
            enabled: !!address && !!tokenAddress,
        },
    });

    console.log({
        tokenAddress,
        userAddress: address,
        blockNumber: propData?.proposalCreated?.block_number,
        votePower,
    });

    const { data: votes } = useReadContract({
        address: GOVERNOR_ADDRESS,
        abi: [
            {
                type: "function",
                name: "proposalVotes",
                inputs: [{ name: "proposalId", type: "uint256" }],
                outputs: [
                    { name: "againstVotes", type: "uint256" },
                    { name: "forVotes", type: "uint256" },
                    { name: "abstainVotes", type: "uint256" },
                ],
                stateMutability: "view",
            },
        ],
        functionName: "proposalVotes",
        args: propData?.proposalCreated ? [BigInt(propData.proposalCreated.proposalId)] : undefined,
    });

    const { data: hasVoted } = useReadContract({
        address: GOVERNOR_ADDRESS,
        abi: [
            {
                type: "function",
                name: "hasVoted",
                inputs: [
                    { name: "proposalId", type: "uint256" },
                    { name: "account", type: "address" },
                ],
                outputs: [{ name: "", type: "bool" }],
                stateMutability: "view",
            },
        ],
        functionName: "hasVoted",
        args:
            address && propData?.proposalCreated
                ? [BigInt(propData.proposalCreated.proposalId), address]
                : undefined,
        query: {
            enabled: !!address && !!propData?.proposalCreated,
        },
    });

    useEffect(() => {
        if (propData?.proposalCreated?.description) {
            marked.use({ async: true });
            const result = marked.parse(propData.proposalCreated.description);

            if (result instanceof Promise) {
                result
                    .then((p) => {
                        setMdContent(DOMPurify.sanitize(p));
                    })
                    .catch(console.log);
            } else {
                setMdContent(DOMPurify.sanitize(result));
            }
        }
    }, [propData?.proposalCreated?.description]);

    const handleVote = async (support: 0 | 1 | 2) => {
        if (!propData?.proposalCreated) return;

        try {
            if (reason) {
                await vote({
                    address: GOVERNOR_ADDRESS,
                    abi: [
                        {
                            name: "castVoteWithReason",
                            type: "function",
                            stateMutability: "nonpayable",
                            inputs: [
                                { name: "proposalId", type: "uint256" },
                                { name: "support", type: "uint8" },
                                { name: "reason", type: "string" },
                            ],
                            outputs: [{ name: "", type: "uint256" }],
                        },
                    ],
                    functionName: "castVoteWithReason",
                    args: [BigInt(propData.proposalCreated.proposalId), support, reason],
                });
            } else {
                await vote({
                    address: GOVERNOR_ADDRESS,
                    abi: [
                        {
                            name: "castVote",
                            type: "function",
                            stateMutability: "nonpayable",
                            inputs: [
                                { name: "proposalId", type: "uint256" },
                                { name: "support", type: "uint8" },
                            ],
                            outputs: [{ name: "", type: "uint256" }],
                        },
                    ],
                    functionName: "castVote",
                    args: [BigInt(propData.proposalCreated.proposalId), support],
                });
            }
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    if (!propData?.proposalCreated) return <div>Loading...</div>;

    const prop = propData.proposalCreated;
    const totalVotes = votes ? Number(votes[0]) + Number(votes[1]) + Number(votes[2]) : 0;
    const relativeDate = formatDistanceToNow(fromUnixTime(+prop.timestamp_), { addSuffix: true });
    const isActive = blockNumber && blockNumber < Number(prop.block_number) + Number(prop.voteEnd);
    const canVote = votePower && votePower > 0n;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-white">
                            Proposal {prop.proposalId.slice(0, 8)}...
                        </h1>
                        <span className="text-gray-400">{relativeDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span
                            className={`px-3 py-1 rounded-full text-sm ${
                                isActive
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                            }`}
                        >
                            {isActive ? "Active" : "Closed"}
                        </span>
                        <span className="text-gray-400">by</span>
                        <span className="text-blue-400 font-mono">
                            {truncateString(prop.proposer)}
                        </span>
                    </div>
                </div>

                <div className="p-6 border-b border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {votes &&
                        [
                            { label: "For", votes: Number(votes[1]), color: "bg-green-500" },
                            { label: "Against", votes: Number(votes[0]), color: "bg-red-500" },
                            { label: "Abstain", votes: Number(votes[2]), color: "bg-gray-500" },
                        ].map(({ label, votes: voteCount, color }) => (
                            <div key={label} className="bg-gray-700/50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                                    {label}
                                </h3>
                                <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`absolute top-0 left-0 h-full ${color} transition-all duration-500`}
                                        style={{
                                            width: `${totalVotes ? (voteCount / totalVotes) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                                <p className="mt-2 text-xl font-bold text-white">
                                    {((voteCount / totalVotes) * 100 || 0).toFixed(2)}%
                                </p>
                                <p className="text-sm text-gray-400">
                                    {voteCount.toLocaleString()} votes
                                </p>
                            </div>
                        ))}
                </div>

                <div className="p-6">
                    <div
                        className="prose prose-invert max-w-none
                            prose-headings:text-gray-100
                            prose-p:text-gray-300
                            prose-strong:text-white
                            prose-blockquote:border-l-4
                            prose-blockquote:border-gray-600
                            prose-blockquote:bg-gray-700/50
                            prose-pre:bg-gray-700
                            prose-code:text-blue-300"
                        dangerouslySetInnerHTML={{ __html: mdContent }}
                    />
                </div>

                {isActive && !hasVoted && address ? (
                    <div className="p-6 border-t border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-100 mb-4">Cast Your Vote</h3>
                        {canVote ? (
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <Button onClick={() => handleVote(1)} variant="primary">
                                        Vote For
                                    </Button>
                                    <Button onClick={() => handleVote(0)} variant="secondary">
                                        Vote Against
                                    </Button>
                                    <Button onClick={() => handleVote(2)} variant="secondary">
                                        Abstain
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="reason"
                                        className="block text-sm font-medium text-gray-300"
                                    >
                                        Reason (optional)
                                    </label>
                                    <textarea
                                        id="reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                        placeholder="Enter your voting reason (optional)"
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400">
                                You need voting power to participate in this proposal
                            </p>
                        )}
                    </div>
                ) : null}

                {hasVoted && (
                    <div className="p-6 border-t border-gray-700">
                        <p className="text-gray-400">You have already voted on this proposal</p>
                    </div>
                )}

                {!address && isActive ? (
                    <div className="p-6 border-t border-gray-700">
                        <p className="text-gray-400">
                            Connect your wallet to vote on this proposal
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default ProposalDetails;
