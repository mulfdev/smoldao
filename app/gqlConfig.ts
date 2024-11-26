import { Client, cacheExchange, fetchExchange } from "urql";

export const gqlClient = new Client({
    url: "https://api.goldsky.com/api/public/project_clw1458fdv5ni01uthnie08s7/subgraphs/SmolDAO-arbitrum-sepolia/1/gn",
    exchanges: [cacheExchange, fetchExchange],
});
