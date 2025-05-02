import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import Compartment from './Compartment';
import { generateCompartments } from './CabinetTemplate';

export interface CabinetCarcassProps {
  position?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  compartmentWidthThreshold?: number;
}

export default function CabinetCarcass({
  position = [0, 0, 0],
  width = 24,
  height = 30,
  depth = 24,
  color = '#E0C9A6',
  compartmentWidthThreshold = 24,
}: CabinetCarcassProps) {
  const groupRef = useRef<any>(null);

  // Calculate dimensions for all parts
  const thickness = 0.75; // 3/4 inch material thickness
  const barWidth = 3; // 3 inch bars at top

  // Calculate positions
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const halfHeight = height / 2;

  // Generate the compartments based on width
  const compartments = generateCompartments(width, compartmentWidthThreshold);

  return (
    <group ref={groupRef} position={position}>
      {/* Left side panel */}
      <mesh position={[-halfWidth + thickness/2, halfHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, depth]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Right side panel */}
      <mesh position={[halfWidth - thickness/2, halfHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, depth]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Bottom panel */}
      <mesh position={[0, thickness/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width - thickness*2, thickness, depth]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Top front bar */}
      <mesh position={[0, height - barWidth/2, halfDepth - thickness/2]} castShadow receiveShadow>
        <boxGeometry args={[width - thickness*2, barWidth, thickness]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Top back bar */}
      <mesh position={[0, height - barWidth/2, -halfDepth + thickness/2]} castShadow receiveShadow>
        <boxGeometry args={[width - thickness*2, barWidth, thickness]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Top back support */}
      <mesh position={[0, height - thickness/2, -halfDepth + depth/4]} castShadow receiveShadow>
        <boxGeometry args={[width - thickness*2, thickness, depth/2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Render compartments */}
      {compartments.map(({ index, xOffset, width: compartmentWidth }) => (
        <Compartment
          key={index}
          index={index}
          xOffset={xOffset}
          width={compartmentWidth - thickness} // Account for divider thickness
          height={height}
          depth={depth}
          color={color}
          thickness={thickness}
        />
      ))}
    </group>
  );
} 