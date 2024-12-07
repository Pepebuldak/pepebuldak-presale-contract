import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("[Owner account address]: " + owner.address);

  const presaleAddress = "0xa0315Fa13A6346BB724aa9a5642aF72D64f9f0aA";
  const presaleContract = await ethers.getContractAt("Presale", presaleAddress);
  
  //const checkPoint = 1150000000001;
  //const currentStep = 20;
  //await presaleContract.setCurrentStep(currentStep, checkPoint);


  // 이미 지나간 0~3번째의 구체적인 타임스탬프
  const specificTimestamps = [
    1725174776, // 0번째 인덱스
    1725779576, // 1번째 인덱스
    1726384376, // 2번째 인덱스
    1726989176, // 3번째 인덱스
  ];

  const roundStartTime = 1727421176; // 4번째 인덱스의 시작 시점

  const roundsAmount = [
    ethers.BigNumber.from("105000000000"),
    ethers.BigNumber.from("160000000000"),
    ethers.BigNumber.from("215000000000"),
    ethers.BigNumber.from("270000000000"),
    ethers.BigNumber.from("325000000000"),
    ethers.BigNumber.from("380000000000"),
    ethers.BigNumber.from("435000000000"),
    ethers.BigNumber.from("490000000000"),
    ethers.BigNumber.from("545000000000"),
    ethers.BigNumber.from("600000000000"),
    ethers.BigNumber.from("655000000000"),
    ethers.BigNumber.from("710000000000"),
    ethers.BigNumber.from("765000000000"),
    ethers.BigNumber.from("820000000000"),
    ethers.BigNumber.from("875000000000"),
    ethers.BigNumber.from("930000000000"),
    ethers.BigNumber.from("985000000000"),
    ethers.BigNumber.from("1040000000000"),
    ethers.BigNumber.from("1095000000000"),
    ethers.BigNumber.from("1150000000000"),
    ethers.BigNumber.from("1181666666666"),
    ethers.BigNumber.from("1213333333332"),
    ethers.BigNumber.from("1244999999998"),
    ethers.BigNumber.from("1276666666664"),
    ethers.BigNumber.from("1308333333330"),
    ethers.BigNumber.from("1339999999996"),
    ethers.BigNumber.from("1371666666662"),
    ethers.BigNumber.from("1403333333328"),
    ethers.BigNumber.from("1434999999994"),
    ethers.BigNumber.from("1466666666660"),
    ethers.BigNumber.from("1498333333326"),
    ethers.BigNumber.from("1529999999992"),
    ethers.BigNumber.from("1561666666658"),
    ethers.BigNumber.from("1593333333324"),
    ethers.BigNumber.from("1624999999990"),
    ethers.BigNumber.from("1656666666656"),
    ethers.BigNumber.from("1688333333322"),
    ethers.BigNumber.from("1719999999988"),
    ethers.BigNumber.from("1751666666654"),
    ethers.BigNumber.from("1783333333320"),
    ethers.BigNumber.from("1814999999986"),
    ethers.BigNumber.from("1846666666652"),
    ethers.BigNumber.from("1878333333318"),
    ethers.BigNumber.from("1909999999984"),
    ethers.BigNumber.from("1941666666650"),
    ethers.BigNumber.from("1973333333316"),
    ethers.BigNumber.from("2004999999982"),
    ethers.BigNumber.from("2036666666648"),
    ethers.BigNumber.from("2068333333314"),
    ethers.BigNumber.from("2100000000000")
  ];

  const roundsPrice = [
    800000000000, 880000000000, 968000000000, 1064800000000, 1171280000000,
    1288408000000, 1417248800000, 1558973680000, 1714871048000, 1886358152800,
    2074993968080, 2282493364888, 2510742701376, 2761816971514, 3037998668666,
    3341798535532, 3675978389085, 4043576227994, 4447933850793, 4892727235872,
    5381999959459, 5920199955404, 6512219950944, 7163441946038, 7879786140641,
    8667764754705, 9534541230175, 10487995353192, 11536794888511, 12690474377362,
    13959521815098, 15355473996607, 16891021396267, 18580123535893, 20438135889482,
    22481949478430, 24730144426273, 27203158868900, 29923474755790, 32915822231369,
    36207404454505, 39828144899955, 43810959389950, 48192055328945, 53011260861839,
    58312386948022, 64143625642824, 70557988207106, 77613787027816, 85375165730597
  ];

  // 5일(432000초) term을 적용
  const roundsEndTS = [];

  // 0~3번째 인덱스는 구체적인 타임스탬프 사용
  for (let i = 0; i < 4; i++) {
    roundsEndTS.push(specificTimestamps[i]);
  }

  // 4번째 인덱스부터 5일씩 추가 (432000초 단위)
  for (let i = 4; i < 50; i++) {
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
