import { useBlockNumber } from "wagmi";
import { Proposal } from "~/types";
import { formatDistanceToNow, formatDistanceToNowStrict, fromUnixTime, isAfter } from "date-fns";
import ViewProposal from "./ViewProposal";

const ARBITRUM_SEPOLIA_BASE_BLOCK = 90300658;
const BLOCKS_PER_SECOND = 4;

export function useBlockTime() {
    const {
        data: currentBlock,
        isError,
        isLoading,
    } = useBlockNumber({
        watch: false,
        chainId: 421614,
    });

    const getBlockTimestamp = (blockNumber: string | number): number | null => {
        if (!currentBlock) return null;

        const targetBlock =
            typeof blockNumber === "string"
                ? parseInt(blockNumber) + ARBITRUM_SEPOLIA_BASE_BLOCK
                : blockNumber + ARBITRUM_SEPOLIA_BASE_BLOCK;

        const currentBlockNum = parseInt(currentBlock.toString());
        const blockDifference = targetBlock - currentBlockNum;

        const secondsDifference = blockDifference / BLOCKS_PER_SECOND;
        return Math.floor(Date.now() / 1000) + secondsDifference;
    };

    const getBlockTimeFromNow = (blockNumber: string | number): string => {
        if (isLoading) return "Loading block data...";
        if (isError) return "Error fetching block";
        if (!currentBlock) return "No block data";

        const timestamp = getBlockTimestamp(blockNumber);
        if (!timestamp) return "Invalid block";

        const targetDate = fromUnixTime(timestamp);
        const now = new Date();

        if (isAfter(targetDate, now)) {
            return `in ${formatDistanceToNowStrict(targetDate)}`;
        } else {
            return formatDistanceToNow(targetDate, { addSuffix: true });
        }
    };

    const getNetworkBlock = (localBlock: string | number): number => {
        const blockNum = typeof localBlock === "string" ? parseInt(localBlock) : localBlock;
        return blockNum + ARBITRUM_SEPOLIA_BASE_BLOCK;
    };

    return {
        currentBlock,
        isLoading,
        isError,
        getBlockTimestamp,
        getBlockTimeFromNow,
        getNetworkBlock,
    };
}

const ProposalInfo = ({ proposals }: { proposals: Proposal[] }) => {
    const {
        currentBlock,
        isLoading,
        isError,
        getBlockTimeFromNow,
        getNetworkBlock,
        getBlockTimestamp,
    } = useBlockTime();

    if (isLoading) return <div>Loading block data...</div>;
    if (isError) return <div>Error fetching block data</div>;
    if (!currentBlock) return <div>No block data available</div>;
    if (!proposals || proposals.length === 0) return <div>No proposals found</div>;

    return (
        <div className="mx-auto p-3 mb-16 w-full sm:w-2/3">
            <h1 className="text-3xl font-bold mb-6 text-white">Proposals</h1>
            <div className="text-sm text-gray-400 mb-4">
                Current Block: {currentBlock.toString()}
            </div>

            <div className="space-y-4">
                {proposals.map((proposal: Proposal) => (
                    <ViewProposal proposal={proposal} />
                ))}
            </div>
        </div>
    );
};

export default ProposalInfo;
