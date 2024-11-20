// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import {OFT} from "@layerzerolabs/oft-evm/contracts/OFT.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Smol is ERC20Permit, ERC20Votes, ERC20Burnable, OFT {
    constructor(
        address initialOwner,
        address endpoint
    )
        OFT("Smol", "Smol", endpoint, initialOwner)
        Ownable(initialOwner)
        ERC20Permit("Smol")
    {}

    function transfer(
        address to,
        uint256 amount
    ) public virtual override(ERC20) onlyOwner returns (bool) {
        return super.transfer(to, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override(ERC20) onlyOwner returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, amount);
    }

    function nonces(
        address owner
    ) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    function burn(uint256 amount) public virtual override onlyOwner {
        super.burn(amount);
    }

    function burnFrom(
        address account,
        uint256 amount
    ) public virtual override onlyOwner {
        super.burnFrom(account, amount);
    }
}
