export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class CollisionManager {
  public static checkCollision(obj1: GameObject, obj2: GameObject): boolean {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  public static checkCollisionSide(obj1: GameObject, obj2: GameObject): {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  } {
    const dx = (obj1.x + obj1.width / 2) - (obj2.x + obj2.width / 2);
    const dy = (obj1.y + obj1.height / 2) - (obj2.y + obj2.height / 2);
    
    const width = (obj1.width + obj2.width) / 2;
    const height = (obj1.height + obj2.height) / 2;
    
    const crossWidth = width * dy;
    const crossHeight = height * dx;
    
    let collision = {
      top: false,
      bottom: false,
      left: false,
      right: false
    };

    if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
      if (crossWidth > crossHeight) {
        collision = crossWidth > -crossHeight ? { ...collision, bottom: true } : { ...collision, left: true };
      } else {
        collision = crossWidth > -crossHeight ? { ...collision, right: true } : { ...collision, top: true };
      }
    }

    return collision;
  }

  public static resolveCollision(movingObj: GameObject, staticObj: GameObject, side: string) {
    switch (side) {
      case 'top':
        movingObj.y = staticObj.y - movingObj.height;
        break;
      case 'bottom':
        movingObj.y = staticObj.y + staticObj.height;
        break;
      case 'left':
        movingObj.x = staticObj.x - movingObj.width;
        break;
      case 'right':
        movingObj.x = staticObj.x + staticObj.width;
        break;
    }
  }
}
