// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script } from "forge-std/src/Script.sol";

abstract contract BaseScript is Script {
    address internal deployer;
    uint256 internal deployerPrivateKey;
    string internal rpcUrl;

    constructor() {
        rpcUrl = vm.envString("RPC_URL");
        deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        deployer = vm.addr(deployerPrivateKey);
        vm.createSelectFork(rpcUrl);
    }

    modifier broadcaster() {
        vm.startBroadcast(deployerPrivateKey);
        _;
        vm.stopBroadcast();
    }
}
