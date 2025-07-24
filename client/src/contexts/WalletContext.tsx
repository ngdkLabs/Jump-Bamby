declare global {
  interface Window {
    ethereum: any;
  }
}

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  balance: string;
  chainId?: number;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  payGameFee: () => Promise<boolean>;
  switchNetwork: () => Promise<void>;
  provider?: ethers.providers.Web3Provider;
  signer?: ethers.Signer;
  isCorrectNetwork: boolean;
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
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState<number>();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<ethers.Signer>();

  const { login, ready, authenticated, logout } = usePrivy();
  const { wallets } = useWallets();

  const REQUIRED_CHAIN_ID = 50312; // Somnia Testnet

  // Privy JWKS URL for authentication
  const PRIVY_JWKS_URL = 'https://auth.privy.io/api/v1/apps/cmdh784uo003yl20nzzoa9doo/jwks.json';

  const connectWallet = async () => {
    try {
      if (!ready) {
        console.warn('Waiting for Privy to initialize...');
        return;
      }

      if (!authenticated) {
        console.log('Initiating Privy login...');
        try {
          await login();
          // Return early after login to let the useEffect handle the connection
          return;
        } catch (loginError) {
          console.error('Privy login failed:', loginError);
          throw new Error('Failed to authenticate with Privy. Please try again.');
        }
      }

      if (!wallets || wallets.length === 0) {
        console.error('No wallets available after authentication');
        throw new Error('Please connect a wallet using the Privy modal');
      }

      const wallet = wallets[0]; // Get the first wallet
      // Get the provider and signer using Privy's built-in methods
      const provider = await wallet.getEthersProvider();
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setWalletAddress(address);
      setChainId(network.chainId);
      setIsCorrectNetwork(network.chainId === REQUIRED_CHAIN_ID);
      setIsConnected(true);

      // Get initial balance and format it properly
      const balance = await provider.getBalance(address);
      const formattedBalance = balance.toString() === "0" ? "0" : ethers.utils.formatEther(balance);
      setBalance(formattedBalance);
      
      // Setup provider listeners
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('network', handleChainChanged);

    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      const wallet = wallets[0];
      if (wallet) {
        await wallet.disconnect();
      }
      
      // Remove listeners if provider exists
      if (provider) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('network', handleChainChanged);
      }

      // Reset all states
      setIsConnected(false);
      setWalletAddress(null);
      setBalance('0');
      setProvider(undefined);
      setSigner(undefined);
      setChainId(undefined);
      setIsCorrectNetwork(false);

      // Logout from Privy to clear authentication state
      await logout();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setWalletAddress(accounts[0]);
      if (provider) {
        const balance = await provider.getBalance(accounts[0]);
        const formattedBalance = balance.toString() === "0" ? "0" : ethers.utils.formatEther(balance);
        setBalance(formattedBalance);
      }
    }
  };

  const handleChainChanged = async () => {
    if (provider) {
      const network = await provider.getNetwork();
      setChainId(network.chainId);
      setIsCorrectNetwork(network.chainId === REQUIRED_CHAIN_ID);
    }
  };

  const switchNetwork = async () => {
    if (!provider) return;

    try {
      await provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${REQUIRED_CHAIN_ID.toString(16)}` }
      ]);
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to the wallet
      if (switchError.code === 4902) {
        try {
          await provider.send('wallet_addEthereumChain', [{
            chainId: `0x${REQUIRED_CHAIN_ID.toString(16)}`,
            chainName: 'Somnia Testnet',
            nativeCurrency: {
              name: 'STT',
              symbol: 'STT',
              decimals: 18
            },
            rpcUrls: ['https://dream-rpc.somnia.network']
          }]);
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      }
      console.error('Error switching network:', switchError);
    }
  };

  // Payment function for game fee (0.01 STT)
  const payGameFee = async (): Promise<boolean> => {
    if (!signer || !walletAddress) return false;

    try {
      // Game fee in STT (0.01 STT)
      const gameFee = ethers.utils.parseEther('0.01');
      
      // Create transaction
      const tx = await signer.sendTransaction({
        to: "YOUR_GAME_TREASURY_ADDRESS", // Replace with your game's treasury address
        value: gameFee,
      });

      // Wait for transaction confirmation
      await tx.wait();
      
      // Update balance after payment
      if (provider && walletAddress) {
        const newBalance = await provider.getBalance(walletAddress);
        const formattedBalance = newBalance.toString() === "0" ? "0" : ethers.utils.formatEther(newBalance);
        setBalance(formattedBalance);
      }

      return true;
    } catch (error) {
      console.error('Payment failed:', error);
      return false;
    }
  };

  useEffect(() => {
    // Auto-connect when authenticated and wallets are available
    if (authenticated && wallets.length > 0) {
      connectWallet().catch(console.error);
    }
  }, [authenticated, wallets]);

  return (
    <WalletContext.Provider value={{ 
      isConnected, 
      walletAddress, 
      balance,
      chainId,
      connectWallet, 
      disconnectWallet, 
      payGameFee,
      provider,
      signer,
      switchNetwork,
      isCorrectNetwork
    }}>
      {children}
    </WalletContext.Provider>
  );
};