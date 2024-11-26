import { ClientLoaderFunctionArgs } from "@remix-run/react";
import { gql } from "urql";
import { gqlClient } from "~/gqlConfig";

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

export default function ViewSingleProp() {
    return <p>Hello single prop</p>;
}
