// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {BaseScript} from "./Base.s.sol";
import {BridgeFromArb} from "../src/BridgeFromArb.sol";

contract BurnAndSendScript is BaseScript {
    function run() external broadcaster {
        BridgeFromArb bridge = BridgeFromArb(
            0xfFef3F234925bc888920C6A494c51Ad45ef61A91
        );
        bridge.token().approve(address(bridge), 1);

        bridge.burnAndSend{value: 0}(
            40161, // dst chain id
            5, // amount
            "" // empty options
        );
    }
}
