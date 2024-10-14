import type { MetaFunction } from "@remix-run/node";
import { ConnectKitButton } from "connectkit";

import { gql, useQuery } from "urql";
import ProposalInfo from "~/components/ViewProposals";

const PropsQuery = gql`
  query {
    proposalCreateds {
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

export const meta: MetaFunction = () => {
  return [
    { title: "SmolDAO" },
    { name: "description", content: "Smolest DAO around" },
  ];
};

export default function Index() {
  const [result] = useQuery({
    query: PropsQuery,
  });

  const { data, fetching, error } = result;

  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;

  console.log(data.proposalCreateds);

  return (
    <>
      <div className="p-8 w-full flex justify-end items-center">
        <ConnectKitButton />
      </div>
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-16">
          <header className="flex flex-col items-center gap-9">
            <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
              Welcome to SmolDAO
            </h1>
          </header>

          <ProposalInfo proposals={data.proposalCreateds} />
        </div>
      </div>
    </>
  );
}
