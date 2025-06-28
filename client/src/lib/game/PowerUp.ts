import { GameObject, CollisionManager } from './CollisionManager';
import { Player } from './Player';

export type PowerUpType = 'x2' | 'x3' | 'x5' | 'x10';

export class PowerUp implements GameObject {
  public x: number;
  public y: number;
  public width: number = 24;
  public height: number = 24;
  public type: PowerUpType;
  public collected: boolean = false;
  public multiplier: number;
  
  private animationFrame: number = 0;
  private animationTimer: number = 0;
  private bobOffset: number = 0;
  private bobTimer: number = 0;
  private glowIntensity: number = 0;
  private glowTimer: number = 0;
  
  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x;
    this.y = y;
    this.type = type;
    
    switch (type) {
      case 'x2':
        this.multiplier = 2;
        break;
      case 'x3':
        this.multiplier = 3;
        break;
      case 'x5':
        this.multiplier = 5;
        break;
      case 'x10':
        this.multiplier = 10;
        break;
    }
  }
  
  public update(deltaTime: number, player: Player): boolean {
    if (this.collected) return false;
    
    // Update animations
    this.animationTimer += deltaTime;
    if (this.animationTimer > 0.1) {
      this.animationFrame = (this.animationFrame + 1) % 8;
      this.animationTimer = 0;
    }
    
    // Bob up and down
    this.bobTimer += deltaTime * 2;
    this.bobOffset = Math.sin(this.bobTimer) * 4;
    
    // Glow effect
    this.glowTimer += deltaTime * 3;
    this.glowIntensity = (Math.sin(this.glowTimer) + 1) / 2;
    
    // Move left with the level
    this.x -= 100 * deltaTime; // Same speed as level scrolling
    
    // Check collision with player
    if (CollisionManager.checkCollision(this, player)) {
      this.collected = true;
      return true; // Signal that power-up was collected
    }
    
    // Remove if too far left
    if (this.x < -50) {
      this.collected = true;
    }
    
    return false;
  }
  
  public draw(ctx: CanvasRenderingContext2D) {
    if (this.collected) return;
    
    ctx.save();
    
    const drawY = this.y + this.bobOffset;
    
    // Glow effect
    const glowAlpha = 0.3 + this.glowIntensity * 0.4;
    ctx.shadowColor = this.getGlowColor();
    ctx.shadowBlur = 10 + this.glowIntensity * 10;
    
    // Outer glow circle
    ctx.fillStyle = this.getGlowColor() + Math.floor(glowAlpha * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, drawY + this.height / 2, this.width / 2 + 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Main power-up body
    ctx.shadowBlur = 0;
    ctx.fillStyle = this.getMainColor();
    ctx.fillRect(this.x + 2, drawY + 2, this.width - 4, this.height - 4);
    
    // Inner highlight
    ctx.fillStyle = this.getHighlightColor();
    ctx.fillRect(this.x + 4, drawY + 4, this.width - 8, this.height - 8);
    
    // Multiplier text
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px "Courier New"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      this.type.toUpperCase(),
      this.x + this.width / 2,
      drawY + this.height / 2
    );
    
    // Sparkle effects
    const sparkleCount = 6;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (this.animationFrame + i) * (Math.PI * 2 / sparkleCount);
      const distance = 16 + Math.sin(this.glowTimer + i) * 4;
      const sparkleX = this.x + this.width / 2 + Math.cos(angle) * distance;
      const sparkleY = drawY + this.height / 2 + Math.sin(angle) * distance;
      
      ctx.fillStyle = '#FFF';
      ctx.fillRect(sparkleX - 1, sparkleY - 1, 2, 2);
    }
    
    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x + 2, drawY + 2, this.width - 4, this.height - 4);
    
    ctx.restore();
  }
  
  private getMainColor(): string {
    switch (this.type) {
      case 'x2':
        return '#32CD32'; // Green
      case 'x3':
        return '#1E90FF'; // Blue
      case 'x5':
        return '#FF69B4'; // Pink
      case 'x10':
        return '#FFD700'; // Gold
      default:
        return '#FFF';
    }
  }
  
  private getHighlightColor(): string {
    switch (this.type) {
      case 'x2':
        return '#90EE90';
      case 'x3':
        return '#87CEEB';
      case 'x5':
        return '#FFB6C1';
      case 'x10':
        return '#FFFFE0';
      default:
        return '#FFF';
    }
  }
  
  private getGlowColor(): string {
    switch (this.type) {
      case 'x2':
        return '#32CD32';
      case 'x3':
        return '#1E90FF';
      case 'x5':
        return '#FF69B4';
      case 'x10':
        return '#FFD700';
      default:
        return '#FFF';
    }
  }
  
  public reset() {
    this.collected = false;
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.bobOffset = 0;
    this.bobTimer = 0;
    this.glowIntensity = 0;
    this.glowTimer = 0;
  }
}