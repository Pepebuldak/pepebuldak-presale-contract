import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("[Owner account address]: " + owner.address);

  const presaleAddress = "0xa0315Fa13A6346BB724aa9a5642aF72D64f9f0aA";
  const presaleContract = await ethers.getContractAt("Presale", presaleAddress);

  // 이미 지나간 0~3번째의 구체적인 타임스탬프
  const specificTimestamps = [
    1725174776, // 0번째 인덱스
    1725779576, // 1번째 인덱스
    1726384376, // 2번째 인덱스
    1726989176, // 3번째 인덱스
  ];

  const roundStartTime = 1727421176; // 4번째 인덱스의 시작 시점

  const roundsAmount = [
    ethers.BigNumber.from("2100000000000"), // 1st round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 2nd round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 3rd round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 4th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 5th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 6th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 7th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 8th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 9th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 10th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 11th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 12th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 13th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 14th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 15th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 16th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 17th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 18th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 19th round: 2.1 trillion
    ethers.BigNumber.from("2100000000000"), // 20th round: 2.1 trillion
  ];

  const roundsPrice = [
    800000000000, 880000000000, 968000000000, 1064800000000, 1171280000000,
    1288408000000, 1417248800000, 1558973680000, 1714871048000, 1886358152800,
    2074993968080, 2282493364888, 2510742701376, 2761816971514, 3037998668666,
    3341798535532, 3675978389085, 4043576227994, 4447933850793, 4892727235872,
  ];

  // 5일(432000초) term을 적용
  const roundsEndTS = [];

  // 0~3번째 인덱스는 구체적인 타임스탬프 사용
  for (let i = 0; i < 4; i++) {
    roundsEndTS.push(specificTimestamps[i]);
  }

  // 4번째 인덱스부터 5일씩 추가 (432000초 단위)
  for (let i = 4; i < 20; i++) {
    roundsEndTS.push(roundStartTime + (i - 4) * 432000); // 4번째 인덱스부터 시작
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
