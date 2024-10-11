import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";



export function setupWagmi(RPC_URL: string, WALLETCONNECT_PROJECT_ID: string) {


  const config = createConfig(
    getDefaultConfig({
      // Your dApps chains
      chains: [mainnet],
      transports: {
        // RPC URL for each chain
        [mainnet.id]: http(
          RPC_URL,
        ),
      },

      // Required API Keys
      walletConnectProjectId: WALLETCONNECT_PROJECT_ID,

      // Required App Info
      appName: "smoldao",
    }),
  )

  return config
}

