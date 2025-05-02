import * as THREE from 'three';
import React from 'react';

// This file adds JSX typings for React Three Fiber components

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Basic Three.js elements
      mesh: any;
      group: any;
      lineSegments: any;
      
      // Geometries
      boxGeometry: any;
      planeGeometry: any;
      sphereGeometry: any;
      edgesGeometry: any;
      
      // Materials
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      shadowMaterial: any;
      lineBasicMaterial: any;
      
      // Lights
      ambientLight: any;
      directionalLight: any;
      
      // Other
      color: any;
      primitive: any;
    }
  }
}

// Three.js types
declare namespace THREE {
  class WebGLRenderer {}
  class Scene {}
  class Camera {}
  class Raycaster {
    constructor();
  }
  class Vector2 {
    constructor();
    set(x: number, y: number): Vector2;
  }
  class Vector3 {}
  class Group {}
  class BoxGeometry {
    constructor(width: number, height: number, depth: number);
  }
  class Object3D {
    userData: {
      [key: string]: any;
    };
    parent: Object3D | null;
  }
  
  interface Event {
    stopPropagation: () => void;
    delta: Vector3;
    point: Vector3;
    object: Object3D;
  }
}

declare module 'three' {
  export const BoxGeometry: any;
  export const Group: any;
}

declare module '@react-three/fiber' {
  export const useThree: () => {
    camera: any;
    gl: any;
    scene: any;
  };
}

// Need to export something to be a valid module
export {}; 