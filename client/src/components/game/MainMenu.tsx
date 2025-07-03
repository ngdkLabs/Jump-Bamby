import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/lib/stores/useGameStore';
import { useAudio } from '@/lib/stores/useAudio';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad, Trophy, Coins, Gift, X, Volume2, VolumeX, Loader2 } from 'lucide-react';
// Mock Solana constants temporarily
const LAMPORTS_PER_SOL = 1000000000;

const GORCHAIN_RPC = 'https://gorchain.wstf.io';

export function MainMenu({ onNavigate }: { onNavigate?: (route: string) => void } = {}) {
  const { startGame, highScore } = useGameStore();
  const { toggleMute, isMuted, restartBackgroundMusic } = useAudio();
  const { isConnected, walletAddress, connectWallet, disconnectWallet, publicKey } = useWallet();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'game' | 'leaderboard'>('game');
  const [solBalance, setSolBalance] = useState<number>(0);
  const [gorbyBalance, setGorbyBalance] = useState(0);
  const [gorbyEarned, setGorbyEarned] = useState(0);
  const [loadingTasks, setLoadingTasks] = useState<{ [key: number]: boolean }>({});
  const [tasks, setTasks] = useState([
    {
      title: 'Follow Twitter',
      reward: '+1000',
      status: 'available',
      icon: '🐦',
      description: 'Follow our official Twitter account',
      link: 'https://twitter.com/intent/follow?screen_name=JumpGorby'
    },
    {
      title: 'Follow Gorbaganachain',
      reward: '+800',
      status: 'available',
      icon: '🐲',
      description: 'Follow Gorbaganachain on Twitter',
      link: 'https://twitter.com/intent/follow?screen_name=Gorbaganachain'
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
      status: 'available',
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
  ]);
  const [isPlayHover, setIsPlayHover] = useState(false);

  // Mock balance fetching
  useEffect(() => {
    if (publicKey) {
      // Mock balance for now
      setSolBalance(0.5);
    }
  }, [publicKey]);

  // Simulate fetch GORBY balance
  useEffect(() => {
    setGorbyBalance(12345);
    setGorbyEarned(6789);
  }, []);

  const handleStartGame = () => {
    restartBackgroundMusic();
    startGame();
  };

  const handleTaskClick = async (taskIndex: number, link: string | null) => {
    if (!link) {
      setTasks(prev => prev.map((task, idx) => idx === taskIndex ? { ...task, status: 'completed' } : task));
      return;
    }
    setLoadingTasks(prev => ({ ...prev, [taskIndex]: true }));
    try {
      window.open(link, '_blank');
      setTimeout(() => {
        setLoadingTasks(prev => ({ ...prev, [taskIndex]: false }));
        setTasks(prev => prev.map((task, idx) => idx === taskIndex ? { ...task, status: 'completed' } : task));
      }, 3000);
    } catch (error) {
      setLoadingTasks(prev => ({ ...prev, [taskIndex]: false }));
    }
  };

  const handleWalletConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
      toast({
        title: 'Wallet Connected!',
        description: 'Successfully connected to Solana Testnet',
      });
      if (onNavigate) onNavigate('/home');
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: 'Disconnected',
      description: 'Wallet disconnected.',
    });
    if (onNavigate) onNavigate('/login');
  };

  const getAvailableWallets = () => {
    const wallets = [];
    if ((window as any).backpack?.solana) {
      wallets.push({ name: 'Backpack', icon: '🎒' });
    }
    return wallets;
  };
  const availableWallets = getAvailableWallets();

  // --- OAuth Connect Handlers (Placeholder) ---
  const handleConnectTwitter = useCallback(async () => {
    // TODO: Implement Twitter OAuth popup and get access token
    // Redirect to backend endpoint for Twitter OAuth
    window.open('https://your-backend.com/auth/twitter', '_blank', 'width=500,height=700');
  }, []);

  const handleConnectDiscord = useCallback(async () => {
    // TODO: Implement Discord OAuth popup and get access token
    // Redirect to backend endpoint for Discord OAuth
    window.open('https://your-backend.com/auth/discord', '_blank', 'width=500,height=700');
  }, []);

  // --- UI ---
  if (!isConnected) {
    // Login UI
    return (
      <div className="game-background min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-4">
            <h2 className="font-pixelify text-4xl font-bold text-black tracking-wider">JUMP</h2>
          </div>
          <div className="text-center mb-6">
            <h1 className="font-pixelify text-8xl font-bold gorby-title mb-2">
              <span className="text-black">G</span>
              <span className="text-red-500">O</span>
              <span className="text-black">R</span>
              <span className="text-black">B</span>
              <span className="text-black">Y</span>
            </h1>
            <div className="font-pixelify text-lg text-black mb-1">Play and earn</div>
            <div className="font-pixelify text-lg text-red-500 font-bold">$GORBY</div>
          </div>
          <div className="text-center mb-8 mt-12">
            <p className="font-pixelify text-black text-base font-medium mb-1">To Access In Game</p>
            <p className="font-pixelify text-black text-base font-bold">Connect Wallet First</p>
          </div>
          <div className="flex justify-center mb-8">
            <Button
              onClick={handleWalletConnect}
              disabled={isConnecting || !((window as any).backpack?.solana)}
              className="game-button h-16 px-12 font-pixelify text-white text-lg font-bold rounded-lg shadow-lg"
            >
              {isConnecting ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </div>
              ) : (
                <span>Connect Wallet</span>
              )}
            </Button>
          </div>
          {availableWallets.length > 0 && (
            <div className="bg-black/20 rounded-lg p-4 mb-6">
              <p className="font-pixelify text-sm text-black mb-2 text-center">Detected Wallets:</p>
              <div className="flex justify-center space-x-2">
                {availableWallets.map((wallet) => (
                  <div key={wallet.name} className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded">
                    <span>{wallet.icon}</span>
                    <span className="font-pixelify text-xs text-black">{wallet.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {availableWallets.length === 0 && (
            <div className="text-center">
              <p className="font-pixelify text-sm text-black mb-3">No Solana wallet detected</p>
              <Button
                onClick={() => window.open('https://backpack.app/', '_blank')}
                variant="outline"
                size="sm"
                className="font-pixelify text-sm bg-white/20 border-black/30 text-black hover:bg-white/30"
              >
                Install BackPack Wallet
              </Button>
            </div>
          )}
          <div className="text-center mt-12">
            <p className="font-pixelify text-sm text-black font-medium">Build in Gorbagan Chain</p>
          </div>
        </div>
      </div>
    );
  }

  // Home UI
  return (
    <div className="game-background h-screen overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-2 md:p-4 bg-black/20 flex-wrap md:flex-nowrap text-white border-b-4 border-yellow-400 shadow-pixel relative z-10">
        <div className="flex items-center space-x-1 md:space-x-4 w-full md:w-auto justify-center md:justify-start mb-2 md:mb-0">
          <h1 className="pixel-font text-base md:text-2xl font-bold gorby-title drop-shadow-pixel select-none">
            <span className="text-white">G</span>
            <span className="text-red-500 animate-pulse">O</span>
            <span className="text-white">RBY</span>
          </h1>
          <Badge 
            variant="secondary" 
            className="pixel-font cursor-pointer hover:bg-yellow-400/80 hover:text-black transition-colors flex items-center justify-center w-7 h-7 md:w-8 md:h-8 p-0 border-2 border-yellow-400 shadow-pixel"
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {!isMuted ? (
              <Volume2 className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 md:w-5 md:h-5 opacity-60" />
            )}
          </Badge>
        </div>
        <div className="flex items-center space-x-1 md:space-x-3 w-full md:w-auto justify-center md:justify-end mt-2 md:mt-0">
          <Badge
            className={`pixel-font border-2 shadow-pixel px-3 py-1 text-xs md:text-base flex items-center gap-1 ${solBalance === 0 ? 'bg-gray-400 text-black animate-pulse border-gray-500' : 'bg-yellow-500 text-black border-yellow-400 hover:bg-yellow-400 hover:scale-105 transition-transform'}`}
            title="Your GOR Balance"
          >
            <Coins className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            {solBalance === 0 ? '0.0000' : solBalance.toFixed(4)} <span className="ml-1">$GOR</span>
          </Badge>
          <Badge
            className="pixel-font border-2 border-blue-400 bg-blue-400/90 text-black text-xs md:text-base shadow-pixel px-3 py-1 flex items-center gap-1 hover:bg-blue-300 hover:scale-105 transition-transform animate-pulse-slow"
            title="Total GORBY Earned"
          >
            <Gift className="w-3 h-3 md:w-4 md:h-4 mr-1 animate-bounce" />
            <span className="font-bold">Earned:</span> {gorbyEarned.toLocaleString()} <span className="ml-1">GORBY</span>
          </Badge>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            size="sm"
            className="pixel-font text-xs md:text-base text-white border-2 border-yellow-800 bg-yellow-900/90 hover:bg-yellow-700 hover:text-black shadow-pixel px-4 py-2 rounded-lg transition-all duration-150 active:scale-95 focus:ring-2 focus:ring-yellow-400 outline-none relative overflow-hidden group"
            title="Disconnect Wallet"
          >
            <span className="absolute inset-0 bg-yellow-700 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none rounded-lg" />
            <X className="w-3 h-3 md:w-4 md:h-4 mr-1 drop-shadow-pixel" />
            <span className="font-bold tracking-wider">Disconnect</span>
          </Button>
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-6">
          <div className="pixel-font text-3xl font-extrabold mb-2 flex justify-center items-center space-x-1 gorby-title drop-shadow-lg">
            <span className="text-black">G</span>
            <span className="text-red-600">O</span>
            <span className="text-black">R</span>
            <span className="text-black">B</span>
            <span className="text-black">Y</span>
          </div>
          <p className="pixel-font text-base text-black mb-1">Play and earn</p>
          <p className="pixel-font text-lg font-bold text-red-500">$GORBY</p>
        </div>
        {/* Main Action Buttons */}
        <div className="flex flex-col items-center space-y-4 mb-12">
            <Button
              onMouseEnter={() => setIsPlayHover(true)}
              onMouseLeave={() => setIsPlayHover(false)}
              onClick={handleStartGame}
              className={`game-button w-64 h-16 pixel-font text-white text-xl font-bold rounded-lg shadow-lg transition-transform duration-200 active:scale-95 hover:scale-105 focus:ring-4 focus:ring-yellow-400/40 focus:outline-none bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 border-2 border-yellow-400 ${isPlayHover ? 'animate-bounce-fast' : 'animate-bounce'}`}
              style={isPlayHover ? { animationDuration: '0.7s' } : { animationDuration: '1.5s' }}
            >
              <Gamepad className="w-6 h-6 mr-3" />
              {isPlayHover ? 'Ready!' : 'Play Game'}
            </Button>
          <Button
            onClick={() => setActiveTab(activeTab === 'leaderboard' ? 'game' : 'leaderboard')}
            className="game-button w-64 h-14 pixel-font text-white text-lg font-bold rounded-lg shadow-lg transition-transform duration-200 active:scale-95 hover:scale-105 focus:ring-4 focus:ring-yellow-400/40 focus:outline-none bg-gradient-to-br from-black via-gray-900 to-yellow-900 hover:from-yellow-900 hover:to-yellow-700 border-2 border-yellow-400"
          >
            <Trophy className="w-5 h-5 mr-3" />
            Leaderboard
          </Button>
        </div>
        {/* Leaderboard Modal */}
        {activeTab === 'leaderboard' && (
          <Card className="max-w-lg mx-auto mb-8 bg-black/80 text-white border-2 border-yellow-400 rounded-2xl shadow-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="pixel-font text-2xl font-bold text-yellow-400">🏆 Leaderboard</h2>
                <Button
                  onClick={() => setActiveTab('game')}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-center text-gray-300 pixel-font">Stay tune more update</div>
            </div>
          </Card>
        )}
        {/* Tasks Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="pixel-font text-2xl font-bold text-black mb-2">Complete Task to earn more $GORBY</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
            {tasks.map((task, index) => (
              <div
                key={index}
                className={`task-item p-4 rounded-2xl text-white transition duration-300 transform hover:scale-105 hover:shadow-xl ${task.status === 'completed' ? 'opacity-75' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{task.icon}</span>
                    <div>
                      <h3 className="pixel-font font-bold text-lg">{task.title}</h3>
                      <p className="pixel-font text-sm text-gray-300">{task.description}</p>
                    </div>
                  </div>
                  {task.status === 'completed' && (
                    <Badge className="bg-green-500 text-white pixel-font rounded-full">✓</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="pixel-font text-yellow-400 font-bold">{task.reward} GORBY</span>
                  {/* Tambahkan tombol connect & verifikasi untuk Twitter/Discord */}
                  {task.status === 'available' && (
                    <>
                      {(task.title === 'Follow Twitter' || task.title === 'Retweet' || task.title === 'Follow Gorbaganachain') && (
                        <Button
                          size="sm"
                          className="pixel-font bg-blue-500 text-white hover:bg-blue-400 rounded-full shadow-md mr-2"
                          onClick={handleConnectTwitter}
                        >
                          Connect Twitter
                        </Button>
                      )}
                      {task.title === 'Join Discord' && (
                        <Button
                          size="sm"
                          className="pixel-font bg-indigo-500 text-white hover:bg-indigo-400 rounded-full shadow-md mr-2"
                          onClick={handleConnectDiscord}
                        >
                          Connect Discord
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        className="pixel-font bg-yellow-500 text-black hover:bg-yellow-400 rounded-full shadow-md"
                        onClick={() => handleTaskClick(index, task.link)}
                        disabled={loadingTasks[index]}
                      >
                        {loadingTasks[index] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Claim'
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grass-pattern h-24 w-full mt-12 rounded-lg opacity-30"></div>
      </div>
    </div>
  );
}
