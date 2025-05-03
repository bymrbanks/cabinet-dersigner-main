import { useRef, useEffect } from 'react';
import { Mesh, Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { useCabinetStore } from '@/store/cabinet-store';

export interface CabinetCarcassProps {
  position?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  id: string; // Cabinet ID
  showSides?: boolean; // Whether to show side panels (default is true)
}

export default function CabinetCarcass({
  position = [0, 0, 0],
  width = 24,
  height = 30,
  depth = 24,
  color = '#E0C9A6',
  id,
  showSides = true,
}: CabinetCarcassProps) {
  const groupRef = useRef<Group>(null);
  const { selectedPart } = useCabinetStore();

  // Calculate dimensions for all parts
  const thickness = 0.75; // 3/4 inch material thickness
  const barWidth = 3; // 3 inch bars at top

  // Calculate positions
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const halfHeight = height / 2;

  // Highlight color if this cabinet is selected
  const isSelected = selectedPart === id;
  const highlightColor = isSelected ? "#A0D6B4" : color;
  
  // Set the name property for the carcass group after it's rendered
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.name = `Carcass-${id}`;
    }
  }, [id]);

  return (
    <group 
      ref={groupRef} 
      position={position}
      userData={{ type: "carcass", id }}
    >
      {/* Side panels - only render if showSides is true */}
      {showSides && (
        <>
          {/* Left side panel */}
          <mesh 
            position={[-halfWidth + thickness/2, halfHeight, 0]} 
            castShadow 
            receiveShadow
            name={`${id}-left-panel`}
          >
            <boxGeometry args={[thickness, height, depth]} />
            <meshStandardMaterial color={highlightColor} />
          </mesh>

          {/* Right side panel */}
          <mesh 
            position={[halfWidth - thickness/2, halfHeight, 0]} 
            castShadow 
            receiveShadow
            name={`${id}-right-panel`}
          >
            <boxGeometry args={[thickness, height, depth]} />
            <meshStandardMaterial color={highlightColor} />
          </mesh>
        </>
      )}

      {/* Bottom panel */}
      <mesh 
        position={[0, thickness/2, 0]} 
        castShadow 
        receiveShadow
        name={`${id}-bottom-panel`}
      >
        <boxGeometry args={[width - (showSides ? thickness*2 : 0), thickness, depth]} />
        <meshStandardMaterial color={highlightColor} />
      </mesh>

      {/* Top front bar */}
      <mesh 
        position={[0, height - barWidth/2, halfDepth - thickness/2]} 
        castShadow 
        receiveShadow
        name={`${id}-top-front-bar`}
      >
        <boxGeometry args={[width - (showSides ? thickness*2 : 0), barWidth, thickness]} />
        <meshStandardMaterial color={highlightColor} />
      </mesh>

      {/* Top back bar */}
      <mesh 
        position={[0, height - barWidth/2, -halfDepth + thickness/2]} 
        castShadow 
        receiveShadow
        name={`${id}-top-back-bar`}
      >
        <boxGeometry args={[width - (showSides ? thickness*2 : 0), barWidth, thickness]} />
        <meshStandardMaterial color={highlightColor} />
      </mesh>

      {/* Top back support */}
      <mesh 
        position={[0, height - thickness/2, -halfDepth + depth/4]} 
        castShadow 
        receiveShadow
        name={`${id}-top-back-support`}
      >
        <boxGeometry args={[width - (showSides ? thickness*2 : 0), thickness, depth/2]} />
        <meshStandardMaterial color={highlightColor} />
      </mesh>
    </group>
  );
} 