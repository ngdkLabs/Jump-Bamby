import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { MainMenu } from '@/components/game/MainMenu';

const Index = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();

  useEffect(() => {
    if (isConnected) {
      navigate('/home');
    }
  }, [isConnected, navigate]);

  return <MainMenu onNavigate={navigate} />;
};

export default Index;
