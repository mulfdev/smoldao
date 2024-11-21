// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {BaseScript} from "./Base.s.sol";
import {IOAppCore} from "@layerzerolabs/oapp-evm/contracts/oapp/interfaces/IOAppCore.sol";

contract SetPeer is BaseScript {
    mapping(uint => PeerConfig) public configs;

    struct PeerConfig {
        address oappAddr;
        uint32 peerEid;
        address endpoint;
        bytes32 peer;
    }

    constructor() {
        configs[421614] = PeerConfig({
            oappAddr: getDeployment("SmolAdapter"),
            peerEid: 40161,
            endpoint: 0x6EDCE65403992e310A62460808c4b910D972f10f,
            peer: addressToBytes32(getDeployment("Smol"))
        });
        configs[11155111] = PeerConfig({
            oappAddr: getDeployment("Smol"),
            peerEid: 40231,
            endpoint: 0x6EDCE65403992e310A62460808c4b910D972f10f,
            peer: addressToBytes32(getDeployment("SmolAdapter"))
        });
    }

    function addressToBytes32(address _addr) public pure returns (bytes32) {
        return bytes32(uint256(uint160(_addr)));
    }

    function run() external broadcaster {
        PeerConfig memory peerConfig = configs[block.chainid];

        require(peerConfig.peer.length != 0, "unsupported chain");

        IOAppCore(peerConfig.oappAddr).setPeer(
            peerConfig.peerEid,
            peerConfig.peer
        );

        console2.log("\n=== Setting Peers ===");
        // console2.log("Source Bridge:", srcAddr);
        // console2.log("Target Bridge:", destAddr);
        // console2.log("Base Sepolia EID:", ARB_SEPOLIA_EID);
    }
}
