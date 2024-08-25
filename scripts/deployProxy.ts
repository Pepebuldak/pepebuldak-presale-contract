import { ethers } from "hardhat";
import { IERC20_ABI, deployProxy } from "./common";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("[Deployer account address]: " + deployer.address);

  // Chainlink contract address (ETH/USD), Sepolia
  const priceFeedAddress = process.env.PRICE_FEED_ADDRESS;
  const usdtAddress = process.env.USDT_ADDRESS;
  const saleTokenAddress = process.env.SALE_TOKEN_ADDRESS;
  if (!priceFeedAddress || !saleTokenAddress || !usdtAddress) return;

  // Deploy the Presale contract first to get its address
  const presaleAddress = await deployProxy(
    "Presale",
    [], // Constructor arguments
    [priceFeedAddress, usdtAddress] // Initialize arguments
  );
  console.log(`Presale deployed to: ${presaleAddress}`);

  // Deploy the StakingManager contract with the presale address
  const rewardTokensPerBlock = ethers.BigNumber.from("50000000000000000000000"); // 50,000 token

  const lockedTime = 259200000; // 100 month seconds
  const endBlock = 32689230; // about 5 years
  const stakingManagerAddress = await deployProxy(
    "stakingManager",
    [], // Constructor arguments
    [
      saleTokenAddress, // ERC20 token
      presaleAddress, // Use the deployed presale contract address
      rewardTokensPerBlock,
      lockedTime,
      endBlock,
    ], // Initialize arguments
    "__stakingManager_init"
  );
  console.log(`StakingManager deployed to: ${stakingManagerAddress}`);

  const presaleContract = await ethers.getContractAt("Presale", presaleAddress);
  // set receiver wallet address and max tokens to buy
  await presaleContract.changePaymentWallet('0xC4689a5772Cd5cb59F282a16847a439e83c5f311');
  await presaleContract.changeMaxTokensToBuy(200000000000);
  console.log("Payment wallet and max tokens set");
  // Start the claim process in the Presale contract
  const startTime = 1724142297;
  const endTime = 1755678297;
  const noOfTokens = ethers.BigNumber.from("2100000000000000000000000000000"); // Provided token amount

  const tokenContract = await ethers.getContractAt(
    IERC20_ABI,
    saleTokenAddress
  );
  await tokenContract.approve(presaleAddress, noOfTokens);
  const currentAllowance = await tokenContract.allowance(
    deployer.address,
    presaleAddress
  );
  console.log(`Current allowance: ${currentAllowance.toString()}`);
  await presaleContract.startClaim(
    startTime,
    endTime,
    noOfTokens, // Number of tokens to add to the contract
    saleTokenAddress, // ERC20 token address
    stakingManagerAddress
  );
  console.log(`Claim process started in Presale contract`);

  // Set rounds in the Presale contract
  const roundStartTime = 1724569976;
  const roundsAmount = [
    ethers.BigNumber.from("105000000000"), // 1st round: 105 billion
    ethers.BigNumber.from("210000000000"), // 2nd round: 210 billion
    ethers.BigNumber.from("315000000000"), // 3rd round: 315 billion
    ethers.BigNumber.from("420000000000"), // 4th round: 420 billion
    ethers.BigNumber.from("525000000000"), // 5th round: 525 billion
    ethers.BigNumber.from("630000000000"), // 6th round: 630 billion
    ethers.BigNumber.from("735000000000"), // 7th round: 735 billion
    ethers.BigNumber.from("840000000000"), // 8th round: 840 billion
    ethers.BigNumber.from("945000000000"), // 9th round: 945 billion
    ethers.BigNumber.from("1050000000000"), // 10th round: 1.05 trillion
    ethers.BigNumber.from("1155000000000"), // 11th round: 1.155 trillion
    ethers.BigNumber.from("1260000000000"), // 12th round: 1.26 trillion
    ethers.BigNumber.from("1365000000000"), // 13th round: 1.365 trillion
    ethers.BigNumber.from("1470000000000"), // 14th round: 1.47 trillion
    ethers.BigNumber.from("1575000000000"), // 15th round: 1.575 trillion
    ethers.BigNumber.from("1680000000000"), // 16th round: 1.68 trillion
    ethers.BigNumber.from("1785000000000"), // 17th round: 1.785 trillion
    ethers.BigNumber.from("1890000000000"), // 18th round: 1.89 trillion
    ethers.BigNumber.from("1995000000000"), // 19th round: 1.995 trillion
    ethers.BigNumber.from("2100000000000"), // 20th round: 2.1 trillion
  ];
  const roundsPrice = [
    800000000000, 880000000000, 968000000000, 1064800000000, 1171280000000,
    1288408000000, 1417248800000, 1558973680000, 1714871048000, 1886358152800,
    2074993968080, 2282493364888, 2510742701376, 2761816971514, 3037998668666,
    3341798535532, 3675978389085, 4043576227994, 4447933850793, 4892727235872,
  ];

  // 7 days(604800s) terms
  const roundsEndTS = [];
  for (let i = 0; i < 20; i++) {
    roundsEndTS.push(roundStartTime + (i + 1) * 604800);
  }

  await presaleContract.changeRoundsData([
    roundsAmount,
    roundsPrice,
    roundsEndTS,
  ]);
  console.log(`Rounds data set in Presale contract`);

  console.log(`NEXT_PUBLIC_STAKING_MANAGER_CONTRACT=${stakingManagerAddress}`);
  console.log(`NEXT_PUBLIC_PRESALE_CONTRACT=${presaleAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
