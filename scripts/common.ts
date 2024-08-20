import { ethers, upgrades } from "hardhat";

export const deploy = async (contractName: string, args: unknown[]) => {
  const factory = await ethers.getContractFactory(contractName);
  const contract = await factory.deploy(...args);
  await contract.deployed();
  console.log(`[${contractName} address]: ${contract.address}`);
  return contract.address;
};

export const deployProxy = async (
  contractName: string,
  constructorArgs: unknown[],
  initializeArgs: unknown[],
  initializer = "initialize"
) => {
  const factory = await ethers.getContractFactory(contractName);
  const contract = await upgrades.deployProxy(factory, initializeArgs, {
    unsafeAllow: ["constructor", "state-variable-immutable"],
    constructorArgs: constructorArgs,
    initializer: initializer,
  });
  await contract.deployed();
  console.log(`[${contractName} proxy address]: ${contract.address}`);
  return contract.address;
};

export const upgradesProxy = async (
  proxyAddress: string,
  contractName: string,
  constructorArgs: unknown[]
) => {
  const contractFactory = await ethers.getContractFactory(contractName);
  const contract = await upgrades.upgradeProxy(proxyAddress, contractFactory, {
    unsafeAllow: ["constructor", "state-variable-immutable"],
    constructorArgs: constructorArgs,
  });
  await contract.deployed();
  console.log(`[${contractName} proxy upgraded]: ${contract.address}`);
  return contract.address;
};

// IERC20 interface
export const IERC20_ABI = [
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address recipient, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
];
