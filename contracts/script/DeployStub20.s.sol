// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseScript} from "./Base.s.sol";
import {Stub20} from "../src/stub/Stub20.sol";
import "forge-std/console.sol";

contract DeployStubs is BaseScript {
    function run() external broadcaster {
        // Deploy ERC20
        Stub20 erc20 = new Stub20(deployer);
        console.log("ERC20 deployed to:", address(erc20));

        // Write addresses to JSON file
        string memory jsonContent = string(abi.encodePacked("{", '"ERC20": "', vm.toString(address(erc20)), '",', "}"));
        vm.writeFile("deployed_addresses.json", jsonContent);
        console.log("Addresses written to deployed_addresses.json");

        // Optional: Mint some initial tokens
        erc20.mint(deployer, 1000 * 10 ** 18); // 1000 tokens

        console.log("Initial tokens minted to:", deployer);
    }
}
