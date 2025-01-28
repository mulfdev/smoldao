import type { MetaFunction } from "@remix-run/node";

import ProposalInfo from "~/components/ViewProposals";

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
                <h1 className="leading text-4xl font-bold text-white mb-12">Welcome to SmolDAO</h1>
            </header>
            <ProposalInfo />
        </>
    );
}
