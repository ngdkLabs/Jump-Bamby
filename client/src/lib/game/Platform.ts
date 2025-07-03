import { GameObject } from './CollisionManager';
import { groundImage, gapImage } from './groundImages';

export class Platform implements GameObject {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public type: 'ground' | 'platform' | 'brick';
  
  constructor(x: number, y: number, width: number, height: number, type: 'ground' | 'platform' | 'brick' = 'platform') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
  }
  
  public draw(ctx: CanvasRenderingContext2D, canvasHeight?: number) {
    ctx.save();
    
    switch (this.type) {
      case 'ground':
        // Gambar tanah pakai tile alas.png agar rapi
        if (groundImage.complete && groundImage.naturalWidth > 0) {
          // Tile bagian atas
          const tileW = groundImage.naturalWidth;
          const tileH = 18;
          for (let i = 0; i < this.width; i += tileW) {
            ctx.drawImage(groundImage, 0, 0, tileW, tileH, this.x + i, this.y, Math.min(tileW, this.x + this.width - (this.x + i)), tileH);
          }
          // Tile bagian bawah (tanah)
          const soilTop = this.y + tileH;
          const soilBottom = canvasHeight !== undefined ? canvasHeight : (this.y + this.height);
          const soilHeight = soilBottom - soilTop;
          for (let i = 0; i < this.width; i += tileW) {
            ctx.drawImage(groundImage, 0, tileH, tileW, groundImage.naturalHeight - tileH, this.x + i, soilTop, Math.min(tileW, this.x + this.width - (this.x + i)), soilHeight);
          }
        } else {
          // Fallback warna lama
          ctx.fillStyle = '#228B22';
          ctx.fillRect(this.x, this.y, this.width, 18);
          ctx.fillStyle = '#b97a56';
          const soilTop = this.y + 18;
          const soilBottom = canvasHeight !== undefined ? canvasHeight : (this.y + this.height);
          ctx.fillRect(this.x, soilTop, this.width, soilBottom - soilTop);
        }
        // Tidak perlu gambar gap di sini, gap diatur di Level
        break;
        
      case 'platform':
        // Draw wooden platform
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add wood grain
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        for (let i = 0; i < this.width; i += 32) {
          ctx.beginPath();
          ctx.moveTo(this.x + i, this.y);
          ctx.lineTo(this.x + i, this.y + this.height);
          ctx.stroke();
        }
        break;
        
      case 'brick':
        // Draw brick block
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add brick pattern
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        
        const brickWidth = 16;
        const brickHeight = 8;
        
        for (let row = 0; row < this.height / brickHeight; row++) {
          for (let col = 0; col < this.width / brickWidth; col++) {
            const offsetX = row % 2 === 0 ? 0 : brickWidth / 2;
            const brickX = this.x + col * brickWidth + offsetX;
            const brickY = this.y + row * brickHeight;
            
            if (brickX < this.x + this.width) {
              ctx.strokeRect(brickX, brickY, Math.min(brickWidth, this.x + this.width - brickX), brickHeight);
            }
          }
        }
        break;
    }
    
    // Add border, kecuali untuk ground
    if (this.type !== 'ground') {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    ctx.restore();
  }
}
