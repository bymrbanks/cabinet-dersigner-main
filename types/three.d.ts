declare module 'three' {
  export * from 'three/src/Three';
}

declare module 'three/src/Three' {
  export class GridHelper extends Object3D {
    constructor(size: number, divisions: number, color1?: any, color2?: any);
    material: Material | Material[];
  }

  export class Object3D {
    position: Vector3;
    rotation: Euler;
    scale: Vector3;
  }

  export class Vector3 {
    x: number;
    y: number;
    z: number;
  }

  export class Euler {
    x: number;
    y: number;
    z: number;
  }

  export class Material {
    opacity: number;
    transparent: boolean;
  }
} 