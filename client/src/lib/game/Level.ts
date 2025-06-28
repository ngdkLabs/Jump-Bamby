import { Platform } from './Platform';
import { Coin } from './Coin';
import { Enemy, EnemyType } from './Enemy';
import { PowerUp, PowerUpType } from './PowerUp';

export class Level {
  public platforms: Platform[] = [];
  public coins: Coin[] = [];
  public enemies: Enemy[] = [];
  public powerUps: PowerUp[] = [];
  private cameraX: number = 0;
  private cameraY: number = 0;
  
  // Endless generation
  private worldPosition: number = 0;
  private lastGeneratedX: number = 0;
  private chunkSize: number = 800;
  private difficultyScore: number = 0;
  
  constructor() {
    this.generateInitialLevel();
  }
  
  private generateInitialLevel() {
    // Clear existing objects
    this.platforms = [];
    this.coins = [];
    this.enemies = [];
    this.powerUps = [];
    
    // Generate initial ground
    this.platforms.push(new Platform(0, 500, 800, 100, 'ground'));
    
    // Generate first few chunks
    for (let i = 0; i < 3; i++) {
      this.generateChunk(i * this.chunkSize);
    }
    
    this.lastGeneratedX = 3 * this.chunkSize;
  }
  
  private generateChunk(startX: number) {
    const difficulty = Math.min(this.difficultyScore / 50000, 10); // Max difficulty at 500k score
    
    // Ground platforms with gaps based on difficulty
    const gapChance = Math.min(0.1 + difficulty * 0.05, 0.4);
    let currentX = startX;
    
    while (currentX < startX + this.chunkSize) {
      if (Math.random() < gapChance) {
        // Create gap
        const gapSize = 100 + Math.random() * (100 + difficulty * 20);
        currentX += gapSize;
      } else {
        // Create ground platform
        const platformWidth = 200 + Math.random() * 300;
        this.platforms.push(new Platform(currentX, 500, platformWidth, 100, 'ground'));
        currentX += platformWidth;
      }
    }
    
    // Floating platforms
    const platformCount = 3 + Math.floor(difficulty * 2);
    for (let i = 0; i < platformCount; i++) {
      const x = startX + Math.random() * this.chunkSize;
      const y = 200 + Math.random() * 200;
      const width = 64 + Math.random() * 128;
      const type = Math.random() < 0.3 ? 'brick' : 'platform';
      this.platforms.push(new Platform(x, y, width, 32, type));
    }
    
    // Coins
    const coinCount = 5 + Math.floor(difficulty);
    for (let i = 0; i < coinCount; i++) {
      const x = startX + Math.random() * this.chunkSize;
      const y = 100 + Math.random() * 350;
      this.coins.push(new Coin(x, y));
    }
    
    // Enemies
    const enemyCount = Math.floor(1 + difficulty * 0.8);
    for (let i = 0; i < enemyCount; i++) {
      const x = startX + Math.random() * this.chunkSize;
      let y: number;
      let type: EnemyType;
      
      if (Math.random() < 0.4) {
        // Flying bird
        type = 'bird';
        y = 50 + Math.random() * 150;
      } else if (Math.random() < 0.6) {
        // Ground snail
        type = 'snail';
        y = 484; // On ground
      } else {
        // Ground penguin
        type = 'penguin';
        y = 472; // On ground
      }
      
      this.enemies.push(new Enemy(x, y, type));
    }
    
    // Power-ups (rare)
    if (Math.random() < 0.1 + difficulty * 0.02) {
      const x = startX + Math.random() * this.chunkSize;
      const y = 100 + Math.random() * 200;
      
      let type: PowerUpType;
      const rand = Math.random();
      if (rand < 0.5) type = 'x2';
      else if (rand < 0.8) type = 'x3';
      else if (rand < 0.95) type = 'x5';
      else type = 'x10';
      
      this.powerUps.push(new PowerUp(x, y, type));
    }
  }
  
  public updateCamera(playerX: number, playerY: number, canvasWidth: number, canvasHeight: number) {
    // Follow player horizontally
    this.cameraX = playerX - canvasWidth / 2;
    
    // Keep camera moving forward (endless runner)
    this.cameraX = Math.max(0, this.cameraX);
    this.worldPosition = this.cameraX;
    
    // Generate new chunks as needed
    if (this.cameraX + canvasWidth > this.lastGeneratedX - this.chunkSize) {
      this.generateChunk(this.lastGeneratedX);
      this.lastGeneratedX += this.chunkSize;
    }
    
    // Clean up old objects that are too far behind
    this.cleanupOldObjects();
    
    // Keep camera vertically centered with slight offset
    this.cameraY = playerY - canvasHeight / 2 + 50;
    this.cameraY = Math.max(-200, Math.min(200, this.cameraY));
  }
  
  private cleanupOldObjects() {
    const cleanupDistance = -500; // Remove objects 500px behind camera
    
    this.platforms = this.platforms.filter(platform => platform.x > this.cameraX + cleanupDistance);
    this.coins = this.coins.filter(coin => !coin.collected && coin.x > this.cameraX + cleanupDistance);
    this.enemies = this.enemies.filter(enemy => enemy.active && enemy.x > this.cameraX + cleanupDistance);
    this.powerUps = this.powerUps.filter(powerUp => !powerUp.collected && powerUp.x > this.cameraX + cleanupDistance);
  }
  
  public updateDifficulty(score: number) {
    this.difficultyScore = score;
  }
  
  public draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    ctx.save();
    
    // Apply camera transform
    ctx.translate(-this.cameraX, -this.cameraY);
    
    // Draw background
    this.drawBackground(ctx, canvasWidth, canvasHeight);
    
    // Draw platforms
    for (const platform of this.platforms) {
      platform.draw(ctx);
    }
    
    // Draw coins
    for (const coin of this.coins) {
      coin.draw(ctx);
    }
    
    // Draw enemies
    for (const enemy of this.enemies) {
      enemy.draw(ctx);
    }
    
    // Draw power-ups
    for (const powerUp of this.powerUps) {
      powerUp.draw(ctx);
    }
    
    ctx.restore();
  }
  
  private drawBackground(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, -200, 0, 600);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#6B8CFF');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(this.cameraX - 100, this.cameraY - 200, canvasWidth + 200, canvasHeight + 400);
    
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Simple cloud drawing function
    const drawCloud = (x: number, y: number, scale: number = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      
      // Draw cloud as overlapping circles
      ctx.beginPath();
      ctx.arc(-20, 0, 15, 0, Math.PI * 2);
      ctx.arc(-10, -10, 18, 0, Math.PI * 2);
      ctx.arc(10, -8, 16, 0, Math.PI * 2);
      ctx.arc(20, 0, 12, 0, Math.PI * 2);
      ctx.arc(0, 8, 20, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };
    
    // Draw multiple clouds at different positions
    drawCloud(200, 100, 0.8);
    drawCloud(600, 80, 1.2);
    drawCloud(1100, 120, 0.9);
    drawCloud(1600, 90, 1.1);
    drawCloud(2000, 110, 0.7);
  }
  
  public getCameraTransform() {
    return { x: this.cameraX, y: this.cameraY };
  }
  
  public reset() {
    this.generateInitialLevel();
    this.cameraX = 0;
    this.cameraY = 0;
    this.worldPosition = 0;
    this.lastGeneratedX = 3 * this.chunkSize;
    this.difficultyScore = 0;
  }
}
