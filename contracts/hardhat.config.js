require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    neroTestnet: {
      url: "https://rpc-testnet.nerochain.io",
      chainId: 689,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    neroMainnet: {
      url: "https://rpc.nerochain.io",
      chainId: 1689,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      neroTestnet: "dummy",
      neroMainnet: "dummy",
    },
    customChains: [
      {
        network: "neroTestnet",
        chainId: 689,
        urls: {
          apiURL: "https://api-testnet.neroscan.io/api",
          browserURL: "https://testnet.neroscan.io",
        },
      },
      {
        network: "neroMainnet",
        chainId: 1689,
        urls: {
          apiURL: "https://api.neroscan.io/api",
          browserURL: "https://neroscan.io",
        },
      },
    ],
  },
};
