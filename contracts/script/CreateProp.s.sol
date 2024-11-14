// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseScript} from "./Base.s.sol";
import {SmolGovernor} from "../src/SmolGovernor.sol";
import {SmolGov} from "../src/SmolGov.sol";
import "forge-std/console.sol";

contract CreateProp is BaseScript {
    function run() external broadcaster {
        // Load deployed addresses from the JSON file
        string memory json = vm.readFile("deployed_addresses.json");
        address governorAddress = abi.decode(
            vm.parseJson(json, ".SmolGovernor"),
            (address)
        );
        address tokenAddress = abi.decode(
            vm.parseJson(json, ".SmolGov"),
            (address)
        );

        SmolGovernor governor = SmolGovernor(payable(governorAddress));
        SmolGov token = SmolGov(tokenAddress);

        console.log("Deployer address:", deployer);
        console.log("Governor address:", address(governor));
        console.log("Token address:", address(token));

        // Proposal details
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);

        // Add timestamp to make description unique
        string memory description = string(
            abi.encodePacked(
                "Proposal to send 0.0001 ETH (timestamp: ",
                vm.toString(block.timestamp),
                ")"
            )
        );

        address recipient = address(0x070337669A3e72249F39434Aa2CA326Ab68f09F8);
        targets[0] = recipient;
        values[0] = 0.0001 ether;
        calldatas[0] = "";

        // Check voting power
        uint256 proposalThreshold = governor.proposalThreshold();
        uint256 votingPower = token.getVotes(deployer);
        console.log("Proposal threshold:", proposalThreshold);
        console.log("Proposer voting power:", votingPower);

        if (votingPower < proposalThreshold) {
            console.log("Error: Proposer does not have enough voting power");
            return;
        }

        // Create the proposal with unique description
        try governor.propose(targets, values, calldatas, description) returns (
            uint256 proposalId
        ) {
            console.log("Proposal created successfully");
            console.log("Proposal ID:", proposalId);
            console.log("Description:", description);
            console.log("Proposal state:", uint256(governor.state(proposalId)));
        } catch Error(string memory reason) {
            console.log("Failed to create proposal. Reason:", reason);
        } catch (bytes memory lowLevelData) {
            console.log("Failed to create proposal. Low-level error:");
            console.logBytes(lowLevelData);
        }
    }
}
