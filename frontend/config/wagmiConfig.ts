import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { neroTestnet } from './chains';

export const wagmiConfig = createConfig({
  chains: [neroTestnet],
  
  connectors: [
    injected(),
  ],

  transports: {
    [neroTestnet.id]: http('https://rpc-testnet.nerochain.io', {
      timeout: 30_000,
      retryCount: 3,
      retryDelay: 1_000,
    }),
  },
});
