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
    
    // Update level difficulty based on score
    this.level.updateDifficulty(this.gameStore.score);
    
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
        const baseScore = 100;
        const cappedScore = Math.min(this.gameStore.score + baseScore, 1000000000);
        this.gameStore.addScore(cappedScore - this.gameStore.score);
        this.audioStore.playSuccess();
      }
    }
    
    // Update enemies
    for (const enemy of this.level.enemies) {
      if (enemy.update(deltaTime, this.player)) {
        // Enemy hit player - check if damage can be taken
        if (this.player.takeDamage()) {
          this.gameStore.loseLife();
          this.audioStore.playHit();
          
          if (this.gameStore.lives <= 0) {
            this.gameStore.gameOver();
          }
        }
      }
    }
    
    // Update power-ups
    for (const powerUp of this.level.powerUps) {
      if (powerUp.update(deltaTime, this.player)) {
        // Power-up collected
        const baseScore = 500 * powerUp.multiplier;
        const cappedScore = Math.min(this.gameStore.score + baseScore, 1000000000);
        this.gameStore.addScore(cappedScore - this.gameStore.score);
        this.audioStore.playSuccess();
      }
    }

    // Update hearts
    for (const heart of this.level.hearts) {
      if (heart.update(deltaTime, this.player)) {
        // Heart collected - gain extra life
        this.gameStore.gainLife();
        this.audioStore.playSuccess();
      }
    }
    
    // Update camera
    this.level.updateCamera(this.player.x, this.player.y, this.canvas.width, this.canvas.height);
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
