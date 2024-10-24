// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {BridgeFromArb} from "../src/BridgeFromArb.sol";
import {BaseScript} from "./Script";

contract SetPeerSep is BaseScript {
    // Chain EIDs
    uint32 constant ARB_SEPOLIA_EID = 40161; // Verify this is correct

    function addressToBytes32(address _addr) public pure returns (bytes32) {
        return bytes32(uint256(uint160(_addr)));
    }

    function run() external {
        address destAddr = address(0xfFef3F234925bc888920C6A494c51Ad45ef61A91);
        address srcAddr = address(0x67C94c13d099705Bd928e605DEa1F8134BF65B39);

        // Set peer for source bridge
        BridgeFromArb(srcAddr).setPeer(
            ARB_SEPOLIA_EID,
            addressToBytes32(destAddr)
        );

        console2.log("\n=== Setting Peers ===");
        console2.log("Source Bridge:", srcAddr);
        console2.log("Target Bridge:", destAddr);
        console2.log("Base Sepolia EID:", ARB_SEPOLIA_EID);
    }
}
