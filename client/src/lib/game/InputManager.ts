export class InputManager {
  private static keys: Map<string, boolean> = new Map();
  private static initialized = false;

  public static init() {
    if (this.initialized) return;
    
    this.initialized = true;
    
    window.addEventListener('keydown', (e) => {
      this.keys.set(e.code, true);
      this.keys.set(e.key, true);
      
      // Prevent default for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys.set(e.code, false);
      this.keys.set(e.key, false);
    });
    
    // Prevent context menu on right click
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  public static isKeyPressed(key: string): boolean {
    return this.keys.get(key) || false;
  }

  public static setKey(key: string, pressed: boolean) {
    this.keys.set(key, pressed);
  }

  public static isLeftPressed(): boolean {
    return this.isKeyPressed('ArrowLeft') || this.isKeyPressed('KeyA');
  }

  public static isRightPressed(): boolean {
    return this.isKeyPressed('ArrowRight') || this.isKeyPressed('KeyD');
  }

  public static isJumpPressed(): boolean {
    return this.isKeyPressed('Space') || this.isKeyPressed('ArrowUp') || this.isKeyPressed('KeyW');
  }
}
