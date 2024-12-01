import { Proposal } from "~/types";
import ViewProposal from "./ViewProposal";
import { gql } from "urql";
import { gqlClient } from "~/gqlConfig";
import { useState } from "react";

const PropsQuery = gql`
    query {
        proposalCreateds {
            proposer
            proposalId
            id
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

const ProposalInfo = () => {
    const [proposals, setProposals] = useState([]);

    gqlClient
        .query(PropsQuery, {})
        .toPromise()
        .then((p) => setProposals(p.data.proposalCreateds))
        .catch((e) => console.log(e));

    return (
        <div className="mx-auto mb-16 w-full sm:w-2/3">
            <h1 className="text-3xl font-bold mb-6 text-white px-6 sm:px-0">Proposals</h1>
            <div className="space-y-8 px-6 sm:px-0">
                {proposals.map((proposal: Proposal) => (
                    <ViewProposal proposal={proposal} key={proposal.id} />
                ))}
            </div>
        </div>
    );
};

export default ProposalInfo;
