// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseScript} from "./Base.s.sol";
import {SmolAdapter} from "../src/SmolAdapter.sol";
import "forge-std/console.sol";

contract DeploySmolAdapter is BaseScript {
    function run() external broadcaster {
        address stubToken = getDeployment("StubToken");
        SmolAdapter smolAdapter = new SmolAdapter(
            stubToken,
            0x6EDCE65403992e310A62460808c4b910D972f10f,
            deployer
        );

        saveDeployment("SmolAdapter", address(smolAdapter));

        console.log("SmolAdapter deployed to ", address(smolAdapter));
    }
}
