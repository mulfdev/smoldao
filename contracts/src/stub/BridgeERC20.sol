// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract SmolGov is ERC20, ERC20Permit, Ownable {
    constructor(
        address initialOwner
    ) ERC20("BridgeStub", "BGS") Ownable(initialOwner) ERC20Permit("BridgeStub") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
