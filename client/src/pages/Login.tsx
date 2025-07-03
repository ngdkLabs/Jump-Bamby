import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { MainMenu } from '@/components/game/MainMenu';

const Login = () => {
  const navigate = useNavigate();
  const { connectWallet } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
      navigate('/home');
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return <MainMenu onNavigate={navigate} />;
};

export default Login;
