import { ethers, upgrades } from "hardhat";

import { upgradesProxy } from "./common";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("[Owner account address]: " + owner.address);

  const stakingManagerAddress = "0x50eFd1c87Be8F115Bfbe4B54afcBb4185Dc50C79";
  const tokenStaked = ethers.BigNumber.from("1326627616023000000000000000000");

  //If the OpenZeppelin files are lost, uncomment the upgrades.forceImport section and run it first. Then, make changes to the source code to introduce modifications. After that, call upgradesProxy again, and the upgrade should proceed successfully.
  const implementation = await ethers.getContractFactory("stakingManager");
  //await upgrades.forceImport(stakingManagerAddress, implementation);

  await upgrades.validateImplementation(implementation, {
    kind: "transparent",
  });
  console.log("After validation");
  // contract upgrade proxy
  await upgradesProxy(stakingManagerAddress, implementation);
  console.log("Upgrade Finished");

  const stakingContract = await ethers.getContractAt("stakingManager", stakingManagerAddress);
  await stakingContract.setTokensStakedWeighted(tokenStaked);
  await stakingContract.setBoostedRewardMultiplier(3);
  await stakingContract.setTrustedSigner("0xd97603C6771C654DDd9957844CB0040764F1dC97");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
