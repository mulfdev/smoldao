// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {BaseScript} from "./Base.s.sol";
import {Smol} from "../src/Smol.sol";
import {SmolGovernor} from "../src/SmolGovernor.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "forge-std/console.sol";

contract Deploy is BaseScript {
    function run() public broadcaster {
        // Deploy SmolGov first
        Smol govToken = new Smol(
            deployer,
            0x6EDCE65403992e310A62460808c4b910D972f10f
        );

        address[] memory proposers = new address[](1);
        proposers[0] = deployer;
        address[] memory executors = new address[](1);
        executors[0] = address(0); // Allows anyone to execute
        uint256 timelockDelay = 300; // 5 minutes

        TimelockController timelock = new TimelockController(
            timelockDelay,
            proposers,
            executors,
            deployer // Keep deployer as admin temporarily
        );

        // Deploy Governor
        SmolGovernor governor = new SmolGovernor(govToken, timelock);

        // Update TimelockController roles
        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        timelock.grantRole(timelock.CANCELLER_ROLE(), address(governor));

        // Revoke proposer and canceller roles from deployer
        timelock.revokeRole(timelock.PROPOSER_ROLE(), deployer);
        timelock.revokeRole(timelock.CANCELLER_ROLE(), deployer);

        // Make timelock its own admin
        timelock.grantRole(timelock.DEFAULT_ADMIN_ROLE(), address(timelock));

        // Revoke admin role from deployer (this should be the last step)
        timelock.revokeRole(timelock.DEFAULT_ADMIN_ROLE(), deployer);

        string memory jsonOutput = string(
            abi.encodePacked(
                "{\n",
                '  "Smol": "',
                vm.toString(address(govToken)),
                '",\n',
                '  "TimelockController": "',
                vm.toString(address(timelock)),
                '",\n',
                '  "SmolGovernor": "',
                vm.toString(address(governor)),
                '",\n',
                "}"
            )
        );

        // Write the JSON string to a file
        vm.writeFile("deployed_addresses.json", jsonOutput);

        // Log deployed addresses
        console.log("Governance Token (Smol) deployed at:", address(govToken));
        console.log("TimelockController deployed at:", address(timelock));
        console.log("Governor (SmolGovernor) deployed at:", address(governor));
    }
}
