import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

export function setupWagmi(RPC_URL: string, WALLETCONNECT_PROJECT_ID: string) {
    const config = createConfig(
        getDefaultConfig({
            // Your dApps chains
            chains: [sepolia],
            transports: {
                // RPC URL for each chain
                [sepolia.id]: http(RPC_URL),
            },
            // Required API Keys
            walletConnectProjectId: WALLETCONNECT_PROJECT_ID,

            // Required App Info
            appName: "smoldao",
        }),
    );

    return config;
}
