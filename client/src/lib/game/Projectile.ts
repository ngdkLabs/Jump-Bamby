// Projectile.ts
// Entitas peluru/bom yang ditembakkan player

import { Enemy } from './Enemy';
import { WeaponType } from './MysteryBox';
import bombFireImg from './bombFireImg';
import bulletGunImg from './bulletGunImg';

export class Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  type: WeaponType;
  active: boolean = true;

  // Untuk efek ledakan
  public exploded: boolean = false;
  public explosionX: number = 0;
  public explosionY: number = 0;

  constructor(x: number, y: number, direction: 'left' | 'right', type: WeaponType) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = type === 'bomb' ? 18 : 8;
    this.height = type === 'bomb' ? 18 : 8;
    if (type === 'bomb') {
      this.vx = direction === 'right' ? 220 : -220;
      this.vy = -180; // lemparan ke atas
    } else {
      this.vx = direction === 'right' ? 400 : -400;
      this.vy = 0;
    }
  }

  update(deltaTime: number, enemies: Enemy[]) {
    if (!this.active) return;
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    const playDeadMinion = (window as any).useAudio?.getState?.().playDeadMinion || ((window as any).useAudioStore?.getState?.().playDeadMinion);
    if (this.type === 'bomb') {
      this.vy += 600 * deltaTime; // gravitasi bom
      // Bom meledak jika menyentuh tanah (y > 500) atau kena musuh
      if (this.y + this.height > 500) {
        this.active = false;
        this.exploded = true;
        this.explosionX = this.x + this.width / 2;
        this.explosionY = 500;
        // Ledakkan musuh di sekitar
        for (const enemy of enemies) {
          const dx = (enemy.x + enemy.width/2) - this.explosionX;
          const dy = (enemy.y + enemy.height/2) - this.explosionY;
          if (enemy.active && Math.sqrt(dx*dx + dy*dy) < 60) {
            enemy.kill(playDeadMinion);
          }
        }
        return;
      }
    }
    // Cek tabrakan dengan musuh
    for (const enemy of enemies) {
      if (enemy.active && this.checkCollision(enemy)) {
        if (this.type === 'bomb') {
          // Bom meledak di musuh
          this.active = false;
          this.exploded = true;
          this.explosionX = this.x + this.width / 2;
          this.explosionY = this.y + this.height / 2;
          // Ledakkan musuh di sekitar
          for (const e2 of enemies) {
            const dx = (e2.x + e2.width/2) - this.explosionX;
            const dy = (e2.y + e2.height/2) - this.explosionY;
            if (e2.active && Math.sqrt(dx*dx + dy*dy) < 60) {
              e2.kill(playDeadMinion);
            }
          }
        } else {
          enemy.kill(playDeadMinion);
          this.active = false;
        }
        break;
      }
    }
    // Hilang jika keluar layar (DIPERLUAS AGAR BEBAS CHUNK)
    // Dihilangkan agar peluru/bom bisa berjalan di semua chunk
    // if (this.x < -100 || this.x > 2000 || this.y > 1000) {
    //   this.active = false;
    // }
  }

  checkCollision(enemy: Enemy): boolean {
    return (
      this.x < enemy.x + enemy.width &&
      this.x + this.width > enemy.x &&
      this.y < enemy.y + enemy.height &&
      this.y + this.height > enemy.y
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    ctx.save();
    if (this.type === 'bomb') {
      if (bombFireImg.complete && bombFireImg.naturalWidth > 0) {
        ctx.drawImage(bombFireImg, this.x, this.y, this.width, this.height);
      } else {
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
      }
    } else {
      if (bulletGunImg.complete && bulletGunImg.naturalWidth > 0) {
        ctx.drawImage(bulletGunImg, this.x, this.y, this.width, this.height);
      } else {
        ctx.fillStyle = '#ff0';
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }
    ctx.restore();
  }
}
