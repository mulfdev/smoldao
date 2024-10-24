// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {BaseScript} from "./Base.s.sol";
import {BridgeFromArb} from "../src/BridgeFromArb.sol";

contract DeployBridgeFromArb is BaseScript {
    address public constant ENDPOINT =
        0x6EDCE65403992e310A62460808c4b910D972f10f; // Arb Sepolia Endpoint
    address public constant TOKEN = 0x7baDb8FbCA427bE71F08890DF8622C0DBe91A56F; // Token on Arb Sepolia

    function run() external broadcaster {
        BridgeFromArb bridge = new BridgeFromArb(ENDPOINT, deployer, TOKEN);

        saveDeployment("BridgeFromArb", address(bridge));

        console2.log("BridgeFromArb deployed to:", address(bridge));
        console2.log("Endpoint:", ENDPOINT);
        console2.log("Token:", TOKEN);
        console2.log("Owner:", deployer);
    }
}
