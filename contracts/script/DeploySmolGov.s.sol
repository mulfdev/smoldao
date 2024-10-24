// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {BaseScript} from "./Base.s.sol";
import {SmolGov} from "../src/SmolGov.sol";

contract Deploy is BaseScript {
    function run() public broadcaster {
        new SmolGov(deployer);
    }
}
