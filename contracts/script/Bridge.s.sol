// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {OptionsBuilder} from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OptionsBuilder.sol";
import {BaseScript} from "./Base.s.sol";
import {MessagingFee, MessagingReceipt} from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroEndpointV2.sol";
import {SendParam, IOFT, OFTReceipt} from "@layerzerolabs/oft-evm/contracts/interfaces/IOFT.sol";

contract Bridge is BaseScript {
    using OptionsBuilder for bytes;

    uint256 constant GAS_LIMIT = 1000000; // Gas limit for the executor
    uint256 constant MSG_VALUE = 0; // msg.value for the lzReceive() function on destination in wei

    function sendTokens(
        address _oft, // OFT contract address
        uint32 _dstEid, // destination endpoint ID
        address _toAddress, // destination address
        uint256 _amount, // amount to send
        bool _payInLzToken // whether to pay in LZ token
    ) external payable {
        // Convert address to bytes32 for cross-chain messaging
        bytes32 _to = bytes32(uint256(uint160(_toAddress)));

        // Construct the send parameters for OFT
        SendParam memory sendParam = SendParam({
            dstEid: _dstEid, // destination chain ID
            to: _to, // recipient address as bytes32
            amountLD: _amount, // amount in local decimals
            minAmountLD: _amount, // minimum amount in local decimals (set equal to amount for no slippage)
            extraOptions: OptionsBuilder // executor options
                .newOptions()
                .addExecutorLzReceiveOption(GAS_LIMIT, MSG_VALUE),
            composeMsg: bytes(""), // compose msg for send and call
            oftCmd: bytes("") // OFT-specific commands
        });

        // First get quote for the OFT transfer
        MessagingFee memory fee = IOFT(_oft).quoteSend(
            sendParam,
            _payInLzToken
        );

        // Send the OFT tokens
        (MessagingReceipt memory receipt, OFTReceipt memory oftReceipt) = IOFT(
            _oft
        ).send{value: fee.nativeFee}(
            sendParam,
            fee,
            payable(msg.sender) // refund address
        );
    }

    function run() public broadcaster {}
}
