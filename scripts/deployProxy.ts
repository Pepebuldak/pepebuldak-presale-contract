import { ethers } from "hardhat";
import { deploy } from "./common";


async function main() {
  const [owner] = await ethers.getSigners();
  console.log("[Owner account address]: " + owner.address);

  const address = await deploy("Presale", ["900000000000000000000000000000"]); 
  console.log(`NEXT_PUBLIC_CONTRACT_PRESALE=${address}`);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });