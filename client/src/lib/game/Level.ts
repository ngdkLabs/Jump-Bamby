import { Platform } from './Platform';
import { Coin } from './Coin';
import { Enemy, EnemyType } from './Enemy';
import { PowerUp, PowerUpType } from './PowerUp';
import { Heart } from './Heart';
import { MysteryBox, WeaponType } from './MysteryBox';
import { Decoration, DecorationType } from './Decoration';

export class Level {
  public platforms: Platform[] = [];
  public coins: Coin[] = [];
  public enemies: Enemy[] = [];
  public powerUps: PowerUp[] = [];
  public hearts: Heart[] = [];
  public mysteryBoxes: MysteryBox[] = [];
  public decorations: Decoration[] = [];
  private cameraX: number = 0;
  private cameraY: number = 0;
  
  // Endless generation
  private worldPosition: number = 0;
  private lastGeneratedX: number = 0;
  private chunkSize: number = 800;
  private difficultyScore: number = 0;
  
  private clouds: { x: number; y: number; scale: number; speed: number }[] = [
    { x: 200, y: 100, scale: 0.8, speed: 12 },
    { x: 600, y: 80, scale: 1.2, speed: 16 },
    { x: 1100, y: 120, scale: 0.9, speed: 10 },
    { x: 1600, y: 90, scale: 1.1, speed: 14 },
    { x: 2000, y: 110, scale: 0.7, speed: 11 },
  ];
  
  constructor() {
    this.generateInitialLevel();
  }
  
  private generateInitialLevel() {
    // Clear existing objects
    this.platforms = [];
    this.coins = [];
    this.enemies = [];
    this.powerUps = [];
    this.mysteryBoxes = [];
    this.decorations = [];
    
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
    let floatingTries = 0;
    let floatingAdded = 0;
    while (floatingAdded < platformCount && floatingTries < platformCount * 10) {
      const x = startX + Math.random() * this.chunkSize;
      const y = 200 + Math.random() * 200;
      const width = 64 + Math.random() * 128;
      const type = Math.random() < 0.3 ? 'brick' : 'platform';
      // Cek overlap dengan platform lain
      const overlap = this.platforms.some(p =>
        Math.abs(p.y - y) < 36 && // vertical overlap tolerance
        x < p.x + p.width && x + width > p.x
      );
      if (!overlap) {
        this.platforms.push(new Platform(x, y, width, 32, type));
        floatingAdded++;
      }
      floatingTries++;
    }
    
    // Coins
    const coinCount = 5 + Math.floor(difficulty);
    for (let i = 0; i < coinCount; i++) {
      const x = startX + Math.random() * this.chunkSize;
      const y = 100 + Math.random() * 350;
      this.coins.push(new Coin(x, y)); // type random, biarkan kosong
    }
    
    // Enemies
    const enemyCount = Math.floor(1 + difficulty * 0.8);
    for (let i = 0; i < enemyCount; i++) {
      const x = startX + Math.random() * this.chunkSize;
      let y: number;
      let type: EnemyType;
      const rand = Math.random();
      if (rand < 0.25) {
        // Flying bird
        type = 'bird';
        y = 50 + Math.random() * 150;
      } else if (rand < 0.4) {
        // Chiken minion (ground, zig-zag)
        type = 'chiken';
        y = 470 + Math.random() * 10;
      } else if (rand < 0.6) {
        // Ground snail
        type = 'snail';
        y = 484; // On ground
      } else if (rand < 0.8) {
        // Ground turtle
        type = 'turtle';
        y = 480; // On ground
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

    // Heart power-ups (extremely rare - in the sky)
    if (Math.random() < 0.015) { // 1.5% chance, very rare
      const x = startX + Math.random() * this.chunkSize;
      const y = 40 + Math.random() * 80; // High in the sky
      
      this.hearts.push(new Heart(x, y));
    }
    
    // Mystery Boxes (lebih jarang)
    if (Math.random() < 0.5) { // 50% chance per chunk
      let tryCount = 0;
      let found = false;
      let x = 0, y = 0, weapon: WeaponType = 'gun';
      while (!found && tryCount < 10) {
        x = startX + Math.random() * this.chunkSize;
        y = 100 + Math.random() * 300;
        weapon = Math.random() < 0.5 ? 'bomb' : 'gun';
        // Cek overlap dengan platform brick
        const overlap = this.platforms.some(p => p.type === 'brick' &&
          x < p.x + p.width && x + 32 > p.x &&
          y < p.y + p.height && y + 32 > p.y
        );
        if (!overlap) found = true;
        tryCount++;
      }
      if (found) {
        this.mysteryBoxes.push(new MysteryBox(x, y, weapon));
      }
    }
    
    // Tambahkan dekorasi pohon di ground, lebih jarang dan tidak di area gap
    // Dapatkan semua platform ground di chunk ini
    const groundPlatforms = this.platforms.filter(p => p.type === 'ground' && p.x >= startX && p.x < startX + this.chunkSize);
    // Kurangi jumlah pohon, misal 0-1 pohon per platform
    for (const platform of groundPlatforms) {
      if (Math.random() < 0.5) { // 50% chance per platform
        // Pohon hanya muncul di atas platform ground, tidak di gap
        const margin = 40;
        const x = platform.x + margin + Math.random() * (platform.width - 2 * margin);
        const y = platform.y - 32;
        this.decorations.push(new Decoration(x, y, 'tree', 1 + Math.random() * 0.5));
      }
    }
    // Grass di ground (hapus, tidak ada grass lagi)
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
    const cleanupDistance = -2000; // Diperbesar agar platform tidak cepat hilang
    this.platforms = this.platforms.filter(platform => platform.x > this.cameraX + cleanupDistance);
    this.coins = this.coins.filter(coin => !coin.collected && coin.x > this.cameraX + cleanupDistance);
    this.enemies = this.enemies.filter(enemy => enemy.active && enemy.x > this.cameraX + cleanupDistance);
    this.powerUps = this.powerUps.filter(powerUp => !powerUp.collected && powerUp.x > this.cameraX + cleanupDistance);
    this.hearts = this.hearts.filter(heart => !heart.collected && heart.x > this.cameraX + cleanupDistance);
    this.mysteryBoxes = this.mysteryBoxes.filter(box => box.isActive && box.x > this.cameraX + cleanupDistance);
    this.decorations = this.decorations.filter(deco => deco.x > this.cameraX + cleanupDistance);
  }
  
  public updateDifficulty(score: number) {
    this.difficultyScore = score;
  }
  
  public updateClouds(deltaTime: number, cameraX: number, canvasWidth: number) {
    for (const cloud of this.clouds) {
      cloud.x -= cloud.speed * deltaTime;
      // Jika cloud keluar layar kiri, reset ke kanan
      if (cloud.x < cameraX - 300) {
        cloud.x = cameraX + canvasWidth + 100 + Math.random() * 200;
        cloud.y = 60 + Math.random() * 80;
      }
    }
  }
  
  public draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    ctx.save();
    
    // Apply camera transform
    ctx.translate(-this.cameraX, -this.cameraY);
    
    // Draw background
    this.drawBackground(ctx, canvasWidth, canvasHeight);
    
    // Draw platforms
    for (const platform of this.platforms) {
      if (platform.type === 'ground') {
        platform.draw(ctx, canvasHeight);
      } else {
        platform.draw(ctx);
      }
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
    
    // Draw hearts
    for (const heart of this.hearts) {
      heart.draw(ctx);
    }
    
    // Draw mystery boxes
    for (const box of this.mysteryBoxes) {
      if (box.isActive) {
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('?', box.x + 8, box.y + 24);
        ctx.restore();
      }
    }
    
    // Dekorasi (pohon, grass) di bawah platform
    for (const deco of this.decorations) {
      deco.draw(ctx);
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
    const drawCloud = (x: number, y: number, scale: number = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.beginPath();
      ctx.arc(-20, 0, 15, 0, Math.PI * 2);
      ctx.arc(-10, -10, 18, 0, Math.PI * 2);
      ctx.arc(10, -8, 16, 0, Math.PI * 2);
      ctx.arc(20, 0, 12, 0, Math.PI * 2);
      ctx.arc(0, 8, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    for (const cloud of this.clouds) {
      drawCloud(cloud.x, cloud.y, cloud.scale);
    }
  }
  
  public getCameraTransform() {
    return { x: this.cameraX, y: this.cameraY };
  }
  
  public reset() {
    this.platforms = [];
    this.coins = [];
    this.enemies = [];
    this.powerUps = [];
    this.hearts = [];
    this.mysteryBoxes = [];
    this.decorations = [];
    this.generateInitialLevel();
    this.cameraX = 0;
    this.cameraY = 0;
    this.worldPosition = 0;
    this.lastGeneratedX = 3 * this.chunkSize;
    this.difficultyScore = 0;
  }
}
