// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract PlaceholderToken is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    constructor(
        address initialOwner
    ) ERC20("PlaceholderToken", "PHT") Ownable(initialOwner) ERC20Permit("PlaceholderToken") {
        _mint(initialOwner, 1000);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
