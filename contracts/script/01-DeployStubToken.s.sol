// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseScript} from "./Base.s.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StubToken is ERC20 {
    constructor() ERC20("Stub", "STUB") {}

    function mint(address to) public {
        _mint(to, 1000 ** decimals());
    }
}

contract DeployStub is BaseScript {
    function run() external broadcaster {
        StubToken stubToken = new StubToken();

        stubToken.mint(deployer);

        saveDeployment("StubToken", address(stubToken));
    }
}
