import { ethers } from "hardhat";
import { upgradesProxy } from "./common";

const royalty_address = "0x0000";

async function main() {
  // need .openzepplin files
  const [owner] = await ethers.getSigners();
  console.log("[Owner account address]: " + owner.address);

  const presale_address = "0xABCD";

  // contract upgrade proxy 
  await upgradesProxy(presale_address, "Presale", [royalty_address])
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });