import 'dotenv/config';
import 'hardhat-deploy';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'hardhat-abi-exporter';

require('dotenv');

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // You can adjust this value as needed
      },
    },
  },
  paths: {
    deploy: './deploy',
    sources: './src',
  },
  namedAccounts: {
    deployer: { default: 0 },
    admin: { default: 0 },
    second: { default: 1 },
    random: { default: 8 },
    owner: { default: 1 },
  },
  abiExporter: {
    runOnCompile: true,
    path: '../frontend/src/abis',
    clear: true,
    flat: true,
    only: [],
    pretty: true,
  },
  typechain: {
    outDir: '../typechain',
  },
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: [
        {
          privateKey: process.env.DEPLOYER_PRIVATE_KEY || '0x06613f23520e7515dc99ff241d672cf61e90431863a1f1aa654cd7a85d15f4c8',
          balance: '1000000000000000000000',
        },
        {
          privateKey: process.env.OWNER_PRIVATE_KEY || '0x06613f23520e7515dc99ff241d672cf61e90431863a1f1aa654cd7a85d15f4c8',
          balance: '1000000000000000000000',
        },
      ],
    },
  },
};

export default config;
