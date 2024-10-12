// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { SmolGov } from "./SmolGov.sol";

contract Vault {
    SmolGov public immutable token;

    uint256 public totalSupply;

    constructor(address _token) {
        token = SmolGov(_token);
    }

    function deposit(uint256 _amount) external {
        /*
        a = amount
        B = balance of token before deposit
        T = total supply
        s = shares to mint

        (T + s) / T = (a + B) / B 

        s = aT / B
        */
        uint256 shares;
        if (totalSupply == 0) {
            shares = _amount;
        } else {
            shares = (_amount * totalSupply) / token.balanceOf(address(this));
        }

        token.mint(msg.sender, shares);
    }

    function withdraw(uint256 _shares) external {
        /*
        a = amount
        B = balance of token before withdraw
        T = total supply
        s = shares to burn

        (T - s) / T = (B - a) / B 

        a = sB / T
        */
        uint256 amount = (_shares * token.balanceOf(address(this))) / totalSupply;
        token.burn(amount);
    }
}
