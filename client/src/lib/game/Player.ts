import { InputManager } from './InputManager';
import { CollisionManager, GameObject } from './CollisionManager';
import { Platform } from './Platform';

export class Player implements GameObject {
  public x: number = 100;
  public y: number = 300;
  public width: number = 32;
  public height: number = 48;
  
  public velocityX: number = 0;
  public velocityY: number = 0;
  
  private speed: number = 300;
  private jumpPower: number = 600;
  private gravity: number = 1500;
  private friction: number = 0.8;
  
  public isOnGround: boolean = false;
  public isAlive: boolean = true;
  
  private animationFrame: number = 0;
  private animationTimer: number = 0;
  private direction: 'left' | 'right' = 'right';
  
  public update(deltaTime: number, platforms: Platform[], canvasHeight: number) {
    if (!this.isAlive) return;
    
    this.handleInput(deltaTime);
    this.applyGravity(deltaTime);
    this.applyFriction();
    this.updatePosition(deltaTime);
    this.checkPlatformCollisions(platforms);
    this.checkBoundaries(canvasHeight);
    this.updateAnimation(deltaTime);
  }
  
  private handleInput(deltaTime: number) {
    // Horizontal movement
    if (InputManager.isLeftPressed()) {
      this.velocityX = -this.speed;
      this.direction = 'left';
    } else if (InputManager.isRightPressed()) {
      this.velocityX = this.speed;
      this.direction = 'right';
    }
    
    // Jumping
    if (InputManager.isJumpPressed() && this.isOnGround) {
      this.velocityY = -this.jumpPower;
      this.isOnGround = false;
    }
  }
  
  private applyGravity(deltaTime: number) {
    this.velocityY += this.gravity * deltaTime;
  }
  
  private applyFriction() {
    if (this.isOnGround && !InputManager.isLeftPressed() && !InputManager.isRightPressed()) {
      this.velocityX *= this.friction;
      if (Math.abs(this.velocityX) < 10) {
        this.velocityX = 0;
      }
    }
  }
  
  private updatePosition(deltaTime: number) {
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
  }
  
  private checkPlatformCollisions(platforms: Platform[]) {
    this.isOnGround = false;
    
    for (const platform of platforms) {
      if (CollisionManager.checkCollision(this, platform)) {
        const collision = CollisionManager.checkCollisionSide(this, platform);
        
        if (collision.top && this.velocityY > 0) {
          this.y = platform.y - this.height;
          this.velocityY = 0;
          this.isOnGround = true;
        } else if (collision.bottom && this.velocityY < 0) {
          this.y = platform.y + platform.height;
          this.velocityY = 0;
        } else if (collision.left && this.velocityX > 0) {
          this.x = platform.x - this.width;
          this.velocityX = 0;
        } else if (collision.right && this.velocityX < 0) {
          this.x = platform.x + platform.width;
          this.velocityX = 0;
        }
      }
    }
  }
  
  private checkBoundaries(canvasHeight: number) {
    // Left boundary
    if (this.x < 0) {
      this.x = 0;
      this.velocityX = 0;
    }
    
    // Fall off the bottom
    if (this.y > canvasHeight + 100) {
      this.isAlive = false;
    }
  }
  
  private updateAnimation(deltaTime: number) {
    this.animationTimer += deltaTime;
    
    if (this.animationTimer > 0.1) {
      this.animationFrame = (this.animationFrame + 1) % 4;
      this.animationTimer = 0;
    }
  }
  
  public draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return;
    
    ctx.save();
    
    // Draw player as a pixel character
    ctx.fillStyle = '#FF6B35';
    
    // Body
    ctx.fillRect(this.x + 8, this.y + 16, 16, 24);
    
    // Head
    ctx.fillStyle = '#FCDC00';
    ctx.fillRect(this.x + 6, this.y + 4, 20, 16);
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x + 10, this.y + 8, 3, 3);
    ctx.fillRect(this.x + 19, this.y + 8, 3, 3);
    
    // Arms
    ctx.fillStyle = '#FF6B35';
    if (this.direction === 'right') {
      ctx.fillRect(this.x + 24, this.y + 18, 6, 12);
      ctx.fillRect(this.x + 2, this.y + 18, 6, 12);
    } else {
      ctx.fillRect(this.x + 2, this.y + 18, 6, 12);
      ctx.fillRect(this.x + 24, this.y + 18, 6, 12);
    }
    
    // Legs
    ctx.fillStyle = '#5C94FC';
    if (Math.abs(this.velocityX) > 50 && this.isOnGround) {
      // Running animation
      const offset = this.animationFrame % 2 === 0 ? 2 : -2;
      ctx.fillRect(this.x + 8, this.y + 40, 6, 8);
      ctx.fillRect(this.x + 18 + offset, this.y + 40, 6, 8);
    } else {
      // Standing
      ctx.fillRect(this.x + 8, this.y + 40, 6, 8);
      ctx.fillRect(this.x + 18, this.y + 40, 6, 8);
    }
    
    ctx.restore();
  }
  
  public reset() {
    this.x = 100;
    this.y = 300;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isOnGround = false;
    this.isAlive = true;
  }
}
