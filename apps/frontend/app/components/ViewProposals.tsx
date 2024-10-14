function truncateString(str: string) {
  if (str.length <= 12) {
    return str;
  }
  return str.slice(0, 6) + "..." + str.slice(-6);
}

const ProposalInfo = ({ proposals }: any) => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Proposals</h1>
      {proposals.map((proposal: any) => (
        <div
          key={proposal.proposalId}
          className="bg-white shadow-md rounded-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-semibold mb-4">
            Proposal {truncateString(proposal.proposalId)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Proposer</p>
              <p className="text-md font-mono">{proposal.proposer}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Proposal ID</p>
              <p className="text-md font-mono">
                {truncateString(proposal.proposalId)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Vote Start</p>
              <p className="text-md">{proposal.voteStart}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Vote End</p>
              <p className="text-md">{proposal.voteEnd}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="text-md">{proposal.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Block Number</p>
              <p className="text-md">{proposal.block_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Timestamp</p>
              <p className="text-md">{proposal.timestamp_}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProposalInfo;
