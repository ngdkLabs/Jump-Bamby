import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Mock types to replace Solana dependencies temporarily
interface MockPublicKey {
  toString(): string;
}

interface MockConnection {
  rpcEndpoint: string;
}

interface MockWalletAdapter {
  name: string;
  connected: boolean;
}

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  publicKey: MockPublicKey | null;
  connection: MockConnection;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  wallet: MockWalletAdapter | null;
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
  const [publicKey, setPublicKey] = useState<MockPublicKey | null>(null);
  const [wallet, setWallet] = useState<MockWalletAdapter | null>(null);
  
  // Create mock connection
  const connection: MockConnection = {
    rpcEndpoint: 'https://api.testnet.solana.com'
  };

  const connectWallet = async () => {
    // Mock wallet connection
    const mockWallet: MockWalletAdapter = {
      name: 'Mock Wallet',
      connected: true
    };
    
    const mockPublicKey: MockPublicKey = {
      toString: () => '11111111111111111111111111111111'
    };
    
    setWallet(mockWallet);
    setIsConnected(true);
    setWalletAddress(mockPublicKey.toString());
    setPublicKey(mockPublicKey);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setPublicKey(null);
    setWallet(null);
  };

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