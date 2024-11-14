import { createConfig, http } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

export function setupWagmi(RPC_URL: string, WALLETCONNECT_PROJECT_ID: string) {
  const config = createConfig(
    getDefaultConfig({
      // Your dApps chains
      chains: [
        arbitrumSepolia
      ],
      transports: {
        // RPC URL for each chain
        [arbitrumSepolia.id]: http(RPC_URL),
      },
      ssr: true,

      // Required API Keys
      walletConnectProjectId: WALLETCONNECT_PROJECT_ID,

      // Required App Info
      appName: "smoldao",
    }),
  );

  return config;
}
