// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseScript} from "./Base.s.sol";
import {Stub1155} from "../src/stub/Stub1155.sol";
import "forge-std/console.sol";

contract MintStubs is BaseScript {
    function run() external broadcaster {
        Stub1155 erc1155 = Stub1155(0x1e38AFBb2628943ABbDCDAb7151Fa84990930F4C);

        erc1155.mint(deployer, 1, 1000); // 1000 of token ID 1

        console.log("tokens minted to:", deployer);
    }
}
