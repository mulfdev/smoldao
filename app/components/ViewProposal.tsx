import { Link } from "@remix-run/react";
import { useBlockNumber } from "wagmi";
import { formatDistanceToNow, fromUnixTime } from "date-fns";
import { Proposal } from "~/types";

type Props = {
    proposal: Proposal;
};

function truncateString(str: string): string {
    if (!str) return "";
    return str.slice(0, 12);
}

function blockOffset(block: number) {
    const START_BLOCK = 88421851;

    return block + START_BLOCK;
}

const getSubmissionTime = (description: string): string => {
    if (!description) return "Unknown time";

    const match = description.match(/timestamp: (\d+)/);
    if (!match) return "Unknown time";

    const timestamp = parseInt(match[1]);
    if (isNaN(timestamp)) return "Unknown time";

    const submissionDate = fromUnixTime(timestamp);
    return formatDistanceToNow(submissionDate, { addSuffix: true });
};

const { data } = useBlockNumber();

export default function ViewProposal({ proposal }: Props) {
    return (
        <div
            key={proposal.proposalId}
            className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
        >
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <Link to={`/proposals/${proposal.id}`} viewTransition>
                    <h2 className="text-xl font-semibold text-white">
                        Proposal {truncateString(proposal.proposalId)}
                    </h2>
                </Link>
                <span className="text-sm text-gray-400">
                    {getSubmissionTime(proposal.description)}
                </span>
            </div>

            <div className="p-4 space-y-4">
                <div className="space-y-1">
                    <p className="text-md font-medium text-gray-400">Description</p>
                    <p className="text-gray-100">
                        {proposal.description || "No description provided"}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <p className="text-md font-medium text-gray-400">Proposer</p>
                        <p className="text-blue-400 font-mono">
                            {truncateString(proposal.proposer)}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-md font-medium text-gray-400">Voting Status</p>
                        <p className="text-gray-300 text-sm">
                            {+data > +proposal.voteEnd ? "Ongoing" : "Ended"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-md font-medium text-gray-400">Vote Start</p>
                        <div className="space-y-0.5">
                            <p className="text-gray-100 text-sm">
                                {blockOffset(+proposal.voteStart)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-md font-medium text-gray-400">Vote End</p>
                        <div className="space-y-0.5">
                            <p className="text-gray-100">
                                {proposal.voteEnd ? proposal.voteEnd : "Unknown"}
                            </p>
                        </div>
                    </div>
                </div>

                <details className="mt-4 pt-4 border-t border-gray-700">
                    <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                        View Technical Details
                    </summary>
                    <div className="mt-4 space-y-3">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-400">Block Number</p>
                            <p className="text-gray-300">{proposal.block_number || "Unknown"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-400">Original Vote Start</p>
                            <p className="text-gray-300">{proposal.voteStart}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-400">Original Vote End</p>
                            <p className="text-gray-300">{proposal.voteEnd}</p>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
}
