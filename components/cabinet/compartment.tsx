import React from 'react';
import * as THREE from 'three';
import { CompartmentConfig, SectionConfig } from './CabinetTemplate';

interface CompartmentProps {
  index: number;
  width: number;
  xOffset: number;
  height: number;
  depth: number;
  color: string;
  thickness?: number;
}

// A simple representation of a section (drawer or door)
const Section: React.FC<{
  type: "drawer" | "door";
  height: number;
  positionY: number;
  width: number;
  depth: number;
  color: string;
}> = ({ type, height, positionY, width, depth, color }) => {
  const sectionColor = type === "drawer" ? "#D4C19C" : "#E0C9A6";
  
  return (
    <group position={[0, positionY, 0]}>
      <mesh position={[0, 0, depth / 2 - 0.1]} castShadow>
        <boxGeometry args={[width - 0.5, height - 0.5, 0.1]} />
        <meshStandardMaterial color={sectionColor} />
      </mesh>
      
      {/* Handle */}
      {type === "drawer" && (
        <mesh position={[0, 0, depth / 2]} castShadow>
          <boxGeometry args={[width / 3, 0.5, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      )}
      
      {type === "door" && (
        <mesh position={[width / 3, 0, depth / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      )}
    </group>
  );
};

function Compartment({
  index,
  width,
  xOffset,
  height,
  depth,
  color,
  thickness = 0.75
}: CompartmentProps) {
  // Calculate available height for sections
  const availableHeight = height - (thickness * 2) - 3; // account for top/bottom and rails
  
  // Create default sections - a drawer at the top and a door at the bottom
  const sections: SectionConfig[] = [
    { type: "drawer", height: 6, offsetY: height - 9 },
    { type: "door", height: availableHeight - 6, offsetY: thickness + (availableHeight - 6) / 2 }
  ];
  
  return (
    <group position={[xOffset, 0, 0]}>
      {/* Compartment dividers/structure - only add if not at the edges */}
      {index > 0 && (
        <mesh position={[-width/2, height/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[thickness, height, depth]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}
      
      {/* Render sections */}
      {sections.map((section, i) => (
        <Section 
          key={i}
          type={section.type}
          height={section.height}
          positionY={section.offsetY || 0}
          width={width}
          depth={depth}
          color={color}
        />
      ))}
    </group>
  );
}

export default Compartment;
