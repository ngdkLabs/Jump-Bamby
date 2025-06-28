import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '@/lib/game/GameEngine';
import { useGameStore } from '@/lib/stores/useGameStore';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { gameState } = useGameStore();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize game engine
    engineRef.current = new GameEngine(canvas, ctx);
    engineRef.current.start();

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      if (gameState === 'paused') {
        engineRef.current.pause();
      } else if (gameState === 'playing') {
        engineRef.current.resume();
      }
    }
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        touchAction: 'none',
        imageRendering: 'pixelated'
      }}
    />
  );
}
