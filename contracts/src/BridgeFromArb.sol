// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {OApp, Origin, MessagingFee} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BridgeFromArb is OApp {
    IERC20 public token;
    address public constant BURN_ADDRESS = address(0);

    event TokensBurned(address from, uint256 amount);

    error InsufficientAllowance();
    error InsufficientBalance();
    error TransferFailed();

    constructor(
        address _endpoint,
        address _owner,
        address _token
    ) OApp(_endpoint, _owner) Ownable(_owner) {
        token = IERC20(_token);
    }

    function burnAndSend(
        uint32 _dstEid,
        uint256 _amount,
        bytes calldata _options
    ) external payable {
        // First transfer tokens to this contract
        if (token.allowance(msg.sender, address(this)) < _amount) {
            revert InsufficientAllowance();
        }
        if (token.balanceOf(msg.sender) < _amount) {
            revert InsufficientBalance();
        }
        bool success = token.transferFrom(msg.sender, address(this), _amount);
        if (!success) {
            revert TransferFailed();
        }

        // Then burn them from the contract
        success = token.transfer(BURN_ADDRESS, _amount);
        if (!success) {
            revert TransferFailed();
        }

        bytes memory payload = abi.encode(msg.sender, _amount);
        _lzSend(
            _dstEid,
            payload,
            _options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );
        emit TokensBurned(msg.sender, _amount);
    }

    function _lzReceive(
        Origin calldata,
        bytes32,
        bytes calldata,
        address,
        bytes calldata
    ) internal override {
        revert("Receiving not supported");
    }
}
