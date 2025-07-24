import { useEffect, useState, useRef } from 'react';
import { GameCanvas } from './components/game/GameCanvas';
import { MainMenu } from './components/game/MainMenu';
import { GameUI } from './components/game/GameUI';
import { VirtualControls } from './components/game/VirtualControls';
import { useGameStore } from './lib/stores/useGameStore';
import { useAudio } from './lib/stores/useAudio';
import { WalletProvider } from './contexts/WalletContext';
import { PrivyProvider } from './contexts/PrivyProvider';

function App() {
  const { gameState } = useGameStore();
  const { setBackgroundMusic, setHitSound, setSuccessSound, backgroundMusic, isMuted, setShootSound, setExplosionSound } = useAudio();
  const [isMobile, setIsMobile] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const prevGameState = useRef(gameState);

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
    console.log('Initializing audio...');
    const bgMusic = new Audio('/sounds/Untitled (12).mp3');
    bgMusic.setAttribute('data-bg-music', 'true');
    const hitSound = new Audio('/sounds/hit.mp3');
    const successSound = new Audio('/sounds/success.mp3');
    const shootSound = new Audio('/sounds/shoot.mp3');
    const explosionSound = new Audio('/sounds/explosion.mp3');
    const deadSound = new Audio('/sounds/dead.mp3');
    const deadMinionSound = new Audio('/sounds/deadminion.mp3');
    const jumpSound = new Audio('/sounds/jump.mp3');
    const bagorSound = new Audio('/sounds/bagorsound.mp3');
    
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    bgMusic.addEventListener('canplaythrough', () => {
 
    });
    bgMusic.addEventListener('error', (e) => {

    });
    hitSound.addEventListener('canplaythrough', () => {

    });
    hitSound.addEventListener('error', (e) => {

    });
    successSound.addEventListener('canplaythrough', () => {

    });
    successSound.addEventListener('error', (e) => {
      
    });
    shootSound.addEventListener('canplaythrough', () => {

    });
    shootSound.addEventListener('error', (e) => {

    });
    explosionSound.addEventListener('canplaythrough', () => {

    });
    explosionSound.addEventListener('error', (e) => {

    });
    deadSound.addEventListener('canplaythrough', () => {

    });
    deadSound.addEventListener('error', (e) => {

    });
    deadMinionSound.addEventListener('canplaythrough', () => {
    });
    deadMinionSound.addEventListener('error', (e) => {
    });
    jumpSound.addEventListener('canplaythrough', () => {
    });
    jumpSound.addEventListener('error', (e) => {
    });
    bagorSound.addEventListener('canplaythrough', () => {
    });
    bagorSound.addEventListener('error', (e) => {
    });
    
    setBackgroundMusic(bgMusic);
    setHitSound(hitSound);
    setSuccessSound(successSound);
    if (typeof setShootSound === 'function') setShootSound(shootSound);
    if (typeof setExplosionSound === 'function') setExplosionSound(explosionSound);
    if (typeof (window as any).setDeadSound === 'function') (window as any).setDeadSound(deadSound);
    if (typeof (window as any).setDeadMinionSound === 'function') (window as any).setDeadMinionSound(deadMinionSound);
    if (typeof useAudio.getState().setJumpSound === 'function') useAudio.getState().setJumpSound(jumpSound);
    if (typeof useAudio.getState().setBagorSound === 'function') useAudio.getState().setBagorSound(bagorSound);
  }, [setBackgroundMusic, setHitSound, setSuccessSound, setShootSound, setExplosionSound]);

  useEffect(() => {
    // Play/pause background music sesuai gameState dan mute
    if (backgroundMusic) {
      if (!isMuted && gameState === 'playing') {
        if (backgroundMusic.paused) {
          backgroundMusic.play().catch(() => {});
        }
      } else {
        if (!backgroundMusic.paused) {
          backgroundMusic.pause();
        }
      }
    }
  }, [gameState, backgroundMusic, isMuted]);

  // Reset GameCanvas when gameState goes from gameOver to playing
  useEffect(() => {
    if (prevGameState.current === 'gameOver' && gameState === 'playing') {
      setGameKey(k => k + 1);
    }
    prevGameState.current = gameState;
  }, [gameState]);

  return (
    <PrivyProvider>
      <WalletProvider>
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
              <GameCanvas key={gameKey} />
              <GameUI isMobile={isMobile} />
              {isMobile && <VirtualControls />}
            </>
          )}
        </div>
      </WalletProvider>
    </PrivyProvider>
  );
}

export default App;
