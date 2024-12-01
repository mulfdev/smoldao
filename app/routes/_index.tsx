import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { gql } from "@urql/core";

import ProposalInfo from "~/components/ViewProposals";
import { gqlClient } from "~/gqlConfig";

export const meta: MetaFunction = () => {
    return [
        { title: "SmolDAO - Only the Smol" },
        { name: "description", content: "Smolest DAO around" },
    ];
};

export default function Index() {
    return (
        <>
            <header>
                <h1 className="leading text-4xl font-bold text-gray-800 dark:text-gray-100">
                    Welcome to SmolDAO
                </h1>
            </header>
            <ProposalInfo />
        </>
    );
}
