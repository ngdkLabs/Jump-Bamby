// MysteryBox.ts
// Entitas MysteryBox yang dapat diambil player untuk mendapatkan senjata

import { Player } from './Player';

export type WeaponType = 'gun' | 'bomb';

export class MysteryBox {
  x: number;
  y: number;
  width: number = 32;
  height: number = 32;
  weapon: WeaponType;
  isActive: boolean = true;

  constructor(x: number, y: number, weapon: WeaponType) {
    this.x = x;
    this.y = y;
    this.weapon = weapon;
  }

  checkCollision(player: Player): boolean {
    return (
      this.isActive &&
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    );
  }

  onPickup(player: Player) {
    this.isActive = false;
    // Peluru/bom per-claim random 5-10, logika di Player.obtainWeapon
    player.obtainWeapon(this.weapon);
  }
}
