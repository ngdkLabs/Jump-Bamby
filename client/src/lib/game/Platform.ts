import { GameObject } from './CollisionManager';

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
  
  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    switch (this.type) {
      case 'ground':
        // Draw grass ground
        ctx.fillStyle = '#228B22';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add grass texture
        ctx.fillStyle = '#32CD32';
        for (let i = 0; i < this.width; i += 8) {
          ctx.fillRect(this.x + i, this.y, 4, 8);
        }
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
    
    // Add border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    ctx.restore();
  }
}
