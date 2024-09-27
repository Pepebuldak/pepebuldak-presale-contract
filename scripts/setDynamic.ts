import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("[Owner account address]: " + owner.address);

  const presaleAddress = "0xa0315Fa13A6346BB724aa9a5642aF72D64f9f0aA";
  const presaleContract = await ethers.getContractAt("Presale", presaleAddress);

  await presaleContract.setDynamicTimeFlag(true);

  console.log("Set dynamic timeflag");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
