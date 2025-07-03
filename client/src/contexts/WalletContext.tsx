import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';

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
  
  // Create connection to custom RPC endpoint
  const connection = new Connection('https://rpc.gorbagana.wtf', 'confirmed');

  const getAvailableWallet = () => {
    // Prioritize Backpack wallet
    if ((window as any).backpack?.solana) {
      return new BackpackWalletAdapter();
    }
    
    // Fallback to Backpack adapter if extension not detected
    return new BackpackWalletAdapter();
  };

  const connectWallet = async () => {
    try {
      const adapter = getAvailableWallet();
      setWallet(adapter);
      
      if (!adapter.connected) {
        await adapter.connect();
      }
      
      if (adapter.publicKey) {
        setIsConnected(true);
        setWalletAddress(adapter.publicKey.toBase58());
        setPublicKey(adapter.publicKey);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // Don't throw error, just log it
    }
  };

  const disconnectWallet = async () => {
    try {
      if (wallet && wallet.connected) {
        await wallet.disconnect();
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
    
    setIsConnected(false);
    setWalletAddress(null);
    setPublicKey(null);
    setWallet(null);
  };

  useEffect(() => {
    // Auto-connect if wallet is already connected
    const adapter = getAvailableWallet();
    if (adapter && adapter.connected && adapter.publicKey) {
      setIsConnected(true);
      setWalletAddress(adapter.publicKey.toBase58());
      setPublicKey(adapter.publicKey);
      setWallet(adapter);
    }
  }, []);

  return (
    <WalletContext.Provider value={{ 
      isConnected, 
      walletAddress, 
      publicKey, 
      connection, 
      connectWallet, 
      disconnectWallet, 
      wallet 
    }}>
      {children}
    </WalletContext.Provider>
  );
};