require("@nomicfoundation/hardhat-toolbox");
const config = require("./config.json");
require('dotenv').config();

// Config from environment
const mnemonicPhrase = process.env.MNEMONIC;
const privateKey = process.env.PRIVATE_KEY;
const mnemonicPassword = process.env.MNEMONIC_PASSWORD;

const accounts = privateKey.length > 0 ? [privateKey] : {
  mnemonic: mnemonicPhrase,
  path: 'm/44\'/60\'/0\'/0',
  initialIndex: 0,
  count: 1,
  passphrase: mnemonicPassword,
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
      // {
      //   version: '0.8.17',
      //   settings: {
      //     viaIR: true,
      //     optimizer: {
      //       enabled: true,
      //       runs: 1000000,
      //       details: {
      //         yulDetails: {
      //           optimizerSteps: "u",
      //         },
      //       },
      //     },
      //   },
      // },
    ]
  },
  defaultNetwork: "base",
  networks: {
    baseSepolia: {
      url: config.RPC_BASE_SEPOLIA,
      accounts,
      // gasPrice: 100000000,
    },
    base: {
      url: config.RPC_BASE,
      accounts,
      // gasPrice: 1500000000,
    },
    sepolia: {
      url: config.RPC_ETH_SEPOLIA,
      accounts,
      gasPrice: 30_000_000_000, // 30 Gwei
    },
    mainnet: {
      url: config.RPC_ETH,
      accounts,
      gasPrice: 8_000_000_000, // 10 Gwei
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 0,
  },
  etherscan: {
    apiKey: {
      baseSepolia: "TZHMRZR2UHN9HGGX8RWT5VFGKNU9GRIMVJ",
      base: "TZHMRZR2UHN9HGGX8RWT5VFGKNU9GRIMVJ",
      sepolia: "3TEWVV2EK19S1Y6SV8EECZAGQ7W3362RCN",
      mainnet: "3TEWVV2EK19S1Y6SV8EECZAGQ7W3362RCN",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/"
        }
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org/"
        }
      },
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io/"
        }
      },
      {
        network: "mainnet",
        chainId: 1,
        urls: {
          apiURL: "https://api.etherscan.io/api",
          browserURL: "https://etherscan.io/"
        }
      },
    ]
  },
};
