import { Player } from './Player';
import { Level } from './Level';
import { InputManager } from './InputManager';
import { useGameStore } from '../stores/useGameStore';
import { useAudio } from '../stores/useAudio';
import { Projectile } from './Projectile';
import { Explosion } from './Explosion';

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
  
  private projectiles: Projectile[] = [];
  private explosions: Explosion[] = [];
  
  private lastShootPressed: boolean = false;
  
  // Tambahkan state freeze
  private freezeTimer: number = 0;
  private freezeDuration: number = 2.0; // detik
  private originalSpeed: number | null = null;
  
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

    // Update freeze timer
    if (this.freezeTimer > 0) {
      this.freezeTimer -= deltaTime;
      if (this.freezeTimer <= 0 && this.originalSpeed !== null) {
        this.player.setSpeed(this.originalSpeed);
        this.originalSpeed = null;
      }
    }
    
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
        this.audioStore.playDead(); // hanya play dead saat game over
        this.gameStore.gameOver();
      } else {
        this.audioStore.playHit(); // play hit saat kehilangan nyawa saja
        // Respawn player
        this.player.reset();
      }
    }
    
    // Update coins
    for (const coin of this.level.coins) {
      if (coin.update(deltaTime, this.player)) {
        // Coin was collected
        const coinScore = coin.value;
        const cappedScore = Math.min(this.gameStore.score + coinScore, 1000000000);
        this.gameStore.addScore(cappedScore - this.gameStore.score);
        this.audioStore.playSuccess();
      }
    }
    
    // Update enemies
    for (const enemy of this.level.enemies) {
      if (enemy.update(deltaTime, this.player)) {
        // Enemy hit player - check if damage can be taken
        if (enemy.type === 'penguin' || enemy.type === 'turtle') {
          if (this.player.takeDamage()) {
            this.gameStore.loseLife();
            this.audioStore.playHit();
            // Freeze effect: slow player
            if (this.originalSpeed === null) {
              this.originalSpeed = this.player.getSpeed();
              this.player.setSpeed(this.originalSpeed * 0.5);
              this.freezeTimer = this.freezeDuration;
            }
            if (this.gameStore.lives <= 0) {
              this.gameStore.gameOver();
            }
          }
        } else {
          if (this.player.takeDamage()) {
            this.gameStore.loseLife();
            this.audioStore.playHit();
            if (this.gameStore.lives <= 0) {
              this.gameStore.gameOver();
            }
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
    
    // Update mystery boxes
    for (const box of this.level.mysteryBoxes) {
      if (box.checkCollision(this.player)) {
        box.onPickup(this.player);
        // TODO: play pickup sound if needed
      }
    }
    
    // Update projectiles
    for (const projectile of this.projectiles) {
      projectile.update(deltaTime, this.level.enemies);
      if (projectile.exploded) {
        this.explosions.push(new Explosion(projectile.explosionX, projectile.explosionY));
        const audio = useAudio.getState();
        if (audio.playExplosion) {
          audio.playExplosion();
        }
        projectile.exploded = false;
      }
    }
    this.projectiles = this.projectiles.filter(p => p.active);
    // Update explosions
    for (const explosion of this.explosions) {
      explosion.update(deltaTime);
    }
    this.explosions = this.explosions.filter(e => e.active);
    
    // Update camera
    this.level.updateCamera(this.player.x, this.player.y, this.canvas.width, this.canvas.height);
    
    // Update clouds
    this.level.updateClouds(deltaTime, this.level['cameraX'], this.canvas.width);
    
    // Handle shoot input (KeyZ)
    const shootPressed = InputManager.isKeyPressed('KeyZ');
    if (shootPressed && !this.lastShootPressed) {
      this.playerShoot();
    }
    this.lastShootPressed = shootPressed;
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
    // Draw weapon info above player (multi-weapon)
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y - 10;
    let info = [];
    if (this.player.inventory.gun > 0) info.push(`🔫 Gun x${this.player.inventory.gun}`);
    if (this.player.inventory.bomb > 0) info.push(`💣 Bomb x${this.player.inventory.bomb}`);
    if (info.length > 0) {
      this.ctx.save();
      this.ctx.font = 'bold 13px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#FFD700';
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 3;
      this.ctx.strokeText(info.join('   '), px, py);
      this.ctx.lineWidth = 1;
      this.ctx.fillText(info.join('   '), px, py);
      this.ctx.restore();
    }
    this.ctx.restore();
    
    // Draw projectiles
    this.ctx.save();
    this.ctx.translate(-camera.x, -camera.y);
    for (const projectile of this.projectiles) {
      projectile.draw(this.ctx);
    }
    // Draw explosions
    for (const explosion of this.explosions) {
      explosion.draw(this.ctx);
    }
    this.ctx.restore();
    
    // Freeze visual effect
    if (this.freezeTimer > 0) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.35;
      this.ctx.fillStyle = '#7ecbff';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
  }
  
  public playerShoot() {
    // Simpan tipe senjata sebelum useWeapon
    const weaponType = this.player.currentWeapon;
    if (weaponType && this.player.inventory[weaponType as 'gun' | 'bomb'] > 0) {
      const used = this.player.useWeapon();
      // Tetap spawn projectile jika useWeapon berhasil
      if (used) {
        const proj = new Projectile(
          this.player.x + this.player.width / 2,
          this.player.y + this.player.height / 2,
          this.player.direction,
          weaponType
        );
        this.projectiles.push(proj);
        const audio = useAudio.getState();
        if (weaponType === 'gun' && audio.playShoot) {
          audio.playShoot();
        }
        // Tidak ada efek suara saat melempar bom, hanya saat meledak
      }
      // Setelah menembak, jika stok senjata habis, otomatis pindah ke senjata lain
      if (this.player.inventory[weaponType as 'gun' | 'bomb'] === 0) {
        // Prioritas: jika bom habis, pindah ke gun jika ada, dan sebaliknya
        if (weaponType === 'bomb' && this.player.inventory.gun > 0) {
          this.player.currentWeapon = 'gun';
        } else if (weaponType === 'gun' && this.player.inventory.bomb > 0) {
          this.player.currentWeapon = 'bomb';
        } else {
          // Jika semua habis, set currentWeapon ke null
          this.player.currentWeapon = null;
        }
      }
    }
  }
  
  public restart() {
    this.player.reset();
    this.level.reset();
    this.gameStore.resetGame();
    // Musik: ulang dari awal jika ada backgroundMusic
    const audio = useAudio.getState();
    if (audio.backgroundMusic) {
      audio.backgroundMusic.currentTime = 0;
      audio.backgroundMusic.play();
    }
  }
}
