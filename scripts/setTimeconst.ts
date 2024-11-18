import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("[Owner account address]: " + owner.address);

  const presaleAddress = "0xa0315Fa13A6346BB724aa9a5642aF72D64f9f0aA";
  const presaleContract = await ethers.getContractAt("Presale", presaleAddress);

  const timeConst = ethers.BigNumber.from("432000"); // 5일 간격
  await presaleContract.setTimeConstant(timeConst);

  console.log("Set Time const");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
