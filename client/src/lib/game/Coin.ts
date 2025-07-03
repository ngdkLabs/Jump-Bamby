import { GameObject, CollisionManager } from './CollisionManager';
import { Player } from './Player';
import coinImg from '@/img/coin.png';
import gorbImg from '@/img/gorb.png';
import bonkImg from '@/img/bonk.png';
import bagorImg from '@/img/bagor.png';

export type CoinType = 'coin' | 'gorb' | 'bonk' | 'bagor';

export class Coin implements GameObject {
  public x: number;
  public y: number;
  public width: number = 24;
  public height: number = 24;
  public collected: boolean = false;
  public type: CoinType;
  public value: number;

  private static images: Record<CoinType, HTMLImageElement> = {
    coin: null as any,
    gorb: null as any,
    bonk: null as any,
    bagor: null as any,
  };
  private animationFrame: number = 0;
  private animationTimer: number = 0;
  private bobOffset: number = 0;
  private bobTimer: number = 0;

  constructor(x: number, y: number, type?: CoinType) {
    this.x = x;
    this.y = y;
    // Pilih tipe coin secara acak jika tidak ditentukan
    if (!type) {
      // 80% coin, 10% gorb, 9% bonk, 1% bagor
      const rand = Math.random();
      if (rand < 0.8) this.type = 'coin';
      else if (rand < 0.9) this.type = 'gorb';
      else if (rand < 0.99) this.type = 'bonk';
      else this.type = 'bagor';
    } else {
      this.type = type;
    }
    // Set value sesuai tipe
    this.value = this.type === 'coin' ? 30 : this.type === 'gorb' ? 100 : this.type === 'bonk' ? 50 : 1000;
    // Ukuran besar untuk bagor
    if (this.type === 'bagor') {
      this.width = 64;
      this.height = 64;
    }
    // Init images jika belum
    if (!Coin.images.coin) {
      const img1 = new window.Image(); img1.src = coinImg; Coin.images.coin = img1;
      const img2 = new window.Image(); img2.src = gorbImg; Coin.images.gorb = img2;
      const img3 = new window.Image(); img3.src = bonkImg; Coin.images.bonk = img3;
      const img4 = new window.Image(); img4.src = bagorImg; Coin.images.bagor = img4;
    }
  }
  
  public update(deltaTime: number, player: Player): boolean {
    if (this.collected) return false;
    
    // Update animation
    this.animationTimer += deltaTime;
    if (this.animationTimer > 0.15) {
      this.animationFrame = (this.animationFrame + 1) % 8;
      this.animationTimer = 0;
    }
    
    // Bob up and down
    this.bobTimer += deltaTime * 3;
    this.bobOffset = Math.sin(this.bobTimer) * 3;
    
    // Check collision with player
    if (CollisionManager.checkCollision(this, player)) {
      this.collected = true;
      player.score += this.value;
      // Play bagor sound jika tipe bagor
      if (this.type === 'bagor' && typeof window !== 'undefined' && (window as any).useAudio) {
        (window as any).useAudio.getState().playBagor();
      }
      return true; // Signal that coin was collected
    }
    
    return false;
  }
  
  public draw(ctx: CanvasRenderingContext2D) {
    if (this.collected) return;
    ctx.save();
    const drawY = this.y + this.bobOffset;
    // Animasi spinning
    const spinPhase = this.animationFrame / 8;
    const scaleX = Math.cos(spinPhase * Math.PI * 2);
    ctx.translate(this.x + this.width / 2, drawY + this.height / 2);
    ctx.scale(Math.abs(scaleX), 1);
    // Gambar sesuai tipe
    const img = Coin.images[this.type];
    if (img && img.complete) {
      ctx.drawImage(img, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      // fallback: lingkaran warna berbeda
      ctx.beginPath();
      ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = this.type === 'coin' ? '#FCDC00' : this.type === 'gorb' ? '#6B8CFF' : this.type === 'bonk' ? '#FF6B35' : '#FF35A1';
      ctx.fill();
    }
    ctx.restore();
  }
  
  public reset() {
    this.collected = false;
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.bobOffset = 0;
    this.bobTimer = 0;
  }
}
