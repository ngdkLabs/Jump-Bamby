import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad, Trophy, Coins, Star, Gift, Timer, X, Volume2, VolumeX, Loader2 } from 'lucide-react';
// Mock Solana constants temporarily
const LAMPORTS_PER_SOL = 1000000000;
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { walletAddress, disconnectWallet, connection, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'game' | 'leaderboard'>('game');
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [loadingTasks, setLoadingTasks] = useState<{ [key: number]: boolean }>({});
  const navigate = useNavigate();

  // Fetch SOL balance
  useEffect(() => {
    if (publicKey) {
      // Mock balance for now
      setSolBalance(0.5);
    }
  }, [publicKey]);

  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
    console.log('Sound toggled:', !isSoundOn ? 'ON' : 'OFF');
  };

  const leaderboardData = [
    { rank: 1, name: 'CryptoKing', score: 15420, reward: '500 GORBY' },
    { rank: 2, name: 'BlockMaster', score: 14890, reward: '300 GORBY' },
    { rank: 3, name: 'SolanaFan', score: 13750, reward: '200 GORBY' },
    { rank: 4, name: 'GameProX', score: 12100, reward: '100 GORBY' },
    { rank: 5, name: 'PixelHero', score: 11550, reward: '50 GORBY' },
  ];

  const tasks = [
    {
      title: 'Follow Twitter',
      reward: '+1000',
      status: 'available',
      icon: '🐦',
      description: 'Follow our official Twitter account',
      link: 'https://twitter.com/intent/follow?screen_name=GORBY_JUMP'
    },
    {
      title: 'Retweet',
      reward: '+500',
      status: 'available',
      icon: '🔄',
      description: 'Retweet our latest announcement',
      link: 'https://twitter.com/intent/retweet?tweet_id=YOUR_TWEET_ID'
    },
    {
      title: 'Join Discord',
      reward: '+2000',
      status: 'completed',
      icon: '💬',
      description: 'Join our Discord community',
      link: 'https://discord.gg/GORBY-JUMP'
    },
    {
      title: 'Daily Login',
      reward: '+250',
      status: 'available',
      icon: '📅',
      description: 'Login daily to earn bonus GORBY',
      link: null
    },
    {
      title: 'Share Game',
      reward: '+750',
      status: 'available',
      icon: '📤',
      description: 'Share the game with friends',
      link: 'https://twitter.com/intent/tweet?text=Playing%20GORBY%20Jump%20and%20earning%20%24GORBY!%20Join%20me%20in%20this%20amazing%20game!&url=YOUR_GAME_URL'
    }
  ];

  const handleStartGame = () => {
    navigate('/game');
  };

  const handleTaskClick = async (taskIndex: number, link: string | null) => {
    if (!link) {
      // Handle daily login or other tasks without external links
      console.log('Task completed:', tasks[taskIndex].title);
      return;
    }

    setLoadingTasks(prev => ({ ...prev, [taskIndex]: true }));
    
    try {
      // Open the link in a new tab
      window.open(link, '_blank');
      
      // Simulate task completion after 3 seconds
      setTimeout(() => {
        setLoadingTasks(prev => ({ ...prev, [taskIndex]: false }));
        console.log('Task completed:', tasks[taskIndex].title);
      }, 3000);
    } catch (error) {
      console.error('Error opening task link:', error);
      setLoadingTasks(prev => ({ ...prev, [taskIndex]: false }));
    }
  };

  return (
    <div className="game-background min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/90 shadow-xl rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Coins className="text-yellow-500" size={24} />
            <span className="font-semibold">{solBalance.toFixed(3)} SOL</span>
            <Badge variant="secondary" className="ml-2">{walletAddress ? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4) : 'No Wallet'}</Badge>
            {walletAddress && (
              <Button size="sm" variant="outline" className="ml-2" onClick={disconnectWallet}>Disconnect</Button>
            )}
          </div>
          <Button size="icon" variant="ghost" onClick={toggleSound} aria-label="Toggle Sound">
            {isSoundOn ? <Volume2 className="text-green-500" /> : <VolumeX className="text-gray-400" />}
          </Button>
        </div>
        <div className="flex gap-2 mb-6">
          <Button variant={activeTab === 'game' ? 'default' : 'outline'} onClick={() => setActiveTab('game')}>
            <Gamepad className="mr-2" size={18} /> Game
          </Button>
          <Button variant={activeTab === 'leaderboard' ? 'default' : 'outline'} onClick={() => setActiveTab('leaderboard')}>
            <Trophy className="mr-2" size={18} /> Leaderboard
          </Button>
        </div>
        {activeTab === 'game' ? (
          <div className="flex flex-col gap-6">
            <Button size="lg" className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xl font-bold shadow-lg" onClick={handleStartGame}>
              <Gamepad className="mr-2" size={24} /> Start GORBY Jump
            </Button>
            <div>
              <h3 className="font-semibold mb-2 flex items-center"><Gift className="mr-2 text-pink-500" /> Daily & Social Tasks</h3>
              <div className="grid gap-3">
                {tasks.map((task, idx) => (
                  <Card key={task.title} className="flex items-center justify-between p-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{task.icon}</span>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs text-gray-500">{task.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>{task.reward}</Badge>
                      {task.status === 'completed' ? (
                        <Badge variant="default">Done</Badge>
                      ) : (
                        <Button size="sm" disabled={loadingTasks[idx]} onClick={() => handleTaskClick(idx, task.link)}>
                          {loadingTasks[idx] ? <Loader2 className="animate-spin" size={16} /> : 'Claim'}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold mb-4 flex items-center"><Trophy className="mr-2 text-yellow-500" /> Leaderboard</h3>
            <div className="grid gap-2">
              {leaderboardData.map((entry) => (
                <Card key={entry.rank} className="flex items-center justify-between p-3 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">#{entry.rank}</Badge>
                    <span className="font-medium">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400" size={18} />
                    <span className="font-bold">{entry.score}</span>
                    <Badge variant="default">{entry.reward}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Home;
