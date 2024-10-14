// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import { BaseScript } from "./Base.s.sol";
import { SmolGov } from "../src/SmolGov.sol";
import { SmolGovernor } from "../src/SmolGovernor.sol";
import { SmolVault } from "../src/SmolVault.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "forge-std/src/console.sol";

contract Deploy is BaseScript {
    function run() public broadcaster {
        // Deploy SmolGov first
        SmolGov govToken = new SmolGov(deployer);

        // Then deploy SmolVault with the govToken address
        SmolVault smolVault = new SmolVault(address(govToken));

        // Transfer ownership of govToken to smolVault
        govToken.transferOwnership(address(smolVault));
        // Rest of the deployment script remains the same...
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
                '  "SmolGov": "',
                vm.toString(address(govToken)),
                '",\n',
                '  "TimelockController": "',
                vm.toString(address(timelock)),
                '",\n',
                '  "SmolGovernor": "',
                vm.toString(address(governor)),
                '",\n',
                '  "SmolVault": "',
                vm.toString(address(smolVault)),
                '"\n',
                "}"
            )
        );

        // Write the JSON string to a file
        vm.writeFile("deployed_addresses.json", jsonOutput);

        // Log deployed addresses
        console.log("Governance Token (SmolGov) deployed at:", address(govToken));
        console.log("TimelockController deployed at:", address(timelock));
        console.log("Governor (SmolGovernor) deployed at:", address(governor));
        console.log("Vault (SmolVault) deployed at:", address(smolVault));
    }
}
