import { ethers, upgrades } from "hardhat";

export const deploy = async (contractName: string, args: unknown[]) => {
  const factory = await ethers.getContractFactory(contractName);
  const contract = await factory.deploy(...args);
  await contract.deployed();
  console.log(`[${contractName} address]: ${contract.address}`);
  return contract.address;
};

export const deployProxy = async (contractName: string, constructorArgs: unknown[], initializeArgs: unknown[]) => {
  const factory = await ethers.getContractFactory(contractName);
  const contract = await upgrades.deployProxy(factory, initializeArgs, {
    unsafeAllow: ["constructor", "state-variable-immutable"],
    constructorArgs: constructorArgs
  });
  await contract.deployed();
  console.log(`[${contractName} proxy address]: ${contract.address}`);
  return contract.address;
};

export const upgradesProxy = async (
  proxyAddress: string,
  contractName: string,
  constructorArgs: unknown[],
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