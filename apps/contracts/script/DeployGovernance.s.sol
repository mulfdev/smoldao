// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import { BaseScript } from "./Base.s.sol";
import { SmolGov } from "../src/SmolGov.sol";
import { SmolGovernor } from "../src/SmolGovernor.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

contract Deploy is BaseScript {
    function run() public broadcaster {
        SmolGov govToken = new SmolGov(deployer);

        // Deploy TimelockController with deployer as temporary proposer
        address[] memory proposers = new address[](1);
        proposers[0] = deployer;
        address[] memory executors = new address[](1);
        executors[0] = address(0); // Allows anyone to execute

        uint256 timelockDelay = 300; // 5 minutes

        TimelockController timelock = new TimelockController(
            timelockDelay,
            proposers,
            executors,
            address(0) // No additional admin
        );

        // Deploy Governor
        SmolGovernor governor = new SmolGovernor(govToken, timelock);

        // Update TimelockController roles
        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        timelock.grantRole(timelock.CANCELLER_ROLE(), address(governor));
        timelock.revokeRole(timelock.PROPOSER_ROLE(), deployer);
        timelock.revokeRole(timelock.CANCELLER_ROLE(), deployer);

        // The TimelockController is already its own admin, so we don't need to grant it the admin role
        // We only need to revoke the admin role from the deployer if it was granted in the constructor
        if (timelock.hasRole(timelock.DEFAULT_ADMIN_ROLE(), deployer)) {
            timelock.revokeRole(timelock.DEFAULT_ADMIN_ROLE(), deployer);
        }

        // Log deployed addresses
        console.log("Governance Token (SmolGov) deployed at:", address(govToken));
        console.log("TimelockController deployed at:", address(timelock));
        console.log("Governor (SmolGovernor) deployed at:", address(governor));
    }
}
