import { useGameStore } from '@/lib/stores/useGameStore';
import { useAudio } from '@/lib/stores/useAudio';
import { useEffect, useState } from 'react';

export function GameUI() {
  const { gameState, score, lives, pauseGame, resumeGame, restartGame, goToMenu, gameTime } = useGameStore();
  const { toggleMute, isMuted } = useAudio();
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Heart shape component
  const Heart = ({ filled = true }: { filled?: boolean }) => (
    <div style={{
      width: '20px',
      height: '18px',
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
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: filled ? '14px solid #FF0000' : '14px solid rgba(255, 255, 255, 0.3)'
      }} />
      <div style={{
        position: 'absolute',
        top: '-7px',
        left: '0',
        width: '10px',
        height: '10px',
        backgroundColor: filled ? '#FF0000' : 'rgba(255, 255, 255, 0.3)',
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)'
      }} />
      <div style={{
        position: 'absolute',
        top: '-7px',
        right: '0',
        width: '10px',
        height: '10px',
        backgroundColor: filled ? '#FF0000' : 'rgba(255, 255, 255, 0.3)',
        borderRadius: '50% 50% 0 50%',
        transform: 'rotate(45deg)'
      }} />
    </div>
  );

  if (gameState === 'playing') {
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
        textShadow: '2px 2px 0px #000',
        pointerEvents: 'none'
      }}>
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.8)', 
          padding: '10px 15px', 
          borderRadius: '5px',
          border: '2px solid #FCDC00'
        }}>
          SCORE: {score}
        </div>
        
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.8)', 
          padding: '10px 15px', 
          borderRadius: '5px',
          border: '2px solid #FF6B35',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>LIVES:</span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {Array.from({ length: 3 }, (_, i) => (
              <Heart key={i} filled={i < lives} />
            ))}
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.8)', 
          padding: '10px 15px', 
          borderRadius: '5px',
          border: '2px solid #AB9FF2'
        }}>
          TIME: {formatTime(gameTime)}
        </div>

        <button
          onClick={pauseGame}
          style={{
            fontSize: '16px',
            padding: '8px 15px',
            backgroundColor: '#8B4513',
            color: 'white',
            border: '2px solid #000',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: '"Courier New", monospace',
            fontWeight: 'bold',
            textShadow: '1px 1px 0px #000',
            pointerEvents: 'auto'
          }}
        >
          PAUSE
        </button>
      </div>
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
        background: 'rgba(0, 0, 0, 0.8)',
        fontFamily: '"Courier New", monospace',
        color: 'white'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '40px',
          borderRadius: '10px',
          border: '4px solid #FCDC00',
          textAlign: 'center',
          maxWidth: '300px',
          width: '100%'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            margin: '0 0 30px 0',
            textShadow: '2px 2px 0px #000',
            color: '#FCDC00'
          }}>
            PAUSED
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button
              onClick={resumeGame}
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
              RESUME
            </button>
            
            <button
              onClick={restartGame}
              style={{
                fontSize: '18px',
                padding: '12px 24px',
                backgroundColor: '#FF6B35',
                color: 'white',
                border: '2px solid #000',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: '"Courier New", monospace',
                fontWeight: 'bold',
                textShadow: '1px 1px 0px #000'
              }}
            >
              RESTART
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
    );
  }

  if (gameState === 'gameOver') {
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
    );
  }

  return null;
}
