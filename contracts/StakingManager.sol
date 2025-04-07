//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.19;

import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';

contract stakingManager is OwnableUpgradeable {
  using SafeERC20Upgradeable for IERC20Upgradeable; // Wrappers around ERC20 operations that throw on failure

  IERC20Upgradeable public stakeToken; // Token to be staked and rewarded
  address public presaleContract; //presale contract address
  uint256 public tokensStakedByPresale; //total tokens staked by preSale
  uint256 public tokensStaked; // Total tokens staked

  uint256 private lastRewardedBlock; // Last block number the user had their rewards calculated
  uint256 public accumulatedRewardsPerShare; // Accumulated rewards per share times REWARDS_PRECISION
  uint256 public rewardTokensPerBlock; // Number of reward tokens minted per block
  uint256 private constant REWARDS_PRECISION = 1e12; // A big number to perform mul and div operations

  uint256 public lockedTime; //To lock the tokens in contract for definite time.
  bool public harvestLock; //To lock the harvest/claim.
  uint public endBlock; //At this block,the rewards generation will be stopped.
  uint256 public claimStart; //Users can claim after this time in epoch.

  // Staking user for a pool
  struct PoolStaker {
    uint256 amount; // The tokens quantity the user has staked.
    uint256 stakedTime; //the time at tokens staked
    uint256 lastUpdatedBlock;
    uint256 Harvestedrewards; // The reward tokens quantity the user  harvested
    uint256 rewardDebt; // The amount relative to accumulatedRewardsPerShare the user can't get as reward
  }

  //  staker address => PoolStaker
  mapping(address => PoolStaker) public poolStakers;
  mapping(address => bool) public isBlacklisted;
  mapping(address => uint) public userLockedRewards;
  mapping(address => uint256) public stakerRewardMultiplier;

  // boost staking
  uint256 public boostedRewardMultiplier; // Multiplier for boosted deposits
  address public trustedSigner; // Signer address for verifying boost deposits
  uint256 public tokensStakedWeighted; // Weighted tokens for reward calculation
  // Events
  event Deposit(address indexed user, uint256 amount);
  event DepositBoosted(address indexed user, uint256 amount, uint256 multiplier);
  event Withdraw(address indexed user, uint256 amount);
  event HarvestRewards(address indexed user, uint256 amount);

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function __stakingManager_init(address _rewardTokenAddress, address _presale, uint256 _rewardTokensPerBlock, uint _lockTime, uint _endBlock) public initializer {
    __Ownable_init_unchained();
    rewardTokensPerBlock = _rewardTokensPerBlock;
    stakeToken = IERC20Upgradeable(_rewardTokenAddress);
    presaleContract = _presale;
    lockedTime = _lockTime;
    endBlock = _endBlock;
    harvestLock = true;
  }

  modifier onlyPresale() {
    require(msg.sender == presaleContract, 'This method is only for presale Contract');
    _;
  }

  /**
   * @dev Internal function to handle deposit logic
   */
  function _handleDeposit(address _user, uint256 _amount, uint256 _multiplier) internal {
    PoolStaker storage staker = poolStakers[_user];

    // Update pool stakers
    _harvestRewards(_user);

    // Update current staker
    staker.amount += _amount;
    stakerRewardMultiplier[_user] = _multiplier;
    uint256 weightedAmount = staker.amount * getRewardMultiplier(stakerRewardMultiplier[_user]);
    staker.rewardDebt = (weightedAmount * accumulatedRewardsPerShare) / REWARDS_PRECISION;
    staker.stakedTime = block.timestamp;
    staker.lastUpdatedBlock = block.number;

    // Update pool
    tokensStaked += _amount;
    tokensStakedWeighted += _amount * _multiplier;

    // Transfer tokens
    stakeToken.safeTransferFrom(msg.sender, address(this), _amount);
  }

  /**
   * @dev Deposit tokens to the pool
   */
  function deposit(uint256 _amount) external {
    require(block.number < endBlock, 'staking has been ended');
    require(_amount > 0, "Deposit amount can't be zero");

    _handleDeposit(msg.sender, _amount, 1);
    emit Deposit(msg.sender, _amount);
  }

  /**
   * @dev Boost deposit tokens to the pool
   */
  function depositWithBoost(uint256 _amount, bytes memory signature) external {
    require(block.number < endBlock, 'staking has been ended');
    require(_amount > 0, "Deposit amount can't be zero");

    // Verify signature
    bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encodePacked(msg.sender, _amount, "OpenFranchise"))));
    address recoveredSigner = recoverSigner(messageHash, signature);
    require(recoveredSigner == trustedSigner, "Invalid signature");

    _handleDeposit(msg.sender, _amount, boostedRewardMultiplier);
    emit DepositBoosted(msg.sender, _amount, boostedRewardMultiplier);
  }

  /**
  * @dev Deposit tokens to the pool by presale contract
  */
  function depositByPresale(address _user, uint256 _amount) external onlyPresale {
    require(block.number < endBlock, 'staking has been ended');
    require(_amount > 0, "Deposit amount can't be zero");

    _handleDeposit(_user, _amount, 1);
    tokensStakedByPresale += _amount;
    emit Deposit(_user, _amount);
  }

  /**
   * @dev Withdraw all tokens from existing pool
   */
  function withdraw() external {
    PoolStaker memory staker = poolStakers[msg.sender];
    uint256 amount = staker.amount;
    require(staker.stakedTime + lockedTime <= block.timestamp && claimStart + lockedTime <= block.timestamp, 'you are not allowed to withdraw before locked Time');
    require(amount > 0, "Withdraw amount can't be zero");

    // Pay rewards
    harvestRewards();

    // Update pool
    tokensStaked -= amount;
    tokensStakedWeighted -= amount * getRewardMultiplier(stakerRewardMultiplier[msg.sender]);

    //delete staker
    delete poolStakers[msg.sender];
    delete stakerRewardMultiplier[msg.sender];

    // Withdraw tokens
    emit Withdraw(msg.sender, amount);
    stakeToken.safeTransfer(msg.sender, amount);
  }

  /**
   * @dev Harvest user rewards
   */
  function harvestRewards() public {
    _harvestRewards(msg.sender);
  }

  /**
   * @dev Harvest user rewards
   */
  function _harvestRewards(address _user) private {
    require(!isBlacklisted[_user], 'This Address is Blacklisted');

    updatePoolRewards();
    PoolStaker storage staker = poolStakers[_user];
    uint256 weightedAmount = staker.amount * getRewardMultiplier(stakerRewardMultiplier[_user]);
    uint256 rewardsToHarvest = ((weightedAmount * accumulatedRewardsPerShare) / REWARDS_PRECISION) - staker.rewardDebt;
    if (rewardsToHarvest == 0) {
      return;
    }

    staker.Harvestedrewards += rewardsToHarvest;
    staker.rewardDebt = (weightedAmount * accumulatedRewardsPerShare) / REWARDS_PRECISION;
    if (!harvestLock) {
      if (userLockedRewards[_user] > 0) {
        rewardsToHarvest += userLockedRewards[_user];
        userLockedRewards[_user] = 0;
      }
      emit HarvestRewards(_user, rewardsToHarvest);
      stakeToken.safeTransfer(_user, rewardsToHarvest);
    } else {
      userLockedRewards[_user] += rewardsToHarvest;
    }
  }

  /**
   * @dev Update pool's accumulatedRewardsPerShare and lastRewardedBlock
   */
  function updatePoolRewards() private {
    if (tokensStakedWeighted == 0) {
      lastRewardedBlock = block.number;
      return;
    }
    uint256 blocksSinceLastReward = block.number > endBlock ? endBlock - lastRewardedBlock : block.number - lastRewardedBlock;
    uint256 rewards = blocksSinceLastReward * rewardTokensPerBlock;
    accumulatedRewardsPerShare = accumulatedRewardsPerShare + ((rewards * REWARDS_PRECISION) / tokensStakedWeighted);
    lastRewardedBlock = block.number > endBlock ? endBlock : block.number;
  }

  /**
   *@dev To get the number of rewards that user can get
   */
  function getRewards(address _user) public view returns (uint) {
    if (tokensStakedWeighted == 0) return 0;
    uint256 blocksSinceLastReward = block.number > endBlock ? endBlock - lastRewardedBlock : block.number - lastRewardedBlock;
    uint256 rewards = blocksSinceLastReward * rewardTokensPerBlock;
    uint256 accCalc = accumulatedRewardsPerShare + ((rewards * REWARDS_PRECISION) / tokensStakedWeighted);
    PoolStaker memory staker = poolStakers[_user];
    uint256 weightedAmount = staker.amount * getRewardMultiplier(stakerRewardMultiplier[_user]);
    return ((weightedAmount * accCalc) / REWARDS_PRECISION) - staker.rewardDebt + userLockedRewards[_user];
  }

  function getRewardMultiplier(uint256 rawMultiplier) internal pure returns (uint256) {
    return rawMultiplier == 0 ? 1 : rawMultiplier;
  }

  function recoverSigner(bytes32 hash, bytes memory signature) internal pure returns (address) {
    bytes32 r;
    bytes32 s;
    uint8 v;

    (v, r, s) = splitSignature(signature);
    return ecrecover(hash, v, r, s);
  }

  function splitSignature(bytes memory sig) internal pure returns (uint8 v, bytes32 r, bytes32 s) {
    require(sig.length == 65, "Invalid signature length");

    assembly {
      r := mload(add(sig, 32))
      s := mload(add(sig, 64))
      v := byte(0, mload(add(sig, 96)))
    }
  }

  function setHarvestLock(bool _harvestlock) external onlyOwner {
    harvestLock = _harvestlock;
  }

  function setPresale(address _presale) external onlyOwner {
    presaleContract = _presale;
  }

  function setStakeToken(address _stakeToken) external onlyOwner {
    stakeToken = IERC20Upgradeable(_stakeToken);
  }

  function setLockedTime(uint _time) external onlyOwner {
    lockedTime = _time;
  }

  function setEndBlock(uint _endBlock) external onlyOwner {
    endBlock = _endBlock;
  }

  function setClaimStart(uint _claimStart) external onlyOwner {
    claimStart = _claimStart;
  }
  
  function setRewardTokensPerBlock(uint256 _rewardTokensPerBlock) external onlyOwner {
    rewardTokensPerBlock = _rewardTokensPerBlock;
  }

  /**
   * @dev To add users to blacklist which restricts blacklisted users from claiming
   * @param _usersToBlacklist addresses of the users
   */
  function blacklistUsers(address[] calldata _usersToBlacklist) external onlyOwner {
    for (uint256 i = 0; i < _usersToBlacklist.length; i++) {
      isBlacklisted[_usersToBlacklist[i]] = true;
    }
  }

  /**
   * @dev To remove users from blacklist which restricts blacklisted users from claiming
   * @param _userToRemoveFromBlacklist addresses of the users
   */
  function removeFromBlacklist(address[] calldata _userToRemoveFromBlacklist) external onlyOwner {
    for (uint256 i = 0; i < _userToRemoveFromBlacklist.length; i++) {
      isBlacklisted[_userToRemoveFromBlacklist[i]] = false;
    }
  }

  function setBoostedRewardMultiplier(uint256 _multiplier) external onlyOwner {
    require(_multiplier >= 1, "Multiplier must be at least 1");
    boostedRewardMultiplier = _multiplier;
  }

  function setTrustedSigner(address _trustedSigner) external onlyOwner {
    trustedSigner = _trustedSigner;
  }

  function setTokensStakedWeighted(uint256 _tokensStakedWeighted) external onlyOwner {
    tokensStakedWeighted = _tokensStakedWeighted;
  }
}