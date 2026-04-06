import { Chain } from 'viem';

export const neroTestnet: Chain = {
  id: 689,
  name: 'NERO Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'NERO',
    symbol: 'NERO',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.nerochain.io'],
    },
    public: {
      http: ['https://rpc-testnet.nerochain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'NeroScan',
      url: 'https://testnet.neroscan.io',
    },
  },
  testnet: true,
};

export const neroMainnet: Chain = {
  id: 1689,
  name: 'NERO Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'NERO',
    symbol: 'NERO',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.nerochain.io'],
    },
    public: {
      http: ['https://rpc.nerochain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'NeroScan',
      url: 'https://neroscan.io',
    },
  },
  testnet: false,
};
