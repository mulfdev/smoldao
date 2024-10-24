// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {BridgeToEth} from "../src/BridgeToEth.sol";
import {BaseScript} from "./Base.s.sol";

contract DeployBridgeToEth is BaseScript {
    address public constant ENDPOINT =
        0x6EDCE65403992e310A62460808c4b910D972f10f; // Eth Sepolia Endpoint

    function run() external broadcaster {
        // Deploy the bridge contract
        BridgeToEth bridge = new BridgeToEth(ENDPOINT, deployer, "");

        saveDeployment("BridgeToEth", address(bridge));

        console2.log("BridgeToEth deployed to:", address(bridge));
        console2.log("Endpoint:", ENDPOINT);
        console2.log("Owner:", deployer);
    }
}
