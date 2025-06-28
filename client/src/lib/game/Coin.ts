import { GameObject, CollisionManager } from './CollisionManager';
import { Player } from './Player';

export class Coin implements GameObject {
  public x: number;
  public y: number;
  public width: number = 16;
  public height: number = 16;
  public collected: boolean = false;
  
  private animationFrame: number = 0;
  private animationTimer: number = 0;
  private bobOffset: number = 0;
  private bobTimer: number = 0;
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  
  public update(deltaTime: number, player: Player): boolean {
    if (this.collected) return false;
    
    // Update animation
    this.animationTimer += deltaTime;
    if (this.animationTimer > 0.15) {
      this.animationFrame = (this.animationFrame + 1) % 8;
      this.animationTimer = 0;
    }
    
    // Bob up and down
    this.bobTimer += deltaTime * 3;
    this.bobOffset = Math.sin(this.bobTimer) * 3;
    
    // Check collision with player
    if (CollisionManager.checkCollision(this, player)) {
      this.collected = true;
      return true; // Signal that coin was collected
    }
    
    return false;
  }
  
  public draw(ctx: CanvasRenderingContext2D) {
    if (this.collected) return;
    
    ctx.save();
    
    const drawY = this.y + this.bobOffset;
    
    // Draw coin with spinning animation
    const spinPhase = this.animationFrame / 8;
    const scaleX = Math.cos(spinPhase * Math.PI * 2);
    
    ctx.translate(this.x + this.width / 2, drawY + this.height / 2);
    ctx.scale(Math.abs(scaleX), 1);
    
    // Outer ring
    ctx.fillStyle = '#FCDC00';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    // Inner circle
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height - 4);
    
    // Center symbol
    ctx.fillStyle = '#FCDC00';
    if (Math.abs(scaleX) > 0.3) {
      ctx.fillRect(-2, -6, 4, 12);
      ctx.fillRect(-6, -2, 12, 4);
    }
    
    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.restore();
  }
  
  public reset() {
    this.collected = false;
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.bobOffset = 0;
    this.bobTimer = 0;
  }
}
