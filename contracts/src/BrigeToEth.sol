// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {OApp, Origin, MessagingFee} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract BridgeToEth is OApp, ERC1155 {
    uint256 public constant TOKEN_ID = 1;

    event TokensMinted(address to, uint256 amount);

    constructor(
        address _endpoint,
        address _owner,
        string memory _uri
    ) OApp(_endpoint, _owner) Ownable(_owner) ERC1155(_uri) {}

    function _lzReceive(
        Origin calldata,
        bytes32,
        bytes calldata payload,
        address,
        bytes calldata
    ) internal override {
        (address to, uint256 amount) = abi.decode(payload, (address, uint256));

        _mint(to, TOKEN_ID, amount, "");

        emit TokensMinted(to, amount);
    }
}
