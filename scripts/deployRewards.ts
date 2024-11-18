import { ethers } from "hardhat";
import { deployProxy } from "./common";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("[Referral Deployer account address]: " + deployer.address);

  const CReferralPercent = 15;
  const usdtAddress = process.env.USDT_ADDRESS;
  const presaleAddress = "0xa0315Fa13A6346BB724aa9a5642aF72D64f9f0aA";
  if (!usdtAddress) return;

  // Deploy the Presale contract first to get its address
  const referralAddress = await deployProxy(
    "ReferralRewards",
    [], // Constructor arguments
    [presaleAddress, usdtAddress] // Initialize arguments
  );
  console.log(`Referral deployed to: ${referralAddress}`);

  const presaleContract = await ethers.getContractAt("Presale", presaleAddress);
  // set receiver wallet address and max tokens to buy
  await presaleContract.setReferralRewardsContract(referralAddress);
  await presaleContract.setReferralRewardPercentage(CReferralPercent);

  console.log(`NEXT_PUBLIC_REFERRAL_REWARDS_CONTRACT=${referralAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
