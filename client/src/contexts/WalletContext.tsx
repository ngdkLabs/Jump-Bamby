import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
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
  payGameFee: () => Promise<boolean>;
  hasBackpackExtension: boolean;
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
  const [hasBackpackExtension, setHasBackpackExtension] = useState(false);
  
  // Create connection to custom RPC endpoint
  const connection = new Connection('https://rpc.gorbagana.wtf', 'confirmed');

  // Check for Backpack extension
  useEffect(() => {
    const checkBackpackExtension = () => {
      const hasBackpack = !!(window as any).backpack?.solana;
      setHasBackpackExtension(hasBackpack);
      console.log('Backpack extension detected:', hasBackpack);
    };

    checkBackpackExtension();
    
    // Check periodically in case extension loads later
    const interval = setInterval(checkBackpackExtension, 1000);
    setTimeout(() => clearInterval(interval), 10000); // Stop checking after 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const getAvailableWallet = () => {
    // Only use Backpack if extension is detected
    if (hasBackpackExtension && (window as any).backpack?.solana) {
      return new BackpackWalletAdapter();
    }
    
    // For development/demo purposes, create a mock wallet adapter
    if (process.env.NODE_ENV === 'development') {
      return new BackpackWalletAdapter(); // This will fail gracefully and show install prompt
    }
    
    // Return null if no extension detected
    return null;
  };

  const connectWallet = async () => {
    try {
      const adapter = getAvailableWallet();
      
      if (!adapter) {
        throw new Error('No compatible wallet found. Please install Backpack wallet.');
      }
      
      setWallet(adapter);
      
      if (!adapter.connected) {
        await adapter.connect();
      }
      
      if (adapter.publicKey) {
        setIsConnected(true);
        setWalletAddress(adapter.publicKey.toBase58());
        setPublicKey(adapter.publicKey);
        console.log('Wallet connected successfully:', adapter.publicKey.toBase58());
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error; // Re-throw to handle in UI
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

  // Payment function for game fee (0.01 GOR)
  const payGameFee = async (): Promise<boolean> => {
    try {
      if (!wallet || !wallet.publicKey || !wallet.connected) {
        throw new Error('Wallet not connected');
      }

      const feeAmount = 0.01 * LAMPORTS_PER_SOL; // 0.01 GOR in lamports
      const feeRecipient = new PublicKey('GorbyFeesWallet1111111111111111111111111111'); // Replace with actual fee wallet

      // Create transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: feeRecipient,
          lamports: feeAmount,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Send transaction using wallet adapter
      const signature = await wallet.sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('Game fee payment successful:', signature);
      return true;
    } catch (error) {
      console.error('Failed to pay game fee:', error);
      return false;
    }
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
      wallet,
      payGameFee,
      hasBackpackExtension
    }}>
      {children}
    </WalletContext.Provider>
  );
};