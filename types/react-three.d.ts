declare module '@react-three/fiber' {
  import { ReactNode } from 'react';
  
  export interface CanvasProps {
    children?: ReactNode;
    shadows?: boolean;
    camera?: {
      position?: [number, number, number];
      fov?: number;
    };
  }
  
  export const Canvas: React.FC<CanvasProps>;
}

declare module '@react-three/drei' {
  import { ReactNode } from 'react';
  import { Object3D } from 'three';
  
  export interface OrbitControlsProps {
    ref?: any;
    className?: string;
    minPolarAngle?: number;
    maxPolarAngle?: number;
    minDistance?: number;
    maxDistance?: number;
    makeDefault?: boolean;
  }
  
  export interface EnvironmentProps {
    preset?: string;
  }
  
  export const OrbitControls: React.FC<OrbitControlsProps>;
  export const Environment: React.FC<EnvironmentProps>;
} 