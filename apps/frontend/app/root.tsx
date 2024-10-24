import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import { Web3Provider } from "./providers";

import "./tailwind.css";
import { ConnectKitButton } from "connectkit";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader() {
  if (typeof process.env.WALLETCONNECT_PROJECT_ID !== "string") {
    throw new Error("WALLETCONNECT_PROJECT_ID required");
  }
  if (typeof process.env.RPC_URL !== "string") {
    throw new Error("RPC_URL required");
  }

  return {
    ENV: {
      WALLETCONNECT_PROJECT_ID: process.env.WALLETCONNECT_PROJECT_ID,
      RPC_URL: process.env.RPC_URL,
    },
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="text-white w-full flex flex-col justify-center align-center">

        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { ENV } = useLoaderData<typeof loader>();
  return (
    <Web3Provider env={ENV}>
      <div className="p-8 w-full flex justify-end items-center">
        <ConnectKitButton />
      </div>
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-16 w-full">
          <Outlet />
        </div>
      </div>
    </Web3Provider>
  );
}
