import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  publicKey: PublicKey | null;
  connection: Connection;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  wallet: WalletAdapter | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [wallet, setWallet] = useState<WalletAdapter | null>(null);
  
  // Create connection to Solana testnet
  const connection = new Connection(clusterApiUrl('testnet'), 'confirmed');

  const getAvailableWallet = () => {
    // Check for Phantom
    if ((window as any).solana?.isPhantom) {
      return new PhantomWalletAdapter();
    }
    
    // Check for Backpack
    if ((window as any).backpack?.solana) {
      // For Backpack, we'll use a generic approach since it's similar to Phantom
      return (window as any).backpack.solana;
    }
    
    // Check for Solflare
    if ((window as any).solflare?.isSolflare) {
      return (window as any).solflare;
    }
    
    // Default to Phantom adapter (will prompt user to install if not available)
    return new PhantomWalletAdapter();
  };

  const connectWallet = async () => {
    const adapter = getAvailableWallet();
    setWallet(adapter);
    if (adapter.connect) {
      await adapter.connect();
      setIsConnected(true);
      setWalletAddress(adapter.publicKey?.toBase58() || null);
      setPublicKey(adapter.publicKey || null);
    }
  };

  const disconnectWallet = () => {
    if (wallet && wallet.disconnect) {
      wallet.disconnect();
    }
    setIsConnected(false);
    setWalletAddress(null);
    setPublicKey(null);
    setWallet(null);
  };

  useEffect(() => {
    // Auto-connect if wallet is already connected
    const adapter = getAvailableWallet();
    if (adapter && adapter.connected) {
      setIsConnected(true);
      setWalletAddress(adapter.publicKey?.toBase58() || null);
      setPublicKey(adapter.publicKey || null);
      setWallet(adapter);
    }
  }, []);

  return (
    <WalletContext.Provider value={{ isConnected, walletAddress, publicKey, connection, connectWallet, disconnectWallet, wallet }}>
      {children}
    </WalletContext.Provider>
  );
};
