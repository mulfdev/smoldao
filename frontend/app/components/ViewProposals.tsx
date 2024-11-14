import { useBlockNumber } from 'wagmi';
import { Proposal } from '~/types';
import {
  formatDistanceToNow,
  formatDistanceToNowStrict,
  fromUnixTime,
  isAfter,
  isBefore,
  addSeconds
} from 'date-fns';

// Constants for block number calculations
const ARBITRUM_SEPOLIA_BASE_BLOCK = 90300658;
const BLOCKS_PER_SECOND = 4; // Arbitrum Sepolia averages ~4 blocks/second

export function useBlockTime() {
  const { data: currentBlock, isError, isLoading } = useBlockNumber({
    watch: false,
    chainId: 421614, // Arbitrum Sepolia chain ID
  });

  const getBlockTimestamp = (blockNumber: string | number): number | null => {
    if (!currentBlock) return null;

    const targetBlock = typeof blockNumber === 'string' ?
      parseInt(blockNumber) + ARBITRUM_SEPOLIA_BASE_BLOCK :
      blockNumber + ARBITRUM_SEPOLIA_BASE_BLOCK;

    const currentBlockNum = parseInt(currentBlock.toString());
    const blockDifference = targetBlock - currentBlockNum;

    const secondsDifference = blockDifference / BLOCKS_PER_SECOND;
    return Math.floor(Date.now() / 1000) + secondsDifference;
  };

  const getBlockTimeFromNow = (blockNumber: string | number): string => {
    if (isLoading) return 'Loading block data...';
    if (isError) return 'Error fetching block';
    if (!currentBlock) return 'No block data';

    const timestamp = getBlockTimestamp(blockNumber);
    if (!timestamp) return 'Invalid block';

    const targetDate = fromUnixTime(timestamp);
    const now = new Date();

    if (isAfter(targetDate, now)) {
      return `in ${formatDistanceToNowStrict(targetDate)}`;
    } else {
      return formatDistanceToNow(targetDate, { addSuffix: true });
    }
  };

  const getNetworkBlock = (localBlock: string | number): number => {
    const blockNum = typeof localBlock === 'string' ? parseInt(localBlock) : localBlock;
    return blockNum + ARBITRUM_SEPOLIA_BASE_BLOCK;
  };

  return {
    currentBlock,
    isLoading,
    isError,
    getBlockTimestamp,
    getBlockTimeFromNow,
    getNetworkBlock
  };
}

function truncateString(str: string): string {
  if (!str) return '';
  return str.slice(0, 12);
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

const ProposalInfo = ({ proposals }: { proposals: Proposal[] }) => {
  const {
    currentBlock,
    isLoading,
    isError,
    getBlockTimeFromNow,
    getNetworkBlock,
    getBlockTimestamp
  } = useBlockTime();

  const getVotingStatus = (voteStart: string, voteEnd: string): string => {
    if (isLoading) return "Loading...";
    if (isError) return "Error fetching block";
    if (!currentBlock || !voteStart || !voteEnd) return "Loading...";

    const startBlock = getNetworkBlock(voteStart);
    const endBlock = getNetworkBlock(voteEnd);
    const currentBlockNum = parseInt(currentBlock.toString());

    if (isNaN(startBlock) || isNaN(endBlock) || isNaN(currentBlockNum)) {
      return "Invalid block numbers";
    }

    console.log({
      startBlock,
      endBlock,
      currentBlockNum,
      originalStart: voteStart,
      originalEnd: voteEnd
    });

    const startTimestamp = getBlockTimestamp(voteStart);
    const endTimestamp = getBlockTimestamp(voteEnd);

    if (!startTimestamp || !endTimestamp) return "Invalid timestamps";

    const now = new Date();
    const startDate = fromUnixTime(startTimestamp);
    const endDate = fromUnixTime(endTimestamp);

    if (isBefore(now, startDate)) {
      return "Voting Not Started";
    } else if (isAfter(now, endDate)) {
      return "Vote Ended";
    } else {
      return "Voting Active";
    }
  };

  if (isLoading) return <div>Loading block data...</div>;
  if (isError) return <div>Error fetching block data</div>;
  if (!currentBlock) return <div>No block data available</div>;
  if (!proposals || proposals.length === 0) return <div>No proposals found</div>;

  return (
    <div className="mx-auto p-3 mb-16 sm:w-1/2">
      <h1 className="text-3xl font-bold mb-6 text-white">Proposals</h1>
      <div className="text-sm text-gray-400 mb-4">
        Current Block: {currentBlock.toString()}
      </div>

      <div className="space-y-4">
        {proposals.map((proposal: Proposal) => (
          <div
            key={proposal.proposalId}
            className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
          >
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                Proposal {truncateString(proposal.proposalId)}
              </h2>
              <span className="text-sm text-gray-400">
                {getSubmissionTime(proposal.description)}
              </span>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <p className="text-md font-medium text-gray-400">Description</p>
                <p className="text-gray-100">{proposal.description || 'No description provided'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-md font-medium text-gray-400">Proposer</p>
                    <p className="text-blue-400 font-mono">
                      {truncateString(proposal.proposer)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-md font-medium text-gray-400">Voting Status</p>
                    <p className="text-gray-300 text-sm">
                      {getVotingStatus(proposal.voteStart, proposal.voteEnd)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-md font-medium text-gray-400">Vote Start</p>
                    <div className="space-y-0.5">
                      <p className="text-gray-100 text-sm">
                        {proposal.voteStart ? getBlockTimeFromNow(proposal.voteStart) : 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Block {getNetworkBlock(proposal.voteStart).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-md font-medium text-gray-400">Vote End</p>
                    <div className="space-y-0.5">
                      <p className="text-gray-100">
                        {proposal.voteEnd ? getBlockTimeFromNow(proposal.voteEnd) : 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Block #{getNetworkBlock(proposal.voteEnd).toLocaleString()}
                      </p>
                    </div>
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
                    <p className="text-gray-300">{proposal.block_number || 'Unknown'}</p>
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
        ))}
      </div>
    </div>
  );
};

export default ProposalInfo;
