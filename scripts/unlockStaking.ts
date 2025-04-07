import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("[Owner account address]: " + owner.address);

  const stakingManagerAddress = "0x50eFd1c87Be8F115Bfbe4B54afcBb4185Dc50C79";
  const stakingManagerContract = await ethers.getContractAt(
    "stakingManager",
    stakingManagerAddress
  );
  await stakingManagerContract.setLockedTime(3600); // 1hour
  await stakingManagerContract.setHarvestLock(false);

  console.log("Staking manager unlocked");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
