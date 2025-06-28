import { useGameStore } from '@/lib/stores/useGameStore';
import { useAudio } from '@/lib/stores/useAudio';

export function MainMenu() {
  const { startGame, highScore } = useGameStore();
  const { toggleMute, isMuted } = useAudio();

  const handleStartGame = () => {
    startGame();
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #6B8CFF 0%, #5C94FC 100%)',
      color: 'white',
      fontFamily: '"Courier New", monospace',
      textAlign: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '40px',
        borderRadius: '10px',
        border: '4px solid #FCDC00',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '48px',
          margin: '0 0 20px 0',
          textShadow: '4px 4px 0px #000',
          color: '#FCDC00'
        }}>
          PIXEL
        </h1>
        <h2 style={{
          fontSize: '32px',
          margin: '0 0 30px 0',
          textShadow: '2px 2px 0px #000',
          color: '#FF6B35'
        }}>
          PLATFORMER
        </h2>
        
        <div style={{ marginBottom: '30px' }}>
          <p style={{ fontSize: '16px', margin: '10px 0' }}>
            High Score: {highScore}
          </p>
        </div>

        <button
          onClick={handleStartGame}
          style={{
            fontSize: '24px',
            padding: '15px 30px',
            backgroundColor: '#228B22',
            color: 'white',
            border: '3px solid #000',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: '"Courier New", monospace',
            fontWeight: 'bold',
            textShadow: '2px 2px 0px #000',
            marginBottom: '20px',
            display: 'block',
            width: '100%',
            transition: 'all 0.1s'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translate(2px, 2px)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '4px 4px 0px #000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '4px 4px 0px #000';
          }}
        >
          START GAME
        </button>

        <button
          onClick={toggleMute}
          style={{
            fontSize: '16px',
            padding: '10px 20px',
            backgroundColor: isMuted ? '#8B4513' : '#AB9FF2',
            color: 'white',
            border: '2px solid #000',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: '"Courier New", monospace',
            fontWeight: 'bold',
            textShadow: '1px 1px 0px #000',
            display: 'block',
            width: '100%'
          }}
        >
          {isMuted ? '🔇 SOUND OFF' : '🔊 SOUND ON'}
        </button>

        <div style={{ 
          marginTop: '30px', 
          fontSize: '14px', 
          opacity: 0.8,
          lineHeight: '1.4'
        }}>
          <p>Desktop: Arrow keys or WASD to move, Space to jump</p>
          <p>Mobile: Use virtual controls</p>
        </div>
      </div>
    </div>
  );
}
