// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseScript} from "./Base.s.sol";
import {Stub1155} from "../src/stub/Stub1155.sol";
import "forge-std/console.sol";

contract DeployStubs is BaseScript {
    function run() external broadcaster {
        // Deploy ERC1155
        Stub1155 erc1155 = new Stub1155();
        console.log("ERC1155 deployed to:", address(erc1155));

        // Write addresses to JSON file
        string memory jsonContent =
            string(abi.encodePacked("{", '"ERC1155": "', vm.toString(address(erc1155)), '"', "}"));
        vm.writeFile("deployed_addresses.json", jsonContent);
        console.log("Addresses written to deployed_addresses.json");

        // Optional: Mint some initial tokens
        erc1155.mint(deployer, 1, 1000); // 1000 of token ID 1

        console.log("Initial tokens minted to:", deployer);
    }
}
