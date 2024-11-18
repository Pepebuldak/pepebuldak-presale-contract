import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("[Owner account address]: " + owner.address);

  const presaleAddress = "0xa0315Fa13A6346BB724aa9a5642aF72D64f9f0aA";
  const presaleContract = await ethers.getContractAt("Presale", presaleAddress);

  const endTime = 1739864002; // presale 종료시각
  await presaleContract.changeSaleTimes(0, endTime);

  console.log("end Presale");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
