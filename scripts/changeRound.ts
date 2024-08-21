import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("[Owner account address]: " + owner.address);

  const presaleAddress = "0x0C3AdD7ee7367611cc66a0E6813C3A19772406C6";
  const presaleContract = await ethers.getContractAt("Presale", presaleAddress);
  const roundStartTime = 1724142297;
  const roundsAmount = [
    ethers.BigNumber.from("105000000000"), // 1st round: 105 billion
    ethers.BigNumber.from("210000000000"),
    ethers.BigNumber.from("315000000000"),
    ethers.BigNumber.from("420000000000"),
    ethers.BigNumber.from("525000000000"),
    ethers.BigNumber.from("630000000000"),
    ethers.BigNumber.from("735000000000"),
    ethers.BigNumber.from("840000000000"),
    ethers.BigNumber.from("945000000000"),
    ethers.BigNumber.from("1050000000000"),
    ethers.BigNumber.from("1155000000000"),
    ethers.BigNumber.from("1260000000000"),
    ethers.BigNumber.from("1365000000000"),
    ethers.BigNumber.from("1470000000000"),
    ethers.BigNumber.from("1575000000000"),
    ethers.BigNumber.from("1680000000000"),
    ethers.BigNumber.from("1785000000000"),
    ethers.BigNumber.from("1890000000000"),
    ethers.BigNumber.from("1995000000000"),
    ethers.BigNumber.from("2100000000000"), // 20th round: 2.1 trillion
  ];
  const roundsPrice = [
    800000000000, 880000000000, 968000000000, 1064800000000, 1171280000000,
    1288408000000, 1417248800000, 1558973680000, 1714871048000, 1886358152800,
    2074993968080, 2282493364888, 2510742701376, 2761816971514, 3037998668666,
    3341798535532, 3675978389085, 4043576227994, 4447933850793, 4892727235872,
  ];

  // 7 days(604800s) terms
  const roundsEndTS = [];
  for (let i = 0; i < 20; i++) {
    roundsEndTS.push(roundStartTime + (i + 1) * 604800);
  }

  await presaleContract.changeRoundsData([
    roundsAmount,
    roundsPrice,
    roundsEndTS,
  ]);

  console.log("Upgrade Finish");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
