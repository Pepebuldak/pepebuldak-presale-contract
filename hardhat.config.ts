import "hardhat-exposed";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "solidity-coverage";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-preprocessor";
import "hardhat-tracer";
import "hardhat-storage-layout";
import "hardhat-exposed";
import "hardhat-gas-reporter";
import "@primitivefi/hardhat-dodoc";

import { HardhatUserConfig } from "hardhat/types";

require('dotenv').config()

const { ETHEREUM_NODE_PROVIDER, PRIVATE_KEY, ETHERSCAN_API } = process.env;

if (!PRIVATE_KEY || !ETHEREUM_NODE_PROVIDER) {
  console.error("Environment not set");
  process.exit(1)
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1337,
      },
    },
  },
  networks: {
    ganache: {
      url: "http://0.0.0.0:8545",
      accounts: [PRIVATE_KEY],
    },
    ethereum: {
      url: ETHEREUM_NODE_PROVIDER,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API
  },
};

export default config;
