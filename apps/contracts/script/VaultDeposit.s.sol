// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { BaseScript } from "./Base.s.sol";
import { SmolVault } from "../src/SmolVault.sol";
import { SmolGov } from "../src/SmolGov.sol";
import "forge-std/src/console.sol";

contract VaultDeposit is BaseScript {
    function run() external broadcaster {
        // Load deployed addresses from the JSON file
        string memory json = vm.readFile("deployed_addresses.json");
        address vaultAddress = abi.decode(vm.parseJson(json, ".SmolVault"), (address));

        SmolVault vault = SmolVault(vaultAddress);
        SmolGov token = vault.token();

        console.log("Deployer address:", deployer);
        console.log("Vault address:", address(vault));
        console.log("Token address:", address(token));

        uint256 depositAmount = 1000; // Adjust this amount as needed
        console.log("Attempting to deposit:", depositAmount);

        // Check initial balances
        uint256 initialVaultBalance = vault.balanceOf(deployer);
        uint256 initialTokenBalance = token.balanceOf(deployer);
        console.log("Initial vault balance:", initialVaultBalance);
        console.log("Initial token balance:", initialTokenBalance);

        // Attempt to deposit
        try vault.deposit(depositAmount) {
            console.log("Deposit successful");

            uint256 newVaultBalance = vault.balanceOf(deployer);
            uint256 newTokenBalance = token.balanceOf(deployer);
            console.log("New vault balance:", newVaultBalance);
            console.log("New token balance:", newTokenBalance);
        } catch Error(string memory reason) {
            console.log("Deposit failed. Reason:", reason);
        } catch (bytes memory lowLevelData) {
            console.log("Deposit failed. Low-level error:");
            console.logBytes(lowLevelData);
        }

        // Final checks
        uint256 vaultTotalSupply = vault.totalSupply();
        console.log("Vault total supply:", vaultTotalSupply);

        address tokenOwner = token.owner();
        console.log("Token owner:", tokenOwner);
        console.log("Is vault the token owner?", tokenOwner == address(vault));
    }
}
