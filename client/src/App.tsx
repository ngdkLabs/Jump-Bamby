import { useEffect, useState } from 'react';
import { GameCanvas } from './components/game/GameCanvas';
import { MainMenu } from './components/game/MainMenu';
import { GameUI } from './components/game/GameUI';
import { VirtualControls } from './components/game/VirtualControls';
import { useGameStore } from './lib/stores/useGameStore';
import { useAudio } from './lib/stores/useAudio';

function App() {
  const { gameState } = useGameStore();
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Initialize audio
    const bgMusic = new Audio('/sounds/background.mp3');
    const hitSound = new Audio('/sounds/hit.mp3');
    const successSound = new Audio('/sounds/success.mp3');
    
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    setBackgroundMusic(bgMusic);
    setHitSound(hitSound);
    setSuccessSound(successSound);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      background: '#6B8CFF',
      overflow: 'hidden'
    }}>
      {gameState === 'menu' && <MainMenu />}
      
      {(gameState === 'playing' || gameState === 'paused' || gameState === 'gameOver') && (
        <>
          <GameCanvas />
          <GameUI />
          {isMobile && <VirtualControls />}
        </>
      )}
    </div>
  );
}

export default App;
