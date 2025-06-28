import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/stores/useGameStore';

interface LeaderboardEntry {
  score: number;
  time: string;
  date: string;
}

export function Leaderboard({ onClose }: { onClose: () => void }) {
  const { highScore } = useGameStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Load leaderboard from localStorage
    const savedLeaderboard = localStorage.getItem('pixelPlatformerLeaderboard');
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard));
    } else {
      // Initialize with current high score if available
      if (highScore > 0) {
        const initialEntry: LeaderboardEntry = {
          score: highScore,
          time: '00:00',
          date: new Date().toLocaleDateString('id-ID')
        };
        setLeaderboard([initialEntry]);
        localStorage.setItem('pixelPlatformerLeaderboard', JSON.stringify([initialEntry]));
      }
    }
  }, [highScore]);

  const formatScore = (score: number): string => {
    if (score >= 1000000000) return '1,000,000,000';
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toString();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 20
    }}>
      <div style={{
        backgroundColor: '#2C3E50',
        border: '6px solid #000',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '70vh',
        overflow: 'auto',
        fontFamily: '"Courier New", monospace'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            color: '#FCDC00',
            fontSize: '28px',
            fontWeight: 'bold',
            textShadow: '2px 2px 0px #000',
            margin: '0 0 8px 0'
          }}>
            🏆 PAPAN SKOR 🏆
          </h2>
          <p style={{
            color: '#ECF0F1',
            fontSize: '14px',
            margin: 0,
            textShadow: '1px 1px 0px #000'
          }}>
            Top 10 Pemain Terbaik
          </p>
        </div>

        {/* Leaderboard Table */}
        <div style={{
          backgroundColor: '#34495E',
          border: '3px solid #000',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'flex',
            backgroundColor: '#1ABC9C',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '14px',
            textShadow: '1px 1px 0px rgba(255,255,255,0.5)'
          }}>
            <div style={{ flex: '0 0 50px', padding: '12px 8px', textAlign: 'center', borderRight: '2px solid #000' }}>
              RANK
            </div>
            <div style={{ flex: '1', padding: '12px 8px', borderRight: '2px solid #000' }}>
              SKOR
            </div>
            <div style={{ flex: '0 0 80px', padding: '12px 8px', borderRight: '2px solid #000', textAlign: 'center' }}>
              WAKTU
            </div>
            <div style={{ flex: '0 0 100px', padding: '12px 8px', textAlign: 'center' }}>
              TANGGAL
            </div>
          </div>

          {/* Table Body */}
          {leaderboard.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#BDC3C7',
              fontSize: '16px'
            }}>
              Belum ada skor!<br />
              Mulai bermain untuk masuk papan skor.
            </div>
          ) : (
            leaderboard.slice(0, 10).map((entry, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  backgroundColor: index % 2 === 0 ? '#2C3E50' : '#34495E',
                  color: '#ECF0F1',
                  fontSize: '13px',
                  borderBottom: index < Math.min(leaderboard.length - 1, 9) ? '1px solid #000' : 'none'
                }}
              >
                <div style={{
                  flex: '0 0 50px',
                  padding: '10px 8px',
                  textAlign: 'center',
                  borderRight: '1px solid #000',
                  color: index < 3 ? '#FCDC00' : '#ECF0F1',
                  fontWeight: index < 3 ? 'bold' : 'normal'
                }}>
                  {index + 1}
                  {index === 0 && ' 🥇'}
                  {index === 1 && ' 🥈'}
                  {index === 2 && ' 🥉'}
                </div>
                <div style={{
                  flex: '1',
                  padding: '10px 8px',
                  borderRight: '1px solid #000',
                  fontWeight: 'bold',
                  color: index < 3 ? '#FCDC00' : '#ECF0F1'
                }}>
                  {formatScore(entry.score)}
                </div>
                <div style={{
                  flex: '0 0 80px',
                  padding: '10px 8px',
                  borderRight: '1px solid #000',
                  textAlign: 'center'
                }}>
                  {entry.time}
                </div>
                <div style={{
                  flex: '0 0 100px',
                  padding: '10px 8px',
                  textAlign: 'center',
                  fontSize: '11px'
                }}>
                  {entry.date}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Current High Score */}
        {highScore > 0 && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#E74C3C',
            border: '3px solid #000',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#FFF',
              margin: '0',
              fontSize: '14px',
              fontWeight: 'bold',
              textShadow: '1px 1px 0px #000'
            }}>
              Skor Tertinggi Anda: {formatScore(highScore)}
            </p>
          </div>
        )}

        {/* Close Button */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#E74C3C',
              color: 'white',
              border: '4px solid #000',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontFamily: '"Courier New", monospace',
              fontWeight: 'bold',
              cursor: 'pointer',
              textShadow: '1px 1px 0px #000',
              boxShadow: '4px 4px 0px #000',
              transition: 'all 0.1s'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(2px, 2px)';
              e.currentTarget.style.boxShadow = '2px 2px 0px #000';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translate(0px, 0px)';
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0px, 0px)';
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
            }}
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
}