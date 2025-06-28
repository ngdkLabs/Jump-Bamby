import { Player } from './Player';
import { Level } from './Level';
import { InputManager } from './InputManager';
import { useGameStore } from '../stores/useGameStore';
import { useAudio } from '../stores/useAudio';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private level: Level;
  
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  
  private gameStore = useGameStore.getState();
  private audioStore = useAudio.getState();
  
  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.player = new Player();
    this.level = new Level();
    
    // Initialize input manager
    InputManager.init();
    
    // Subscribe to game store changes
    useGameStore.subscribe((state) => {
      this.gameStore = state;
    });
    
    useAudio.subscribe((state) => {
      this.audioStore = state;
    });
  }
  
  public start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
    
    console.log('Game engine started');
  }
  
  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    console.log('Game engine stopped');
  }
  
  public pause() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  public resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.gameLoop();
    }
  }
  
  private gameLoop = () => {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.016); // Cap at 60fps
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
  
  private update(deltaTime: number) {
    if (this.gameStore.gameState !== 'playing') return;
    
    // Update game time
    this.gameStore.updateGameTime(deltaTime);
    
    // Update player
    this.player.update(deltaTime, this.level.platforms, this.canvas.height);
    
    // Check if player died
    if (!this.player.isAlive) {
      this.gameStore.loseLife();
      
      if (this.gameStore.lives <= 0) {
        this.gameStore.gameOver();
      } else {
        // Respawn player
        this.player.reset();
      }
    }
    
    // Update coins
    for (const coin of this.level.coins) {
      if (coin.update(deltaTime, this.player)) {
        // Coin was collected
        this.gameStore.addScore(100);
        this.audioStore.playSuccess();
      }
    }
    
    // Update camera
    this.level.updateCamera(this.player.x, this.player.y, this.canvas.width, this.canvas.height);
    
    // Check win condition (all coins collected)
    const allCoinsCollected = this.level.coins.every(coin => coin.collected);
    if (allCoinsCollected) {
      // Generate new level or show victory
      this.level.reset();
      this.player.reset();
      this.gameStore.addScore(1000); // Bonus for completing level
    }
  }
  
  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#6B8CFF';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw level (this includes camera transform)
    this.level.draw(this.ctx, this.canvas.width, this.canvas.height);
    
    // Draw player (apply same camera transform)
    this.ctx.save();
    const camera = this.level.getCameraTransform();
    this.ctx.translate(-camera.x, -camera.y);
    this.player.draw(this.ctx);
    this.ctx.restore();
  }
  
  public restart() {
    this.player.reset();
    this.level.reset();
    this.gameStore.resetGame();
  }
}
