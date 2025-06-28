import { Platform } from './Platform';
import { Coin } from './Coin';

export class Level {
  public platforms: Platform[] = [];
  public coins: Coin[] = [];
  private cameraX: number = 0;
  private cameraY: number = 0;
  
  constructor() {
    this.generateLevel();
  }
  
  private generateLevel() {
    // Clear existing objects
    this.platforms = [];
    this.coins = [];
    
    // Ground platforms
    this.platforms.push(new Platform(0, 500, 400, 100, 'ground'));
    this.platforms.push(new Platform(600, 450, 200, 150, 'ground'));
    this.platforms.push(new Platform(1000, 400, 300, 200, 'ground'));
    this.platforms.push(new Platform(1500, 350, 200, 250, 'ground'));
    this.platforms.push(new Platform(1900, 300, 400, 300, 'ground'));
    
    // Floating platforms
    this.platforms.push(new Platform(450, 400, 128, 32, 'platform'));
    this.platforms.push(new Platform(350, 300, 96, 32, 'platform'));
    this.platforms.push(new Platform(800, 300, 128, 32, 'platform'));
    this.platforms.push(new Platform(1200, 250, 96, 32, 'platform'));
    this.platforms.push(new Platform(1400, 200, 128, 32, 'platform'));
    this.platforms.push(new Platform(1700, 150, 96, 32, 'platform'));
    
    // Brick blocks
    this.platforms.push(new Platform(500, 250, 32, 32, 'brick'));
    this.platforms.push(new Platform(532, 250, 32, 32, 'brick'));
    this.platforms.push(new Platform(900, 200, 32, 32, 'brick'));
    this.platforms.push(new Platform(1100, 150, 32, 32, 'brick'));
    this.platforms.push(new Platform(1600, 100, 32, 32, 'brick'));
    
    // Place coins
    this.coins.push(new Coin(200, 460));
    this.coins.push(new Coin(380, 360));
    this.coins.push(new Coin(480, 360));
    this.coins.push(new Coin(700, 410));
    this.coins.push(new Coin(830, 260));
    this.coins.push(new Coin(516, 210));
    this.coins.push(new Coin(1050, 360));
    this.coins.push(new Coin(1230, 210));
    this.coins.push(new Coin(1430, 160));
    this.coins.push(new Coin(1730, 110));
    this.coins.push(new Coin(1630, 60));
    this.coins.push(new Coin(2100, 250));
  }
  
  public updateCamera(playerX: number, playerY: number, canvasWidth: number, canvasHeight: number) {
    // Follow player horizontally
    this.cameraX = playerX - canvasWidth / 2;
    
    // Clamp camera to level boundaries
    this.cameraX = Math.max(0, this.cameraX);
    this.cameraX = Math.min(2400 - canvasWidth, this.cameraX); // Level width - canvas width
    
    // Keep camera vertically centered with slight offset
    this.cameraY = playerY - canvasHeight / 2 + 50;
    this.cameraY = Math.max(-200, Math.min(200, this.cameraY));
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
    this.generateLevel();
    this.cameraX = 0;
    this.cameraY = 0;
  }
}
