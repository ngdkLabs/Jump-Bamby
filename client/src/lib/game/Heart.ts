import { GameObject } from './CollisionManager';
import { Player } from './Player';

export class Heart implements GameObject {
  public x: number;
  public y: number;
  public width: number = 20;
  public height: number = 18;
  public collected: boolean = false;

  private animationFrame: number = 0;
  private animationTimer: number = 0;
  private bobOffset: number = 0;
  private bobTimer: number = 0;
  private glowIntensity: number = 0;
  private glowTimer: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public update(deltaTime: number, player: Player): boolean {
    if (this.collected) return false;

    // Update animations
    this.animationTimer += deltaTime;
    this.bobTimer += deltaTime;
    this.glowTimer += deltaTime;

    // Animation cycling
    if (this.animationTimer >= 0.2) {
      this.animationFrame = (this.animationFrame + 1) % 4;
      this.animationTimer = 0;
    }

    // Bobbing motion
    this.bobOffset = Math.sin(this.bobTimer * 3) * 3;

    // Glow effect
    this.glowIntensity = (Math.sin(this.glowTimer * 4) + 1) / 2;

    // Check collision with player
    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    ) {
      this.collected = true;
      return true; // Heart collected
    }

    return false;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.collected) return;

    ctx.save();

    const drawY = this.y + this.bobOffset;

    // Draw glow effect
    const glowRadius = 30 + this.glowIntensity * 10;
    const gradient = ctx.createRadialGradient(
      this.x + this.width / 2, drawY + this.height / 2, 0,
      this.x + this.width / 2, drawY + this.height / 2, glowRadius
    );
    gradient.addColorStop(0, `rgba(255, 192, 203, ${0.4 * this.glowIntensity})`);
    gradient.addColorStop(0.5, `rgba(255, 105, 180, ${0.2 * this.glowIntensity})`);
    gradient.addColorStop(1, 'rgba(255, 105, 180, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
      this.x - glowRadius / 2 + this.width / 2,
      drawY - glowRadius / 2 + this.height / 2,
      glowRadius,
      glowRadius
    );

    // Draw heart shape using pixel art style
    ctx.fillStyle = '#FF1493'; // Deep pink
    
    // Heart top left circle
    ctx.fillRect(this.x + 2, drawY + 2, 6, 6);
    ctx.fillRect(this.x + 4, drawY, 2, 2);
    
    // Heart top right circle  
    ctx.fillRect(this.x + 10, drawY + 2, 6, 6);
    ctx.fillRect(this.x + 12, drawY, 2, 2);
    
    // Heart middle section
    ctx.fillRect(this.x + 2, drawY + 8, 14, 4);
    
    // Heart bottom triangle
    ctx.fillRect(this.x + 4, drawY + 12, 10, 2);
    ctx.fillRect(this.x + 6, drawY + 14, 6, 2);
    ctx.fillRect(this.x + 8, drawY + 16, 2, 2);

    // Add highlight
    ctx.fillStyle = '#FFB6C1'; // Light pink highlight
    ctx.fillRect(this.x + 3, drawY + 3, 2, 2);
    ctx.fillRect(this.x + 11, drawY + 3, 2, 2);
    ctx.fillRect(this.x + 3, drawY + 8, 12, 1);

    // Add sparkle effect
    if (this.glowIntensity > 0.7) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(this.x - 2, drawY + 8, 1, 1);
      ctx.fillRect(this.x + 18, drawY + 6, 1, 1);
      ctx.fillRect(this.x + 8, drawY - 3, 1, 1);
      ctx.fillRect(this.x + 6, drawY + 20, 1, 1);
    }

    ctx.restore();
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