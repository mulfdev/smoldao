import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      remix({

        ssr: false,
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
        },
      }),
      tsconfigPaths(),
    ],
    define: {
      "process.env.WALLETCONNECT_PROJECT_ID": JSON.stringify(process.env.WALLETCONNECT_PROJECT_ID || env.WALLETCONNECT_PROJECT_ID),
      "process.env.RPC_URL": JSON.stringify(process.env.RPC_URL || env.RPC_URL),
    }
  };
});
