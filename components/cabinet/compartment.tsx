import React, { useRef, useEffect, memo } from 'react';
import * as THREE from 'three';
import { CompartmentConfig, SectionConfig } from './CabinetTemplate';
import CabinetCarcass from './CabinetCarcass';
import { useCabinetStore } from '@/store/cabinet-store';

interface CompartmentProps {
  cabinetId: string;
  compartmentIndex: number;
  width: number;
  xOffset: number;
  height: number;
  depth: number;
  color: string;
  thickness?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

// A simple representation of a section (drawer or door)
const Section: React.FC<{
  type: "drawer" | "door";
  height: number;
  positionY: number;
  width: number;
  depth: number;
  color: string;
  sectionId: string;
  isSelected?: boolean;
  onClick?: () => void;
}> = memo(({ type, height, positionY, width, depth, color, sectionId, isSelected, onClick }) => {
  const sectionColor = type === "drawer" ? "#D4C19C" : "#E0C9A6";
  const highlightColor = isSelected ? "#FFD700" : sectionColor; // Gold color for selected items
  const groupRef = useRef<THREE.Group>(null);
  
  // Set the name property for the section group after it's rendered
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.name = `${type}-${sectionId}`;
    }
  }, [sectionId, type]);
  
  // Log when section is rendered with new width
  useEffect(() => {
    console.log(`Section ${sectionId} rendered with width: ${width}`);
  }, [sectionId, width]);
  
  return (
    <group 
      ref={groupRef} 
      position={[0, positionY, 0]} 
      onClick={onClick}
      userData={{ type, sectionId }}
    >
      <mesh position={[0, 0, depth / 2 - 0.1]} castShadow name={`${type}-face`}>
        <boxGeometry args={[width - 0.5, height - 0.5, 0.1]} />
        <meshStandardMaterial color={highlightColor} />
      </mesh>
      
      {/* Handle */}
      {type === "drawer" && (
        <mesh position={[0, 0, depth / 2]} castShadow name={`${type}-handle`}>
          <boxGeometry args={[width / 3, 0.5, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      )}
      
      {type === "door" && (
        <mesh position={[width / 3, 0, depth / 2]} castShadow name={`${type}-handle`}>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      )}
    </group>
  );
});

// Memoize Compartment component to prevent unnecessary re-renders
const Compartment = memo(function Compartment({
  cabinetId,
  compartmentIndex,
  width,
  xOffset,
  height,
  depth,
  color,
  thickness = 0.75,
  isSelected = false,
  onClick
}: CompartmentProps) {
  const { updateCompartmentWidth } = useCabinetStore();
  const groupRef = useRef<THREE.Group>(null);
  
  // Set the name property for the compartment group after it's rendered
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.name = `Compartment-${cabinetId}-${compartmentIndex}`;
    }
  }, [cabinetId, compartmentIndex]);
  
  // Log when compartment is rendered with new width
  useEffect(() => {
    console.log(`Compartment ${cabinetId}-${compartmentIndex} rendered with width: ${width}, offset: ${xOffset}`);
  }, [cabinetId, compartmentIndex, width, xOffset]);
  
  // Double-click handler to allow width adjustment
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If this compartment is selected, allow width adjustment
    if (isSelected) {
      // You could implement a UI here, but for now let's just use a prompt
      const newWidth = parseFloat(prompt(`Enter new width for compartment (current: ${width}):`, width.toString()) || width.toString());
      
      if (!isNaN(newWidth) && newWidth > 0) {
        updateCompartmentWidth(cabinetId, compartmentIndex, newWidth);
      }
    }
  };
  
  // Calculate available height for sections
  const availableHeight = height - (thickness * 2) - 3; // account for top/bottom and rails
  
  // Create default sections - a drawer at the top and a door at the bottom
  const sections: SectionConfig[] = [
    { type: "drawer", height: 6, offsetY: height - 9 },
    { type: "door", height: availableHeight - 6, offsetY: thickness + (availableHeight - 6) / 2 }
  ];
  
  // Highlight color for selected compartment
  const highlightColor = isSelected ? "#A0D6B4" : color; // Light green for selected compartment
  
  return (
    <group 
      ref={groupRef}
      position={[xOffset, 0, 0]} 
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
      userData={{ type: "compartment", cabinetId, compartmentIndex, width }}
    >
      {/* Always render left divider for each compartment, ensuring each cabinet has distinct sides */}
      {/* <mesh position={[-width/2, height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, depth]} />
        <meshStandardMaterial color={highlightColor} />
      </mesh> */}
      <CabinetCarcass
        id={`${cabinetId}-compartment-${compartmentIndex}`}
        width={width}
        height={height}
        depth={depth}
        color={color}
      />
      {/* Render sections */}
      {sections.map((section, i) => (
        <Section 
          key={`${section.type}-${i}-${width}`}
          type={section.type}
          height={section.height}
          positionY={section.offsetY || 0}
          width={width}
          depth={depth}
          color={color}
          sectionId={`${cabinetId}-compartment-${compartmentIndex}-${section.type}-${i}`}
          isSelected={isSelected}
          onClick={onClick}
        />
      ))}
    </group>
  );
});

export default Compartment;
