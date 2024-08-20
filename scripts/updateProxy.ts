import { ethers } from "hardhat";
import { upgradesProxy } from "./common";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("[Owner account address]: " + owner.address);

  const usdtAddress = process.env.USDT_ADDRESS;
  const presale_address = "0x0C3AdD7ee7367611cc66a0E6813C3A19772406C6";
  // contract upgrade proxy
  const upgraded = await upgradesProxy(presale_address, "Presale");
  await upgraded.setUSDTAddress(usdtAddress);

  console.log("Upgrade Finish");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
