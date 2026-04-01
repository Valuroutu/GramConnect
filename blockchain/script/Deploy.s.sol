// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {GramConnect} from "../src/GramConnect.sol";

contract DeployGramConnect is Script {

    function run() external returns (GramConnect) {

        vm.startBroadcast();

        address admin = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

        GramConnect gram = new GramConnect(admin);

        vm.stopBroadcast();

        return gram;
    }
}