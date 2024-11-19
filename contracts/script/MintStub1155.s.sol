// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseScript} from "./Base.s.sol";
import {Stub1155} from "../src/stub/Stub1155.sol";
import "forge-std/console.sol";

contract MintStubs is BaseScript {
    address constant TARGET_ADDRESS =
        0x70483FD3d156316D4E5d4379D9c050e3C5a521b8;

    function run() external broadcaster {
        Stub1155 erc1155 = Stub1155(0x1e38AFBb2628943ABbDCDAb7151Fa84990930F4C);

        erc1155.mint(TARGET_ADDRESS, 1, 1000); // 1000 of token ID 1

        console.log("tokens minted to:", deployer);
    }
}
