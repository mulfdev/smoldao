import { Proposal } from "~/types";

function truncateString(str: string) {
  return str.slice(0, 12);
}

const ProposalInfo = ({ proposals }: { proposals: Proposal[] }) => {
  return (
    <div className="mx-auto p-6 w-1/2">
      <h1 className="text-3xl font-bold mb-6 text-white">Proposals</h1>
      {proposals.map((proposal: any) => (
        <div
          key={proposal.proposalId}
          className="bg-white shadow-md rounded-lg p-6 mb-6 text-black"
        >
          <h2 className="text-2xl font-semibold mb-4">
            Proposal {truncateString(proposal.proposalId)}
          </h2>
          <div className="flex flex-col gap-4">
            <div className="">
              <p className="text-lg font-medium text-slate-950">Description</p>
              <p className="text-md">{proposal.description}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-950">Proposer</p>
              <p className="text-md font-mono">{truncateString(proposal.proposer)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-950">Vote End</p>
              <p className="text-md">{proposal.voteEnd}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProposalInfo;
