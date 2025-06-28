import { Platform } from './Platform';
import { Coin } from './Coin';

export class Level {
  public platforms: Platform[] = [];
  public coins: Coin[] = [];
  private cameraX: number = 0;
  private cameraY: number = 0;
  private levelWidth: number = 0;
  private chunkSize: number = 800; // Size of each generated chunk
  private generatedChunks: Set<number> = new Set(); // Track generated chunks
  
  constructor() {
    this.generateInitialLevel();
  }
  
  private generateInitialLevel() {
    // Clear existing objects
    this.platforms = [];
    this.coins = [];
    this.generatedChunks.clear();
    
    // Generate first few chunks
    this.generateChunk(0);
    this.generateChunk(1);
    this.generateChunk(2);
    
    this.levelWidth = this.chunkSize * 3;
  }
  
  private generateChunk(chunkIndex: number) {
    if (this.generatedChunks.has(chunkIndex)) return;
    
    this.generatedChunks.add(chunkIndex);
    const startX = chunkIndex * this.chunkSize;
    
    // Seed random number generator for consistent generation
    const seed = chunkIndex * 12345;
    const random = this.seededRandom(seed);
    
    // Calculate difficulty based on distance (increases every 5 chunks)
    const difficulty = Math.floor(chunkIndex / 5);
    const difficultyFactor = Math.min(difficulty * 0.2, 2.0); // Cap at 2x difficulty
    
    // Generate ground platform for this chunk with varying heights
    const groundHeight = 80 + random() * 70;
    const groundY = 450 + random() * 100 + (difficulty * 10); // Ground gets higher as difficulty increases
    this.platforms.push(new Platform(startX, groundY, this.chunkSize, groundHeight, 'ground'));
    
    // Generate floating platforms (more as difficulty increases)
    const basePlatformCount = 2 + Math.floor(random() * 3);
    const platformCount = basePlatformCount + Math.floor(difficultyFactor);
    
    for (let i = 0; i < platformCount; i++) {
      const x = startX + 50 + random() * (this.chunkSize - 100);
      const y = 150 + random() * 250;
      const width = 48 + random() * 80;
      
      // More brick platforms at higher difficulty
      const brickChance = 0.3 + (difficultyFactor * 0.2);
      const type = random() > brickChance ? 'platform' : 'brick';
      this.platforms.push(new Platform(x, y, width, 32, type));
    }
    
    // Generate challenging obstacle patterns
    this.generateObstaclePatterns(chunkIndex, startX, random, difficultyFactor);
    
    // Generate more coins at higher difficulty levels
    const baseCoinCount = 3 + Math.floor(random() * 4);
    const coinCount = baseCoinCount + Math.floor(difficultyFactor / 2);
    
    for (let i = 0; i < coinCount; i++) {
      const x = startX + 50 + random() * (this.chunkSize - 100);
      const y = 80 + random() * 320;
      this.coins.push(new Coin(x, y));
    }
  }
  
  private generateObstaclePatterns(chunkIndex: number, startX: number, random: () => number, difficultyFactor: number) {
    // Generate different obstacle patterns based on chunk index
    const patternType = chunkIndex % 4;
    
    switch (patternType) {
      case 0: // Vertical brick towers
        this.generateVerticalTowers(startX, random, difficultyFactor);
        break;
      case 1: // Horizontal brick walls with gaps
        this.generateWallsWithGaps(startX, random, difficultyFactor);
        break;
      case 2: // Staircase patterns
        this.generateStaircases(startX, random, difficultyFactor);
        break;
      case 3: // Scattered single obstacles
        this.generateScatteredObstacles(startX, random, difficultyFactor);
        break;
    }
  }
  
  private generateVerticalTowers(startX: number, random: () => number, difficultyFactor: number) {
    const towerCount = 1 + Math.floor(difficultyFactor);
    for (let i = 0; i < towerCount; i++) {
      const x = startX + 150 + i * 200 + random() * 100;
      const towerHeight = 2 + Math.floor(random() * 3 + difficultyFactor);
      const baseY = 400 - random() * 100;
      
      for (let j = 0; j < towerHeight; j++) {
        this.platforms.push(new Platform(x, baseY - j * 32, 32, 32, 'brick'));
      }
    }
  }
  
  private generateWallsWithGaps(startX: number, random: () => number, difficultyFactor: number) {
    const wallY = 300 + random() * 100;
    const gapSize = 64 + random() * 32;
    const wallSegments = 3 + Math.floor(difficultyFactor);
    
    for (let i = 0; i < wallSegments; i++) {
      const segmentX = startX + 100 + i * (gapSize + 64);
      const segmentWidth = 64 + random() * 32;
      this.platforms.push(new Platform(segmentX, wallY, segmentWidth, 32, 'brick'));
    }
  }
  
  private generateStaircases(startX: number, random: () => number, difficultyFactor: number) {
    const steps = 3 + Math.floor(random() * 3 + difficultyFactor);
    const direction = random() > 0.5 ? 1 : -1; // Up or down stairs
    const baseX = startX + 100 + random() * 400;
    const baseY = 350;
    
    for (let i = 0; i < steps; i++) {
      const x = baseX + i * 48;
      const y = baseY - (direction * i * 32);
      this.platforms.push(new Platform(x, y, 48, 32, 'platform'));
    }
  }
  
  private generateScatteredObstacles(startX: number, random: () => number, difficultyFactor: number) {
    const obstacleCount = 2 + Math.floor(random() * 3 + difficultyFactor);
    for (let i = 0; i < obstacleCount; i++) {
      const x = startX + 50 + random() * (this.chunkSize - 100);
      const y = 150 + random() * 200;
      const width = 32;
      const height = 32 + Math.floor(random() * 64);
      this.platforms.push(new Platform(x, y, width, height, 'brick'));
    }
  }
  
  // Simple seeded random number generator
  private seededRandom(seed: number) {
    let currentSeed = seed;
    return function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }
  
  public updateCamera(playerX: number, playerY: number, canvasWidth: number, canvasHeight: number) {
    // Follow player horizontally
    this.cameraX = playerX - canvasWidth / 2;
    
    // Generate new chunks as player progresses
    const currentChunk = Math.floor((playerX + canvasWidth) / this.chunkSize);
    const chunksToGenerate = 3; // Generate 3 chunks ahead
    
    for (let i = 0; i <= chunksToGenerate; i++) {
      this.generateChunk(currentChunk + i);
    }
    
    // Update level width based on generated chunks
    this.levelWidth = Math.max(this.levelWidth, (currentChunk + chunksToGenerate + 1) * this.chunkSize);
    
    // Clean up distant platforms and coins to prevent memory issues
    this.cleanupDistantObjects(playerX, canvasWidth);
    
    // Clamp camera to level boundaries (but allow infinite expansion)
    this.cameraX = Math.max(0, this.cameraX);
    
    // Keep camera vertically centered with slight offset
    this.cameraY = playerY - canvasHeight / 2 + 50;
    this.cameraY = Math.max(-200, Math.min(200, this.cameraY));
  }
  
  private cleanupDistantObjects(playerX: number, canvasWidth: number) {
    const cleanupDistance = canvasWidth * 3; // Keep objects within 3 screen widths
    
    // Remove platforms that are too far behind
    this.platforms = this.platforms.filter(platform => 
      platform.x + platform.width > playerX - cleanupDistance
    );
    
    // Remove coins that are too far behind
    this.coins = this.coins.filter(coin => 
      coin.x > playerX - cleanupDistance
    );
    
    // Remove old chunk tracking for chunks that are far behind
    const oldestChunkToKeep = Math.floor((playerX - cleanupDistance) / this.chunkSize);
    this.generatedChunks.forEach(chunkIndex => {
      if (chunkIndex < oldestChunkToKeep) {
        this.generatedChunks.delete(chunkIndex);
      }
    });
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
    this.generateInitialLevel();
    this.cameraX = 0;
    this.cameraY = 0;
  }
}
