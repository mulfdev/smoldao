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

    function writeFile() internal {
        string memory deploymentInfo = vm.serializeJson(
            "deploymentInfo",
            abi.encode(
                "contractName",
                "YourContract",
                "address",
                address(deployedContract),
                "deploymentTime",
                block.timestamp
            )
        );

        // Write deployment info to a JSON file
        vm.writeJson(deploymentInfo, "./deployment-info.json");

        string memory path = "file.txt";
        string memory data = "hello world";
        vm.writeFile(path, data);
    }
}
