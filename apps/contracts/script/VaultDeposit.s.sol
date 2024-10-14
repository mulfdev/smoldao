// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { BaseScript } from "./Base.s.sol";
import { SmolVault } from "../src/SmolVault.sol";
import { SmolGov } from "../src/SmolGov.sol";
import "forge-std/src/console.sol";

contract VaultDeposit is BaseScript {
    function run() external broadcaster {
        string memory json = vm.readFile("deployed_addresses.json");
        address vaultAddress = abi.decode(vm.parseJson(json, ".SmolVault"), (address));

        SmolVault vault = SmolVault(vaultAddress);
        SmolGov token = vault.token();

        console.log("Deployer address:", deployer);
        console.log("Vault address:", address(vault));
        console.log("Token address:", address(token));

        uint256 depositAmount = 2000e18;
        console.log("Attempting to deposit:", depositAmount);

        uint256 initialVaultBalance = vault.balanceOf(deployer);
        uint256 initialTokenBalance = token.balanceOf(deployer);
        console.log("Initial vault shares balance:", initialVaultBalance);
        console.log("Initial user token balance:", initialTokenBalance);

        try vault.deposit(depositAmount) {
            console.log("Deposit successful");
            uint256 newVaultBalance = vault.balanceOf(deployer);
            uint256 newTokenBalance = token.balanceOf(deployer);
            console.log("New vault shares balance:", newVaultBalance);
            console.log("New user token balance:", newTokenBalance);
            console.log("Shares minted:", newVaultBalance - initialVaultBalance);
            console.log("Tokens minted:", newTokenBalance - initialTokenBalance);

            // Delegate votes to self
            token.delegate(deployer);
            console.log("Votes delegated to self");
        } catch Error(string memory reason) {
            console.log("Deposit failed. Reason:", reason);
        } catch (bytes memory lowLevelData) {
            console.log("Deposit failed. Low-level error:");
            console.logBytes(lowLevelData);
        }

        uint256 vaultTotalSupply = vault.totalSupply();
        console.log("Vault total supply:", vaultTotalSupply);
        address tokenOwner = token.owner();
        console.log("Token owner:", tokenOwner);
        console.log("Is vault the token owner?", tokenOwner == address(vault));

        // Check voting power
        uint256 votingPower = token.getVotes(deployer);
        console.log("Deployer voting power:", votingPower);
    }
}
