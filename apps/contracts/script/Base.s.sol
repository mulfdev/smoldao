// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25 <0.9.0;

import { Script } from "forge-std/src/Script.sol";

abstract contract BaseScript is Script {
    /// @dev Included to enable compilation of the script without a $MNEMONIC environment variable.
    string internal constant TEST_MNEMONIC =
        "test test test test test test test test test test test junk";

    /// @dev Needed for the deterministic deployments.
    bytes32 internal constant ZERO_SALT = bytes32(0);

    /// @dev The address of the transaction broadcaster.
    address internal broadcaster;

    /// @dev Used to derive the broadcaster's address if $ETH_FROM is not defined.
    string internal mnemonic;

    /// @dev Initializes the transaction broadcaster like this:
    ///
    /// - If $ETH_FROM is defined, use it.
    /// - Otherwise, derive the broadcaster address from $MNEMONIC.
    /// - If $MNEMONIC is not defined, default to a test mnemonic.
    ///
    /// The use case for $ETH_FROM is to specify the broadcaster key and its address via the command line.
    constructor() {
        address from = vm.envOr({ name: "ETH_FROM", defaultValue: address(0) });
        if (from != address(0)) {
            broadcaster = from;
        } else {
            mnemonic = vm.envOr({ name: "MNEMONIC", defaultValue: TEST_MNEMONIC });
            (broadcaster, ) = deriveRememberKey({ mnemonic: mnemonic, index: 0 });
        }
    }

    modifier broadcast() {
        vm.startBroadcast(broadcaster);
        _;
        vm.stopBroadcast();
    }

    function saveAddress(string memory name, address addr) internal {
        string memory deploymentFile = string.concat(vm.projectRoot(), "/deployments.json");
        string memory jsonContent = vm.readFile(deploymentFile);

        // If file doesn't exist or is empty, initialize it
        if (bytes(jsonContent).length == 0) {
            jsonContent = "{}";
        }

        // Update with new address
        vm.writeJson(
            vm.toString(abi.encodePacked(addr)),
            deploymentFile,
            string.concat(".", vm.toString(block.chainid), ".", name)
        );
    }

    function getAddress(string memory contractName) public view returns (address) {
        string memory deploymentFile = string.concat(vm.projectRoot(), "/deployments.json");
        string memory jsonContent = vm.readFile(deploymentFile);

        address deployedAddress = abi.decode(
            vm.parseJson(
                jsonContent,
                string.concat(".", vm.toString(block.chainid), ".", contractName)
            ),
            (address)
        );

        return deployedAddress;
    }
}
