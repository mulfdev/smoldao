// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {SmolGov} from "./SmolGov.sol";

contract SmolVault {
    SmolGov public immutable token;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(address _token) {
        token = SmolGov(_token);
    }

    function _mint(address _to, uint256 _shares) private {
        totalSupply += _shares;
        balanceOf[_to] += _shares;
    }

    function _burn(address _from, uint256 _shares) private {
        totalSupply -= _shares;
        balanceOf[_from] -= _shares;
    }

    function deposit(uint256 _amount) external {
        require(_amount > 0, "Deposit amount must be greater than 0");
        uint256 shares;
        if (totalSupply == 0) {
            shares = _amount;
        } else {
            shares = (_amount * totalSupply) / token.balanceOf(msg.sender);
        }
        _mint(msg.sender, shares);
        token.mint(msg.sender, _amount);
    }

    function withdraw(uint256 _shares) external {
        require(_shares > 0, "Withdraw amount must be greater than 0");
        require(balanceOf[msg.sender] >= _shares, "Insufficient balance");
        uint256 amount = (_shares * token.balanceOf(msg.sender)) / totalSupply;
        _burn(msg.sender, _shares);
        token.burn(amount);
    }
}
