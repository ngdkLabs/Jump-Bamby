import { InputManager } from './InputManager';
import { CollisionManager, GameObject } from './CollisionManager';
import { Platform } from './Platform';
import caracterImg from '@/img/caracter.png';
import gunImg from './gunImg';
import { useAudio } from '../stores/useAudio';

export type WeaponType = 'gun' | 'bomb';

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
  public direction: 'left' | 'right' = 'right';
  
  // Double jump functionality
  private jumpCount: number = 0;
  private maxJumps: number = 2;
  private lastJumpTime: number = 0;
  private jumpKeyPressed: boolean = false;
  
  // Invincibility system
  public isInvincible: boolean = false;
  private invincibilityTimer: number = 0;
  private invincibilityDuration: number = 2.0; // 2 seconds

  // --- Tambahan untuk respawn di platform terakhir ---
  public lastSafeX: number = 100;
  public lastSafeY: number = 300;

  public inventory: { gun: number; bomb: number } = { gun: 0, bomb: 0 };
  public currentWeapon: WeaponType | null = null;

  public score: number = 0;

  private static image: HTMLImageElement | null = null;

  constructor() {
    if (!Player.image) {
      const img = new window.Image();
      img.src = caracterImg;
      Player.image = img;
    }
  }

  public obtainWeapon(weapon: WeaponType) {
    if (!weapon) return;
    // Tambah peluru/bom secara random 1-5 per claim
    const amount = Math.floor(Math.random() * 5) + 1; // 1-5
    if (weapon === 'gun') {
      this.inventory.gun += amount;
      this.currentWeapon = 'gun';
    } else if (weapon === 'bomb') {
      this.inventory.bomb += amount;
      this.currentWeapon = 'bomb';
    }
  }

  public useWeapon(): boolean {
    // Hanya bisa digunakan jika stok > 0, lalu kurangi stok
    if (this.currentWeapon === 'gun' && this.inventory.gun > 0) {
      this.inventory.gun--;
      return true;
    } else if (this.currentWeapon === 'bomb' && this.inventory.bomb > 0) {
      this.inventory.bomb--;
      return true;
    }
    return false;
  }

  public switchWeapon(weapon: WeaponType) {
    if (!weapon) return;
    if (this.inventory[weapon as 'gun' | 'bomb'] > 0) {
      this.currentWeapon = weapon;
    }
  }
  
  public update(deltaTime: number, platforms: Platform[], canvasHeight: number) {
    if (!this.isAlive) return;
    
    // Update invincibility
    if (this.isInvincible) {
      this.invincibilityTimer -= deltaTime;
      if (this.invincibilityTimer <= 0) {
        this.isInvincible = false;
      }
    }
    
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
    
    // Jumping with double jump
    const jumpPressed = InputManager.isJumpPressed();
    const currentTime = performance.now();
    
    if (jumpPressed && !this.jumpKeyPressed) {
      // Jump key just pressed
      if (this.isOnGround) {
        // First jump from ground
        this.velocityY = -this.jumpPower;
        this.isOnGround = false;
        this.jumpCount = 1;
        this.lastJumpTime = currentTime;
        this.playJumpSound();
      } else if (this.jumpCount < this.maxJumps) {
        // Double jump in air
        this.velocityY = -this.jumpPower * 1.2; // Double jump is slightly higher
        this.jumpCount = 2;
        this.lastJumpTime = currentTime;
        this.playJumpSound();
      }
    }
    
    this.jumpKeyPressed = jumpPressed;
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
  
  // Mengecek apakah ada platform di bawah kaki karakter (dengan margin toleransi)
  private isPlatformBelow(platforms: Platform[], margin: number = 4): boolean {
    const footY = this.y + this.height + margin;
    for (const platform of platforms) {
      // Cek jika posisi X karakter overlap dengan platform dan posisi Y tepat di bawah kaki
      if (
        this.x + this.width > platform.x &&
        this.x < platform.x + platform.width &&
        footY >= platform.y &&
        footY <= platform.y + platform.height
      ) {
        return true;
      }
    }
    return false;
  }

  private checkPlatformCollisions(platforms: Platform[]) {
    this.isOnGround = false;
    let landed = false;
    for (const platform of platforms) {
      if (CollisionManager.checkCollision(this, platform)) {
        const collision = CollisionManager.checkCollisionSide(this, platform);
        if (collision.top && this.velocityY > 0) {
          this.y = platform.y - this.height;
          this.velocityY = 0;
          this.isOnGround = true;
          this.jumpCount = 0; // Reset jump count when landing
          // Simpan posisi platform terakhir saat landing
          this.lastSafeX = this.x;
          this.lastSafeY = this.y;
          landed = true;
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
    // Jika tidak tabrakan, cek apakah ada platform di bawah kaki
    if (!this.isOnGround && this.isPlatformBelow(platforms)) {
      this.isOnGround = true;
      this.velocityY = 0;
      this.jumpCount = 0;
      // Hapus update lastSafeX/lastSafeY di sini agar tidak tersimpan saat di gap
    }
  }
  
  private checkBoundaries(canvasHeight: number) {
    // Left boundary
    if (this.x < 0) {
      this.x = 0;
      this.velocityX = 0;
    }
    // Fall off the bottom (mati jika benar-benar jatuh ke gap)
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
    // Flashing effect during invincibility
    if (this.isInvincible) {
      const flashRate = 10; // flashes per second
      const isVisible = Math.floor(performance.now() / (1000 / flashRate)) % 2 === 0;
      if (!isVisible) {
        ctx.restore();
        return;
      }
      ctx.globalAlpha = 0.7;
    }
    // Draw double jump indicator if available
    if (!this.isOnGround && this.jumpCount < this.maxJumps) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y - 10, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5C94FC';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y - 10, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Ganti gambar karakter
    let weaponImg = Player.image;
    if (this.currentWeapon === 'gun' && gunImg && gunImg.complete) {
      weaponImg = Player.image;
    }
    if (weaponImg && weaponImg.complete) {
      ctx.drawImage(weaponImg, this.x, this.y, this.width, this.height);
      // Jika pegang gun, gambar senjata di tangan
      if (this.currentWeapon === 'gun' && gunImg && gunImg.complete) {
        // Posisi senjata di tangan kanan karakter
        const gunWidth = this.width * 0.7;
        const gunHeight = this.height * 0.35;
        const gunX = this.direction === 'right' ? this.x + this.width - gunWidth * 0.9 : this.x + gunWidth * 0.2;
        const gunY = this.y + this.height * 0.55;
        ctx.save();
        if (this.direction === 'left') {
          ctx.translate(gunX + gunWidth / 2, gunY + gunHeight / 2);
          ctx.scale(-1, 1);
          ctx.translate(-(gunX + gunWidth / 2), -(gunY + gunHeight / 2));
        }
        ctx.drawImage(gunImg, gunX, gunY, gunWidth, gunHeight);
        ctx.restore();
      }
    } else {
      // fallback jika gambar belum siap
      ctx.fillStyle = '#FF6B35';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    ctx.restore();
  }
  
  public reset() {
    // Respawn di posisi platform terakhir jika ada
    this.x = this.lastSafeX ?? 100;
    this.y = this.lastSafeY ?? 300;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isOnGround = false;
    this.isAlive = true;
    this.jumpCount = 0;
    this.jumpKeyPressed = false;
    this.isInvincible = false;
    this.invincibilityTimer = 0;
    this.inventory.gun = 0;
    this.inventory.bomb = 0;
    this.score = 0;
  }
  
  public takeDamage() {
    if (!this.isInvincible) {
      this.isInvincible = true;
      this.invincibilityTimer = this.invincibilityDuration;
      return true; // Damage taken
    }
    return false; // No damage due to invincibility
  }

  private playJumpSound() {
    // Hindari error jika window belum siap
    if (typeof window !== 'undefined' && (window as any).useAudio) {
      (window as any).useAudio.getState().playJump();
    }
  }

  public getSpeed(): number {
    return this.speed;
  }
  public setSpeed(newSpeed: number) {
    this.speed = newSpeed;
  }
}
