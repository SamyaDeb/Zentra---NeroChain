'use client';

import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';

export function ConnectButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  const isLoading = isConnecting || isPending;

  if (isConnected && address) {
    const isCorrectNetwork = chainId === 689;
    
    return (
      <button
        onClick={() => disconnect()}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition"
      >
        Disconnect
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="bg-white hover:bg-white/90 text-celo-dark font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
    >
      {isLoading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
