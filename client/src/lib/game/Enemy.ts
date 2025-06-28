import { GameObject, CollisionManager } from './CollisionManager';
import { Player } from './Player';

export type EnemyType = 'snail' | 'penguin' | 'bird';

export class Enemy implements GameObject {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public type: EnemyType;
  public active: boolean = true;
  
  private speed: number;
  private animationFrame: number = 0;
  private animationTimer: number = 0;
  private direction: number = 1; // 1 for right, -1 for left
  private bobOffset: number = 0;
  private bobTimer: number = 0;
  
  constructor(x: number, y: number, type: EnemyType) {
    this.x = x;
    this.y = y;
    this.type = type;
    
    switch (type) {
      case 'snail':
        this.width = 24;
        this.height = 16;
        this.speed = 30;
        break;
      case 'penguin':
        this.width = 20;
        this.height = 28;
        this.speed = 60;
        break;
      case 'bird':
        this.width = 20;
        this.height = 16;
        this.speed = 80;
        break;
    }
  }
  
  public update(deltaTime: number, player: Player): boolean {
    if (!this.active) return false;
    
    // Update animation
    this.animationTimer += deltaTime;
    if (this.animationTimer > 0.2) {
      this.animationFrame = (this.animationFrame + 1) % 4;
      this.animationTimer = 0;
    }
    
    // Movement patterns
    switch (this.type) {
      case 'snail':
        // Slow horizontal movement
        this.x -= this.speed * deltaTime;
        break;
        
      case 'penguin':
        // Waddle movement with direction changes
        this.x += this.direction * this.speed * deltaTime;
        if (Math.random() < 0.005) { // Random chance to change direction
          this.direction *= -1;
        }
        break;
        
      case 'bird':
        // Flying pattern with bobbing
        this.x -= this.speed * deltaTime;
        this.bobTimer += deltaTime * 4;
        this.bobOffset = Math.sin(this.bobTimer) * 10;
        break;
    }
    
    // Check collision with player
    if (CollisionManager.checkCollision(this, player)) {
      this.active = false;
      return true; // Signal collision
    }
    
    // Remove if too far left
    if (this.x < -100) {
      this.active = false;
    }
    
    return false;
  }
  
  public draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    
    ctx.save();
    
    const drawY = this.type === 'bird' ? this.y + this.bobOffset : this.y;
    
    switch (this.type) {
      case 'snail':
        this.drawSnail(ctx, drawY);
        break;
      case 'penguin':
        this.drawPenguin(ctx, drawY);
        break;
      case 'bird':
        this.drawBird(ctx, drawY);
        break;
    }
    
    ctx.restore();
  }
  
  private drawSnail(ctx: CanvasRenderingContext2D, y: number) {
    // Shell
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(this.x + 8, y, 16, 12);
    
    // Shell spiral
    ctx.fillStyle = '#654321';
    ctx.fillRect(this.x + 12, y + 2, 8, 8);
    ctx.fillRect(this.x + 14, y + 4, 4, 4);
    
    // Body
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(this.x, y + 8, 12, 8);
    
    // Eyes (animate)
    ctx.fillStyle = '#000';
    const eyeOffset = this.animationFrame % 2;
    ctx.fillRect(this.x + 2, y + 8 + eyeOffset, 2, 2);
    ctx.fillRect(this.x + 6, y + 8 + eyeOffset, 2, 2);
  }
  
  private drawPenguin(ctx: CanvasRenderingContext2D, y: number) {
    // Body (black)
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + 4, y + 4, 12, 20);
    
    // Belly (white)
    ctx.fillStyle = '#FFF';
    ctx.fillRect(this.x + 6, y + 8, 8, 12);
    
    // Head
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + 6, y, 8, 8);
    
    // Beak
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(this.x + 8, y + 4, 4, 2);
    
    // Eyes
    ctx.fillStyle = '#FFF';
    ctx.fillRect(this.x + 7, y + 2, 2, 2);
    ctx.fillRect(this.x + 11, y + 2, 2, 2);
    
    // Feet (animate waddle)
    ctx.fillStyle = '#FFA500';
    const footOffset = this.animationFrame % 2 === 0 ? 1 : -1;
    ctx.fillRect(this.x + 4 + footOffset, y + 24, 3, 4);
    ctx.fillRect(this.x + 13 - footOffset, y + 24, 3, 4);
  }
  
  private drawBird(ctx: CanvasRenderingContext2D, y: number) {
    // Body
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(this.x + 4, y + 4, 12, 8);
    
    // Head
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(this.x + 2, y + 2, 8, 8);
    
    // Beak
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(this.x, y + 4, 4, 2);
    
    // Eye
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + 4, y + 4, 2, 2);
    
    // Wings (animate flapping)
    ctx.fillStyle = '#191970';
    const wingFlap = this.animationFrame % 2 === 0 ? 2 : -2;
    ctx.fillRect(this.x + 6, y + wingFlap, 6, 4);
    ctx.fillRect(this.x + 8, y + 2 + wingFlap, 8, 4);
    
    // Tail
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(this.x + 16, y + 6, 4, 4);
  }
  
  public reset() {
    this.active = true;
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.bobOffset = 0;
    this.bobTimer = 0;
  }
}