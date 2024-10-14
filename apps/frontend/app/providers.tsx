import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupWagmi } from "~/wagmiConfig";
import { ConnectKitProvider } from "connectkit";
import { Provider as GqlProvider } from 'urql';
import { gqlClient } from "./gqlConfig";
const queryClient = new QueryClient();

type ProvidersProps = {
  children: React.ReactNode;
  env: {
    RPC_URL: string;
    WALLETCONNECT_PROJECT_ID: string;
  };
};

export const Web3Provider = ({ children, env }: ProvidersProps) => {
  const config = setupWagmi(env.RPC_URL, env.WALLETCONNECT_PROJECT_ID);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider><GqlProvider value={gqlClient}>{children}</GqlProvider></ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
