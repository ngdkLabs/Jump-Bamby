import { create } from 'zustand';

type GameState = 'menu' | 'playing' | 'paused' | 'gameOver';

interface GameStoreState {
  gameState: GameState;
  score: number;
  lives: number;
  highScore: number;
  gameTime: number;
  
  // Actions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  goToMenu: () => void;
  gameOver: () => void;
  addScore: (points: number) => void;
  loseLife: () => void;
  resetGame: () => void;
  updateGameTime: (deltaTime: number) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameState: 'menu',
  score: 0,
  lives: 3,
  highScore: parseInt(localStorage.getItem('pixelPlatformerHighScore') || '0'),
  gameTime: 0,
  
  startGame: () => {
    set(state => ({ 
      ...state,
      gameState: 'playing',
      score: 0,
      lives: 3,
      gameTime: 0
    }));
  },
  
  pauseGame: () => {
    set(state => state.gameState === 'playing' ? { ...state, gameState: 'paused' } : state);
  },
  
  resumeGame: () => {
    set(state => state.gameState === 'paused' ? { ...state, gameState: 'playing' } : state);
  },
  
  restartGame: () => {
    set(state => ({ 
      ...state,
      gameState: 'playing',
      score: 0,
      lives: 3,
      gameTime: 0
    }));
  },
  
  goToMenu: () => {
    set(state => ({ 
      ...state,
      gameState: 'menu'
    }));
  },
  
  gameOver: () => {
    const { score, highScore } = get();
    const newHighScore = Math.max(score, highScore);
    
    if (newHighScore > highScore) {
      localStorage.setItem('pixelPlatformerHighScore', newHighScore.toString());
    }
    
    set(state => ({ 
      ...state,
      gameState: 'gameOver',
      highScore: newHighScore
    }));
  },
  
  addScore: (points: number) => {
    set(state => ({ 
      ...state,
      score: Math.min(state.score + points, 1000000000) // Cap at 1 billion
    }));
  },
  
  loseLife: () => {
    set(state => {
      const newLives = state.lives - 1;
      if (newLives <= 0) {
        // Game over will be handled by the game engine
        return { ...state, lives: 0 };
      }
      return { ...state, lives: newLives };
    });
  },
  
  resetGame: () => {
    set(state => ({ 
      ...state,
      score: 0,
      lives: 3,
      gameTime: 0
    }));
  },
  
  updateGameTime: (deltaTime: number) => {
    set(state => ({
      ...state,
      gameTime: state.gameTime + deltaTime
    }));
  }
}));
