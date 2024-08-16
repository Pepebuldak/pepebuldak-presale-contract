import { ethers } from "hardhat";
import { deployProxy } from "./common";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("[Deployer account address]: " + deployer.address);

    // Chainlink contract address (ETH/USD), Sepolia
    const priceFeedAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; 
    const saleTokenAddress = "0xabcd";

    // Deploy the Presale contract first to get its address
    const presaleAddress = await deployProxy(
        "Presale",
        [], // Constructor arguments
        [priceFeedAddress] // Initialize arguments 
    );
    console.log(`Presale deployed to: ${presaleAddress}`);

    // Deploy the StakingManager contract with the presale address
    const stakingManagerAddress = await deployProxy(
      "stakingManager",
      [], // Constructor arguments
      [
        saleTokenAddress, // ERC20 token
        presaleAddress, // Use the deployed presale contract address
        60000000000000000000, // 60 reward token per block
        31536000, // 1 year
        22646388, // end block
      ] // Initialize arguments
    );
    console.log(`StakingManager deployed to: ${stakingManagerAddress}`);

    const presaleContract = await ethers.getContractAt("Presale", presaleAddress);
    // set receiver wallet address
    await presaleContract.changePaymentWallet(deployer.address);
    console.log(`Payment wallet set to deployer's address: ${deployer.address}`);
    // Start the claim process in the Presale contract
    const claimStart = 1717589336; // Specific timestamp provided
    const noOfTokens = ethers.BigNumber.from("1600000000000000000000000000"); // Provided token amount

    await presaleContract.startClaim(
        claimStart, // Claim start time
        noOfTokens, // Number of tokens to add to the contract
        saleTokenAddress, // ERC20 token address
        stakingManagerAddress
    );
    console.log(`Claim process started in Presale contract`);

    // Set rounds in the Presale contract
    const rounds0 = [32000000, 64000000, 96000000, 128000000];
    const rounds1 = [8000000000000000, 8032000000000000, 8064100000000000, 8096400000000000];
    const rounds2 = [1719104663, 1719316511, 1719436115, 1719565775];

    await presaleContract.setRounds([rounds0, rounds1, rounds2]);
    console.log(`Rounds data set in Presale contract`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
