// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract ReferralRewards is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    struct Referrer {
        uint256 totalEarningsETH; // Total ETH earnings
        uint256 totalEarningsUSDT; // Total USDT earnings
        uint256 referralsCount; // Total number of referrals
    }

    mapping(address => Referrer) public referrers; // Referrer statistics
    mapping(address => uint256) public pendingETH; // Pending ETH rewards
    mapping(address => uint256) public pendingUSDT; // Pending USDT rewards

    address[] public referrerList; // List of all referrer addresses
    address public presaleContract; // Address of the presale contract
    IERC20Upgradeable public USDTInterface; // Interface for USDT token

    // Events
    event RewardAdded(address indexed referrer, uint256 ethAmount, uint256 usdtAmount);
    event RewardClaimed(address indexed referrer, uint256 ethAmount, uint256 usdtAmount);
    event ETHTransferFailed(address indexed referrer, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _presaleContract, address _usdtAddress) external initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        presaleContract = _presaleContract;
        USDTInterface = IERC20Upgradeable(_usdtAddress);
    }

    modifier onlyPresale() {
        require(msg.sender == presaleContract, "Only the presale contract can call this function");
        _;
    }

    /**
     * @dev Add rewards for a referrer.
     * @param referrer The address of the referrer
     * @param ethAmount The amount of ETH to add as reward
     * @param usdtAmount The amount of USDT to add as reward
     */
    function addReward(
        address referrer,
        uint256 ethAmount,
        uint256 usdtAmount
    ) external payable onlyPresale {
        require(referrer != address(0), "Invalid referrer address");
        require(ethAmount > 0 || usdtAmount > 0, "No rewards to add");

        if (ethAmount > 0) {
            require(msg.value == ethAmount, "ETH amount mismatch");
            pendingETH[referrer] += ethAmount;
            referrers[referrer].totalEarningsETH += ethAmount;
        }

        if (usdtAmount > 0) {
            pendingUSDT[referrer] += usdtAmount;
            referrers[referrer].totalEarningsUSDT += usdtAmount;
        }

        if (referrers[referrer].referralsCount == 0) {
            referrers[referrer].referralsCount = 1; // Initialize referrals count
            referrerList.push(referrer); // Add referrer to the list
        } else {
            referrers[referrer].referralsCount += 1; // Increment referrals count
        }

        emit RewardAdded(referrer, ethAmount, usdtAmount);
    }

    /**
     * @dev Referrer claims their rewards.
     */
    function claimRewards() external nonReentrant {
        require(referrers[msg.sender].referralsCount > 0, "No referrals found");

        uint256 ethReward = pendingETH[msg.sender];
        uint256 usdtReward = pendingUSDT[msg.sender];
        require(ethReward > 0 || usdtReward > 0, "No rewards to claim");

        // Process ETH rewards
        if (ethReward > 0) {
            pendingETH[msg.sender] = 0; // Reset pending ETH rewards
            (bool success, ) = payable(msg.sender).call{value: ethReward}("");
            if (!success) {
                pendingETH[msg.sender] = ethReward; // Restore pending ETH rewards
                emit ETHTransferFailed(msg.sender, ethReward);
            }
        }

        // Process USDT rewards
        if (usdtReward > 0) {
            pendingUSDT[msg.sender] = 0; // Reset pending USDT rewards
            bool success = USDTInterface.transfer(msg.sender, usdtReward);
            require(success, "USDT transfer failed");
        }

        emit RewardClaimed(msg.sender, ethReward, usdtReward);
    }

    /**
     * @dev Get referrer details.
     * @param referrer The address of the referrer
     */
    function getReferrerDetails(address referrer)
        external
        view
        returns (
            uint256 totalEarningsETH,
            uint256 totalEarningsUSDT,
            uint256 referralsCount,
            uint256 pendingETHReward,
            uint256 pendingUSDTReward
        )
    {
        Referrer memory ref = referrers[referrer];
        return (
            ref.totalEarningsETH,
            ref.totalEarningsUSDT,
            ref.referralsCount,
            pendingETH[referrer],
            pendingUSDT[referrer]
        );
    }

    /**
     * @dev Get the leaderboard with pagination.
     * @param start Index to start from
     * @param end Index to end at (exclusive)
     */
    function getLeaderboard(uint256 start, uint256 end)
        external
        view
        returns (
            address[] memory referrerAddresses,
            uint256[] memory totalEarningsETH,
            uint256[] memory totalEarningsUSDT,
            uint256[] memory referralsCounts,
            uint256[] memory pendingETHRewards,
            uint256[] memory pendingUSDTRewards
        )
    {
        require(start < end && end <= referrerList.length, "Invalid range");

        uint256 range = end - start;
        referrerAddresses = new address[](range);
        totalEarningsETH = new uint256[](range);
        totalEarningsUSDT = new uint256[](range);
        referralsCounts = new uint256[](range);
        pendingETHRewards = new uint256[](range);
        pendingUSDTRewards = new uint256[](range);

        for (uint256 i = 0; i < range; i++) {
            address referrer = referrerList[start + i];
            Referrer memory ref = referrers[referrer];

            referrerAddresses[i] = referrer;
            totalEarningsETH[i] = ref.totalEarningsETH;
            totalEarningsUSDT[i] = ref.totalEarningsUSDT;
            referralsCounts[i] = ref.referralsCount;
            pendingETHRewards[i] = pendingETH[referrer];
            pendingUSDTRewards[i] = pendingUSDT[referrer];
        }
    }

    /**
     * @dev Fallback function to receive ETH.
     */
    receive() external payable {
        require(msg.sender == presaleContract, "Only presale contract can send ETH");
    }
}
