// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IReferralRewards {
    function addReward(address referrer, uint256 ethAmount, uint256 usdtAmount) external payable;
}