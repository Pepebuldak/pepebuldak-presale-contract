import { ethers } from "hardhat";
import { IERC20_ABI, deployProxy } from "./common";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("[Deployer account address]: " + deployer.address);

  // Chainlink contract address (ETH/USD), Sepolia
  const priceFeedAddress = process.env.PRICE_FEED_ADDRESS;
  const saleTokenAddress = process.env.SALE_TOKEN_ADDRESS;
  if (!priceFeedAddress || !saleTokenAddress) return;

  // Deploy the Presale contract first to get its address
  const presaleAddress = await deployProxy(
    "Presale",
    [], // Constructor arguments
    [priceFeedAddress] // Initialize arguments
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
  await presaleContract.changePaymentWallet(deployer.address);
  await presaleContract.changeMaxTokensToBuy(15000000000);
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
  const roundStartTime = 1724142297;
  const tokenPerRound = ethers.BigNumber.from("63000000000");

  const roundsAmount = Array(20).fill(tokenPerRound); // 20 rounds
  const roundsPrice = [
    8000000000000000, 8032000000000000, 8064100000000000, 8096400000000000,
    8128800000000000, 8161300000000000, 8193900000000000, 8226600000000000,
    8259400000000000, 8292300000000000, 8325300000000000, 8358400000000000,
    8391600000000000, 8424900000000000, 8458300000000000, 8491800000000000,
    8525400000000000, 8559100000000000, 8592900000000000, 8626800000000000,
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
