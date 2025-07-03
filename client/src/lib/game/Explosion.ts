// Explosion.ts
// Efek ledakan visual sederhana

export class Explosion {
  x: number;
  y: number;
  timer: number = 0.4; // detik
  maxTimer: number = 0.4;
  active: boolean = true;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(deltaTime: number) {
    this.timer -= deltaTime;
    if (this.timer <= 0) this.active = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    const progress = 1 - this.timer / this.maxTimer;
    const radius = 18 + 32 * progress;
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'orange';
    ctx.shadowColor = 'yellow';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
