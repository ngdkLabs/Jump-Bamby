import React from 'react';
import { Button } from './button';
import { useWallet } from '@/contexts/WalletContext';

export function ConnectWalletButton() {
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useWallet();

  return (
    <Button
      onClick={isConnected ? disconnectWallet : connectWallet}
      variant="outline"
      className="w-full md:w-auto"
    >
      {isConnected ? (
        <>
          {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
        </>
      ) : (
        "Connect Wallet"
      )}
    </Button>
  );
}
