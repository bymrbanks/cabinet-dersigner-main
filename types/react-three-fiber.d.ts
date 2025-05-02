import * as THREE from 'three';
import React from 'react';

// This file adds JSX typings for React Three Fiber components

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Basic Three.js elements
      mesh: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { [key: string]: any };
      lineSegments: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { [key: string]: any };
      group: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { [key: string]: any };
      
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

// Extend Three.js types
declare module 'three' {
  interface Object3D {
    userData: {
      [key: string]: any;
    };
  }
  
  interface Event {
    stopPropagation: () => void;
    delta: THREE.Vector3;
    point: THREE.Vector3;
    object: THREE.Object3D;
  }
}

// Need to export something to be a valid module
export {}; 