import { ethers, upgrades } from "hardhat";
import { upgradesProxy } from "./common";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("[Owner account address]: " + owner.address);

  const presaleAddress = "0xa0315Fa13A6346BB724aa9a5642aF72D64f9f0aA";

  //If the OpenZeppelin files are lost, uncomment the upgrades.forceImport section and run it first. Then, make changes to the source code to introduce modifications. After that, call upgradesProxy again, and the upgrade should proceed successfully.
  /*
  const implementation = await ethers.getContractFactory("Presale");
  await upgrades.forceImport(presaleAddress, implementation);
  */

  // contract upgrade proxy
  const upgraded = await upgradesProxy(presaleAddress, "Presale");
  console.log("Upgrade Finish");
  const result = await upgraded.roundDetails(0);
  console.log("Upgrade result: " + result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
