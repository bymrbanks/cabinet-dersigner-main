import * as THREE from 'three';
import React from 'react';

// This file adds JSX typings for React Three Fiber components

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Basic Three.js elements
      mesh: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { 
        [key: string]: any;
        position?: [number, number, number];
        rotation?: [number, number, number];
        onClick?: (event: any) => void;
        onPointerDown?: (event: any) => void;
        onPointerUp?: (event: any) => void;
        onPointerMove?: (event: any) => void;
        onDoubleClick?: (event: any) => void;
      };
      lineSegments: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { 
        [key: string]: any;
        position?: [number, number, number];
      };
      group: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { 
        [key: string]: any;
        position?: [number, number, number];
        onClick?: (event: any) => void;
        onDoubleClick?: (event: any) => void;
      };
      
      // Geometries
      boxGeometry: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { args?: any[] };
      planeGeometry: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { args?: any[] };
      sphereGeometry: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { args?: any[] };
      edgesGeometry: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { args?: any[] };
      
      // Materials
      meshStandardMaterial: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { 
        color?: string; 
        transparent?: boolean; 
        opacity?: number;
        wireframe?: boolean;
      };
      meshBasicMaterial: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { 
        color?: string; 
        transparent?: boolean; 
        opacity?: number;
        wireframe?: boolean;
      };
      shadowMaterial: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { 
        transparent?: boolean; 
        opacity?: number;
      };
      lineBasicMaterial: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { 
        color?: string; 
        linewidth?: number;
      };
      
      // Lights
      ambientLight: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { intensity?: number };
      directionalLight: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { 
        position?: [number, number, number];
        intensity?: number;
        castShadow?: boolean;
      };
      
      // Other
      color: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { 
        attach?: string;
        args?: [string];
      };
      primitive: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { object?: any };
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

// Need to export something to be a valid module
export {}; 