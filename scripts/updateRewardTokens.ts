import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("[Owner account address]: " + owner.address);

  const stakingManagerAddress = "0x50eFd1c87Be8F115Bfbe4B54afcBb4185Dc50C79";
  const stakingManagerContract = await ethers.getContractAt(
    "stakingManager",
    stakingManagerAddress
  );
  const rewardTokensPerBlock = ethers.BigNumber.from(
    "1000000000000000000000000"
  ); // 1,000,000 token
  await stakingManagerContract.setRewardTokensPerBlock(rewardTokensPerBlock);

  console.log("Staking manager reward updated");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
