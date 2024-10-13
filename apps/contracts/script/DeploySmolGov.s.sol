// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import { SmolGov } from "../src/SmolGov.sol";
import { BaseScript } from "./Base.s.sol";

contract Deploy is BaseScript {
    function run() public broadcaster {
        writeFile();
        new SmolGov(deployer);
    }
}
