import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import Compartment from "./compartment";
import { generateCompartments } from "./CabinetTemplate";
import { useCabinetStore } from "@/store/cabinet-store";
import CabinetCarcass from "./CabinetCarcass";
export interface CabinetGroupProps {
  position?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  compartmentWidthThreshold?: number;
  id: string; // Cabinet ID (same as footprint ID)
}

export default function CabinetGroup({
  position = [0, 0, 0],
  width = 24,
  height = 30,
  depth = 24,
  color = "#E0C9A6",
  compartmentWidthThreshold = 24,
  id,
}: CabinetGroupProps) {
  const groupRef = useRef<any>(null);
  const { selectedPart, setSelectedPart, saveGeneratedCompartments, addCabinet, cabinets } = useCabinetStore();
  const [localCompartments, setLocalCompartments] = useState([]);
  const initialRenderRef = useRef(true);
  const previousWidthRef = useRef(width);

  // Calculate dimensions for all parts
  const thickness = 0.75; // 3/4 inch material thickness
  const barWidth = 3; // 3 inch bars at top

  // Calculate positions
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const halfHeight = height / 2;

  // Generate the compartments based on width
  // Adjust available width to account for two side panels
  const availableWidth = width - thickness * 2;
  const compartments = generateCompartments(
    availableWidth,
    compartmentWidthThreshold
  );
  
  // Make sure a cabinet exists with this footprint ID
  useEffect(() => {
    // Check if cabinet with this ID already exists
    const cabinetExists = cabinets.some(c => c.id === id);
    
    if (!cabinetExists) {
      // Create a new cabinet with the footprint ID
      addCabinet(position, width, depth, "base", 0, id);
    }
  }, [id, cabinets, addCabinet, position, width, depth]); 
  
  // Save compartments to store when width changes
  useEffect(() => {
    // Only update if width has actually changed or on initial render
    if (initialRenderRef.current || previousWidthRef.current !== width) {
      console.log(`Updating compartments for cabinet ${id} - width: ${width}, previous: ${previousWidthRef.current}`);
      saveGeneratedCompartments(id, compartments);
      previousWidthRef.current = width;
      initialRenderRef.current = false;
    }
  }, [id, compartments, saveGeneratedCompartments, width]);
  
  // Set the name property for the group after it's rendered
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.name = `Cabinet-${id}`;
    }
  }, [id]);
  
  return (
    <group ref={groupRef} position={position} userData={{ type: "cabinet", id }}>
      {/* Render compartments */}
      {compartments.map(({ index, xOffset, width: compartmentWidth }) => (
        <Compartment
          key={`${index}-${compartmentWidth}`}
          cabinetId={id}
          compartmentIndex={index}
          xOffset={xOffset}
          width={compartmentWidth}
          height={height}
          depth={depth}
          color={color}
          thickness={thickness}
          isSelected={selectedPart === `${id}-compartment-${index}`}
          onClick={() => setSelectedPart(`${id}-compartment-${index}`)}
        />
      ))}
    </group>
  );
}
