import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '@/lib/game/GameEngine';
import { useGameStore } from '@/lib/stores/useGameStore';
import { InputManager } from '@/lib/game/InputManager';

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

  // Add tap-to-jump functionality for mobile
  const handleCanvasTouch = (e: React.TouchEvent) => {
    if (gameState === 'playing') {
      e.preventDefault();
      // Trigger jump on tap
      InputManager.setKey('Space', true);
      setTimeout(() => InputManager.setKey('Space', false), 100);
      
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (gameState === 'playing') {
      e.preventDefault();
      // Also support click for desktop testing
      InputManager.setKey('Space', true);
      setTimeout(() => InputManager.setKey('Space', false), 100);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      onTouchStart={handleCanvasTouch}
      onClick={handleCanvasClick}
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
