import { GameObject, CollisionManager } from './CollisionManager';
import { Player } from './Player';
import chikenImg from './chikenImg';

export type EnemyType = 'snail' | 'penguin' | 'bird' | 'turtle' | 'chiken';

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
      case 'turtle':
        this.width = 28;
        this.height = 18;
        this.speed = 40;
        break;
      case 'chiken':
        this.width = 24;
        this.height = 32;
        this.speed = 100;
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
        
      case 'turtle':
        // Slow horizontal movement, kadang balik arah
        this.x += this.direction * this.speed * deltaTime;
        if (Math.random() < 0.003) {
          this.direction *= -1;
        }
        break;
      case 'chiken':
        // Chiken: lari zig-zag cepat
        this.x -= this.speed * deltaTime;
        this.bobTimer += deltaTime * 8;
        this.bobOffset = Math.sin(this.bobTimer) * 6;
        if (Math.random() < 0.01) {
          this.speed = 60 + Math.random() * 80;
        }
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
      case 'turtle':
        this.drawTurtle(ctx, drawY);
        break;
      case 'chiken':
        this.drawChiken(ctx, drawY);
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
    // Body (diperkecil sedikit)
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(this.x + 6, y + 6, 18, 12);
    
    // Head (diperkecil sedikit)
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(this.x + 2, y + 2, 10, 10);
    
    // Beak (diperkecil sedikit)
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(this.x - 2, y + 8, 5, 2);
    
    // Eye (diperkecil sedikit)
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + 7, y + 6, 2, 2);
    
    // Wings (diperkecil dan animasi flapping)
    ctx.fillStyle = '#191970';
    const wingFlap = this.animationFrame % 2 === 0 ? 2 : -2;
    ctx.fillRect(this.x + 12, y + wingFlap, 8, 5);
    ctx.fillRect(this.x + 15, y + 3 + wingFlap, 10, 5);
    
    // Tail (diperkecil)
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(this.x + 20, y + 10, 4, 4);
  }
  
  private drawTurtle(ctx: CanvasRenderingContext2D, y: number) {
    // Body
    ctx.fillStyle = '#228B22';
    ctx.fillRect(this.x + 4, y + 6, 20, 8);
    // Shell
    ctx.fillStyle = '#556B2F';
    ctx.beginPath();
    ctx.ellipse(this.x + 14, y + 10, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.fillStyle = '#228B22';
    ctx.fillRect(this.x, y + 8, 6, 6);
    // Eyes
    ctx.fillStyle = '#FFF';
    ctx.fillRect(this.x + 2, y + 9, 2, 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + 3, y + 10, 1, 1);
    // Legs
    ctx.fillStyle = '#228B22';
    ctx.fillRect(this.x + 6, y + 14, 4, 2);
    ctx.fillRect(this.x + 18, y + 14, 4, 2);
  }
  
  private drawChiken(ctx: CanvasRenderingContext2D, y: number) {
    // Gambar gif chiken
    if (chikenImg && chikenImg.complete) {
      ctx.drawImage(chikenImg, this.x, y, this.width, this.height);
    } else {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(this.x, y, this.width, this.height);
    }
  }
  
  public reset() {
    this.active = true;
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.bobOffset = 0;
    this.bobTimer = 0;
  }
  
  public kill(playDeadMinion?: () => void) {
    this.active = false;
    if (playDeadMinion) playDeadMinion();
  }
}