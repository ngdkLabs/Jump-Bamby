import { useGameStore } from '@/lib/stores/useGameStore';
import { useAudio } from '@/lib/stores/useAudio';
import { useRef, useEffect, useState } from 'react';
import { InputManager } from '@/lib/game/InputManager';
import { GameEngine } from '@/lib/game/GameEngine';
import { IconVolume } from '../ui/IconVolume';
import { NewHighScoreModal } from './NewHighScoreModal';

export function GameUI({ isMobile = false }: { isMobile?: boolean }) {
  const { gameState, score, lives, pauseGame, resumeGame, restartGame, goToMenu, gameTime, highScore } = useGameStore();
  const { toggleMute, isMuted, restartBackgroundMusic } = useAudio();
  const engineRef = useRef<GameEngine | null>(null);

  const [showNewHighScore, setShowNewHighScore] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [prevHighScore, setPrevHighScore] = useState(highScore);

  useEffect(() => {
    // Cari canvas dan ambil engine dari window
    const canvas = document.querySelector('canvas');
    if (canvas && (canvas as any).engineRef) {
      engineRef.current = (canvas as any).engineRef;
    }
  }, []);

  useEffect(() => {
    if (gameState === 'gameOver') {
      // Cek apakah skor saat ini adalah high score baru
      if (score > prevHighScore) {
        setShowNewHighScore(true);
        setLastScore(score);
        setPrevHighScore(score);
      }
    } else if (gameState === 'playing') {
      setShowNewHighScore(false);
    }
  }, [gameState, score, prevHighScore]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format score with commas for readability
  const formatScore = (score: number) => {
    return score.toLocaleString();
  };
  
  // Heart shape component
  const Heart = ({ filled = true }: { filled?: boolean }) => (
    <div style={{
      width: isMobile ? '14px' : '20px',
      height: isMobile ? '12px' : '18px',
      position: 'relative',
      display: 'inline-block',
      margin: '0 2px'
    }}>
      <div style={{
        position: 'absolute',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '0',
        height: '0',
        borderLeft: isMobile ? '7px solid transparent' : '10px solid transparent',
        borderRight: isMobile ? '7px solid transparent' : '10px solid transparent',
        borderTop: filled 
          ? (isMobile ? '9px solid #FF0000' : '14px solid #FF0000') 
          : (isMobile ? '9px solid rgba(255, 255, 255, 0.3)' : '14px solid rgba(255, 255, 255, 0.3)')
      }} />
      <div style={{
        position: 'absolute',
        top: isMobile ? '-4px' : '-7px',
        left: '0',
        width: isMobile ? '7px' : '10px',
        height: isMobile ? '7px' : '10px',
        backgroundColor: filled ? '#FF0000' : 'rgba(255, 255, 255, 0.3)',
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)'
      }} />
      <div style={{
        position: 'absolute',
        top: isMobile ? '-4px' : '-7px',
        right: '0',
        width: isMobile ? '7px' : '10px',
        height: isMobile ? '7px' : '10px',
        backgroundColor: filled ? '#FF0000' : 'rgba(255, 255, 255, 0.3)',
        borderRadius: '50% 50% 0 50%',
        transform: 'rotate(45deg)'
      }} />
    </div>
  );

  let gunAmmo = 0;
  let bombAmmo = 0;
  let weapon = null;
  let ammo = 0;
  if (engineRef.current && engineRef.current['player']) {
    gunAmmo = engineRef.current['player'].inventory.gun;
    bombAmmo = engineRef.current['player'].inventory.bomb;
    weapon = engineRef.current['player'].currentWeapon;
    if (weapon === 'gun') ammo = gunAmmo;
    else if (weapon === 'bomb') ammo = bombAmmo;
  }

  const handleRestart = () => {
    restartBackgroundMusic();
    restartGame();
  };

  if (gameState === 'playing') {
    return (
      <>
        <div style={{
          position: 'absolute',
          top: isMobile ? 6 : 0,
          left: isMobile ? 16 : 32,
          right: isMobile ? 16 : 32,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '1.5vw 2vw' : '8px 16px',
          fontFamily: 'inherit',
          fontSize: isMobile ? '9px' : '15px',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '2px 2px 0px #000',
          pointerEvents: 'none',
          minHeight: isMobile ? 22 : 36,
          maxHeight: isMobile ? 30 : 44,
          marginTop: isMobile ? 4 : 0,
        }}>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.8)', 
            padding: isMobile ? '2px 4px' : '10px 15px', 
            borderRadius: '5px',
            border: '2px solid #FCDC00',
            fontSize: isMobile ? '10px' : '20px',
          }}>
            $GORBY: {formatScore(score)}
          </div>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.8)', 
            padding: isMobile ? '2px 4px' : '10px 15px', 
            borderRadius: '5px',
            border: '2px solid #FF6B35',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '2px' : '10px',
            fontSize: isMobile ? '10px' : '20px',
            minWidth: isMobile ? 70 : 120,
            justifyContent: 'center',
          }}>
            <span style={{marginRight: isMobile ? 2 : 6}}>LIVES:</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              {Array.from({ length: 3 }, (_, i) => (
                <Heart key={i} filled={i < lives} />
              ))}
            </div>
          </div>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.8)', 
            padding: isMobile ? '2px 4px' : '10px 15px', 
            borderRadius: '5px',
            border: '2px solid #AB9FF2',
            fontSize: isMobile ? '10px' : '20px',
          }}>
            TIME: {formatTime(gameTime)}
          </div>
          <button
            onClick={pauseGame}
            style={{
              fontSize: isMobile ? '8px' : '16px',
              padding: isMobile ? '2px 4px' : '8px 15px',
              backgroundColor: '#8B4513',
              color: 'white',
              border: '2px solid #000',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 'bold',
              textShadow: '1px 1px 0px #000',
              pointerEvents: 'auto',
              marginLeft: isMobile ? 4 : 12,
              minWidth: isMobile ? 38 : 48,
              minHeight: isMobile ? 32 : 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            PAUSE
          </button>
          <button
            onClick={toggleMute}
            style={{
              background: 'rgba(0,0,0,0.7)',
              border: '2px solid #FFD700',
              borderRadius: '50%',
              width: isMobile ? 32 : 38,
              height: isMobile ? 32 : 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isMuted ? '#888' : '#FFD700',
              fontSize: isMobile ? 18 : 22,
              boxShadow: '0 2px 8px #0008',
              marginLeft: isMobile ? 4 : 12,
              pointerEvents: 'auto',
            }}
            aria-label={isMuted ? 'Unmute Music' : 'Mute Music'}
          >
            <IconVolume muted={isMuted} size={isMobile ? 18 : 22} />
          </button>
        </div>
      </>
    );
  }

  if (gameState === 'paused') {
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        fontFamily: 'inherit',
        color: 'white',
      }}>
        <div style={{
          background: 'rgba(24, 28, 44, 0.95)',
          padding: '36px 28px',
          borderRadius: '22px',
          border: '4px solid #FCDC00',
          textAlign: 'center',
          maxWidth: '340px',
          width: '100%',
          boxShadow: '0 8px 32px #0008',
        }}>
          <h2 style={{
            fontSize: '28px',
            margin: '0 0 24px 0',
            textShadow: '2px 2px 0px #000',
            color: '#FCDC00',
            fontFamily: 'inherit',
            letterSpacing: 1.5,
          }}>
            PAUSED
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <button
              onClick={resumeGame}
              style={{
                fontSize: '18px',
                padding: '10px 0',
                background: '#FCDC00',
                color: '#181C2C',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 700,
                boxShadow: '0 2px 8px #0004',
                transition: 'background 0.2s',
                outline: 'none',
              }}
            >
              Resume
            </button>
            <button
              onClick={handleRestart}
              style={{
                fontSize: '18px',
                padding: '10px 0',
                background: '#FF6B35',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 700,
                boxShadow: '0 2px 8px #0004',
                transition: 'background 0.2s',
                outline: 'none',
              }}
            >
              Restart
            </button>
            <button
              onClick={goToMenu}
              style={{
                fontSize: '18px',
                padding: '10px 0',
                background: '#fff',
                color: '#181C2C',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 700,
                boxShadow: '0 2px 8px #0004',
                transition: 'background 0.2s',
                outline: 'none',
              }}
            >
              Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <>
        {showNewHighScore && (
          <NewHighScoreModal 
            score={lastScore} 
            onClose={() => setShowNewHighScore(false)}
            onRestart={() => {
              setShowNewHighScore(false);
              restartGame();
            }}
            onBackToHome={() => {
              setShowNewHighScore(false);
              goToMenu();
            }}
          />
        )}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          fontFamily: '"Courier New", monospace',
          color: 'white'
        }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.9)',
            padding: '40px',
            borderRadius: '10px',
            border: '4px solid #FF6B35',
            textAlign: 'center',
            maxWidth: '300px',
            width: '100%'
          }}>
            <h2 style={{ 
              fontSize: '32px', 
              margin: '0 0 20px 0',
              textShadow: '2px 2px 0px #000',
              color: '#FF6B35'
            }}>
              GAME OVER
            </h2>
            
            <p style={{ 
              fontSize: '20px', 
              margin: '0 0 30px 0',
              color: '#FCDC00'
            }}>
              Score: {score}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button
                onClick={restartGame}
                style={{
                  fontSize: '18px',
                  padding: '12px 24px',
                  backgroundColor: '#228B22',
                  color: 'white',
                  border: '2px solid #000',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontFamily: '"Courier New", monospace',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 0px #000'
                }}
              >
                PLAY AGAIN
              </button>
              
              <button
                onClick={goToMenu}
                style={{
                  fontSize: '18px',
                  padding: '12px 24px',
                  backgroundColor: '#8B4513',
                  color: 'white',
                  border: '2px solid #000',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontFamily: '"Courier New", monospace',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 0px #000'
                }}
              >
                MENU
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
