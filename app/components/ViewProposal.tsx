import { Link } from "@remix-run/react";
import { useBlockNumber } from "wagmi";
import { formatDistanceToNow, fromUnixTime } from "date-fns";
import { Proposal } from "~/types";
import { marked } from "marked";
import { useState } from "react";
import DOMPurify from "dompurify";
import { truncateString } from "~/core";

type Props = {
    proposal: Proposal;
};

export default function ViewProposal({ proposal }: Props) {
    const { data: blockNumber, isLoading, isError } = useBlockNumber();
    const [description, setDescription] = useState("");

    if (isLoading) return <div className="text-gray-400">Loading...</div>;
    if (isError) return <div className="text-red-400">Could not load data</div>;
    if (!blockNumber) return <div className="text-red-400">Error</div>;

    function renderDescription(propText: string) {
        marked.use({ async: true });
        const result = marked.parse(propText);

        if (result instanceof Promise) {
            result
                .then((html) => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, "text/html");

                    const h1 = doc.querySelector("h1")?.textContent;
                    const h2 = doc.querySelector("h2")?.textContent;
                    const p = doc.querySelector("p")?.textContent?.slice(0, 250);

                    setDescription(DOMPurify.sanitize(h1 || h2 || p || ""));
                })
                .catch(console.log);
        }
    }

    const relativeDate = formatDistanceToNow(fromUnixTime(+proposal.timestamp_), {
        addSuffix: true,
    });

    renderDescription(proposal.description);

    const isActive = blockNumber < +proposal.voteEnd;

    return (
        <div className="container mx-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <Link
                            to={`/proposals/${proposal.id}`}
                            className="text-2xl font-bold text-white hover:text-blue-400 hover:underline transition-colors"
                            viewTransition
                        >
                            Proposal {truncateString(proposal.proposalId)}
                        </Link>
                        <span className="text-gray-400">{relativeDate}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <span
                            className={`px-3 py-1 rounded-full text-sm ${
                                isActive
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                            }`}
                        >
                            {isActive ? "Active" : "Ended"}
                        </span>
                        <span className="text-gray-400">by</span>
                        <span className="text-blue-400 font-mono">
                            {truncateString(proposal.proposer)}
                        </span>
                    </div>
                </div>

                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-300 mb-3">Description</h3>
                    <div
                        className="prose prose-invert max-w-none
                            prose-headings:text-gray-100
                            prose-p:text-gray-300
                            prose-strong:text-white"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Vote Start</h4>
                        <p className="text-gray-100">{proposal.voteStart}</p>
                    </div>

                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Vote End</h4>
                        <p className="text-gray-100">{proposal.voteEnd}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
