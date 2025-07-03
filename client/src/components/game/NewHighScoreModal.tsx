import React, { useEffect } from 'react';
import { useAudio } from '@/lib/stores/useAudio';

interface NewHighScoreModalProps {
  score: number;
  onClose: () => void;
  onRestart?: () => void;
  onBackToHome?: () => void;
}

export const NewHighScoreModal: React.FC<NewHighScoreModalProps> = ({ score, onClose, onRestart, onBackToHome }) => {
  const { isMuted } = useAudio();

  useEffect(() => {
    let winningAudio: HTMLAudioElement | null = null;
    if (!isMuted) {
      winningAudio = new Audio('/sounds/winning.mp3');
      winningAudio.volume = 0.7;
      winningAudio.play().catch(() => {});
    }
    return () => {
      if (winningAudio) {
        winningAudio.pause();
        winningAudio.currentTime = 0;
      }
    };
  }, [isMuted]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.85)',
      fontFamily: '"Courier New", monospace',
      color: 'white',
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.95)',
        padding: '48px 32px',
        borderRadius: '16px',
        border: '5px solid #FFD700',
        textAlign: 'center',
        maxWidth: '350px',
        width: '100%',
        boxShadow: '0 0 32px #FFD70088',
      }}>
        <h2 style={{
          fontSize: '36px',
          margin: '0 0 20px 0',
          textShadow: '2px 2px 0px #000',
          color: '#FFD700',
        }}>
          NEW HIGH SCORE!
        </h2>
        <div style={{ fontSize: '28px', color: '#FCDC00', marginBottom: 16 }}>
          {score.toLocaleString()} ⭐
        </div>
        <div style={{ fontSize: '48px', marginBottom: 24 }}>
          {'★'.repeat(Math.min(5, Math.max(1, Math.floor(score / 1000))))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              fontSize: '20px',
              padding: '12px 32px',
              backgroundColor: '#228B22',
              color: 'white',
              border: '2px solid #000',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 'bold',
              textShadow: '1px 1px 0px #000',
              marginTop: 8,
            }}
          >
            OK
          </button>
          {onRestart && (
            <button
              onClick={onRestart}
              style={{
                fontSize: '18px',
                padding: '10px 28px',
                backgroundColor: '#FF6B35',
                color: 'white',
                border: '2px solid #000',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 'bold',
                textShadow: '1px 1px 0px #000',
              }}
            >
              Restart
            </button>
          )}
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              style={{
                fontSize: '18px',
                padding: '10px 28px',
                backgroundColor: '#8B4513',
                color: 'white',
                border: '2px solid #000',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 'bold',
                textShadow: '1px 1px 0px #000',
              }}
            >
              Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
