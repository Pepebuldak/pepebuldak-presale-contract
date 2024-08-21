import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("[Owner account address]: " + owner.address);

  const stakingManagerAddress = "0x0ABCD";
  const stakingManagerContract = await ethers.getContractAt(
    "StakingManager",
    stakingManagerAddress
  );
  await stakingManagerContract.setLockedTime(0);
  await stakingManagerContract.setHarvestLock(false);

  console.log("Staking manager unlocked");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
