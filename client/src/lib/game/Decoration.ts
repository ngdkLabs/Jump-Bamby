import treeImageSrc from '@/img/background/banyan-tree.png';

const treeImage = new window.Image();
treeImage.src = treeImageSrc as string;

export type DecorationType = 'tree' | 'mushroom' | 'cactus' | 'coconut';

export class Decoration {
  public x: number;
  public y: number;
  public type: DecorationType;
  public size: number;

  constructor(x: number, y: number, type: DecorationType, size: number = 1) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = size;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.size, this.size);
    switch (this.type) {
      case 'tree':
        // Draw tree image if loaded, fallback to old drawing if not
        if (treeImage) {
          ctx.drawImage(treeImage, -32, -64, 64, 96);
        } else {
          ctx.fillStyle = '#8B5A2B';
          ctx.fillRect(-6, 0, 12, 32);
          ctx.beginPath();
          ctx.arc(0, -8, 24, 0, Math.PI * 2);
          ctx.fillStyle = '#228B22';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-12, 0, 16, 0, Math.PI * 2);
          ctx.arc(12, 0, 16, 0, Math.PI * 2);
          ctx.fillStyle = '#2E8B57';
          ctx.fill();
        }
        break;
      case 'mushroom':
        ctx.fillStyle = '#FFF8DC';
        ctx.fillRect(-3, 0, 6, 12);
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 7, 0, Math.PI, 0, true);
        ctx.fillStyle = '#FF3B3B';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-4, -3, 1.5, 0, Math.PI * 2);
        ctx.arc(0, -5, 1.2, 0, Math.PI * 2);
        ctx.arc(4, -2, 1, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF';
        ctx.fill();
        break;
      case 'cactus':
        ctx.fillStyle = '#2ecc40';
        ctx.fillRect(-5, 0, 10, 28);
        ctx.beginPath();
        ctx.arc(0, 0, 8, Math.PI, 2 * Math.PI);
        ctx.fill();
        ctx.fillRect(-12, 10, 6, 12);
        ctx.fillRect(6, 12, 6, 10);
        break;
      case 'coconut':
        ctx.save();
        ctx.rotate(-0.1 + Math.random() * 0.2);
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(-3, 0, 6, 38);
        ctx.restore();
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          ctx.save();
          ctx.rotate((-0.7 + i * 0.35));
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -28);
          ctx.stroke();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(0, 6, 3, 0, Math.PI * 2);
        ctx.arc(-4, 8, 2, 0, Math.PI * 2);
        ctx.arc(4, 8, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#6b4f1d';
        ctx.fill();
        break;
    }
    ctx.restore();
  }
}
