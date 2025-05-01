"use client";
// Marks this component as a client-side component in Next.js

import { useMemo, useRef, useEffect } from "react";
// Import React hooks for optimization, DOM references, and side effects
import { BoxGeometry, type Group } from "three";
// Import Three.js BoxGeometry for creating 3D box shapes
import Handle from "./handle";
// Import the Handle component for drawer handles
import SelectionIndicator from "./selection-indicator";
// Import SelectionIndicator component to show when drawer is selected
import { useCabinetStore } from "@/store/cabinet-store";
// Import custom store hook for cabinet state management

interface DrawerProps {
  width: number; // Width of the drawer in meters
  height: number; // Height of the drawer in meters
  thickness: number; // Thickness of the drawer front and all panels in meters
  position: [number, number, number]; // 3D position coordinates [x, y, z]
  color: string; // Color of the drawer front
  id: string; // Unique identifier for the drawer
}

export default function Drawer({
  width,
  height,
  thickness,
  position,
  color,
  id,
}: DrawerProps) {
  // Get drawer state and functions from the cabinet store
  const { setSelectedPart, isPartOpen, toggleOpenState, getHandleById, cabinets } =
    useCabinetStore();
  
  // Get the cabinet ID from the drawer ID
  const cabinetId = id.split('-compartment')[0];
  
  // Find the cabinet that contains this drawer
  const cabinet = cabinets.find(c => c.id === cabinetId);
  
  // DRAWER DIMENSIONS
  // Base dimensions
  const drawerWidth = Math.max(0.001, width);
  const drawerHeight = Math.max(0.001, height);
  const panelThickness = Math.max(0.001, thickness); // Use passed thickness for all panels
  
  // Cabinet and drawer depth
  const cabinetDepthMm = cabinet?.depth || 580; // Default to 580mm if not found
  console.log(cabinetDepthMm , "cabinetDepthMm");
  const cabinetDepthM = cabinetDepthMm / 100; // Convert to cm
  
  // Use full cabinet depth for drawer (minus small gap)
  const drawerDepth = cabinetDepthM * 0.95; // 95% of cabinet depth
  
  // Derived dimensions for drawer parts
  const bottomWidth = drawerWidth - (2 * panelThickness); // Account for side panels
  const bottomDepth = drawerDepth - panelThickness; // Account for back panel
  const sideHeight = drawerHeight - (2 * panelThickness); // Account for top/bottom
  const sideDepth = drawerDepth - panelThickness; // Account for back panel
  const backWidth = drawerWidth - (2 * panelThickness); // Account for side panels
  const backHeight = drawerHeight - (2 * panelThickness); // Account for top/bottom
  
  // Colors
  const exteriorColor = color;
  const interiorColor = color === "#D1D5DB" ? "#A0A0A0" : "#8E8E8E";
  
  // State and configuration
  const isOpen = isPartOpen(id);
  const openDistance = isOpen ? -drawerDepth * 0.8 : 0; // Open in negative Z direction (into cabinet)
  const handleConfig = getHandleById(id) || {
    style: "bar",
    orientation: "horizontal",
    size: 100,
    position: 50,
    color: "#888888",
  };

  // Create drawer front geometry
  const drawerGeometry = useMemo(
    () => new BoxGeometry(drawerWidth, drawerHeight, panelThickness),
    [drawerWidth, drawerHeight, panelThickness]
  );

  // Refs for drawer groups
  const drawerRef = useRef<Group>(null);
  const drawerBodyRef = useRef<Group>(null);

  // Position the drawer
  useEffect(() => {
    if (drawerRef.current) {
      drawerRef.current.name = id;
      drawerRef.current.position.set(position[0], position[1], position[2]);
    }

    if (drawerBodyRef.current) {
      drawerBodyRef.current.position.z = openDistance;
    }
  }, [id, position, openDistance]);

  // Calculate handle position
  const getHandlePosition = () => {
    const positionPercent = handleConfig.position / 100;
    
    if (handleConfig.orientation === "horizontal") {
      return [drawerWidth * positionPercent, drawerHeight / 2, 0];
    } else {
      return [drawerWidth / 2, drawerHeight * positionPercent, 0];
    }
  };

  // Handle ID
  const handleId = `${id}-handle`;

  // Display dimensions in mm
  const displayWidth = Math.round(drawerWidth * 100);
  const displayHeight = Math.round(drawerHeight * 100);

  return (
    <group
      ref={drawerRef}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedPart(id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        toggleOpenState(id);
      }}
    >
      <group ref={drawerBodyRef}>
        {/* Drawer front */}
        <mesh
          geometry={drawerGeometry}
          position={[drawerWidth / 2, drawerHeight / 2, panelThickness / 2]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={exteriorColor} />
        </mesh>

        {/* Handle */}
        <Handle
          position={getHandlePosition() as [number, number, number]}
          orientation={handleConfig.orientation}
          style={handleConfig.style}
          size={handleConfig.size}
          color={handleConfig.color}
          id={handleId}
        />

        {/* Drawer box - position adjusted to be behind the front panel */}
        <group position={[0, 0, panelThickness]}>
          {/* Bottom panel */}
          <mesh 
            position={[drawerWidth / 2, panelThickness / 2, drawerDepth / 2 - panelThickness / 2]} 
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[bottomWidth, panelThickness, bottomDepth]} />
            <meshStandardMaterial color={interiorColor} />
          </mesh>

          {/* Left side panel */}
          <mesh 
            position={[panelThickness / 2, drawerHeight / 2, drawerDepth / 2 - panelThickness / 2]} 
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[panelThickness, sideHeight, sideDepth]} />
            <meshStandardMaterial color={interiorColor} />
          </mesh>

          {/* Right side panel */}
          <mesh 
            position={[drawerWidth - panelThickness / 2, drawerHeight / 2, drawerDepth / 2 - panelThickness / 2]} 
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[panelThickness, sideHeight, sideDepth]} />
            <meshStandardMaterial color={interiorColor} />
          </mesh>

          {/* Back panel */}
          <mesh 
            position={[drawerWidth / 2, drawerHeight / 2, drawerDepth - panelThickness ]} 
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[backWidth, backHeight, panelThickness]} />
            <meshStandardMaterial color={interiorColor} />
          </mesh>
          
          {/* Top panel (optional)
          <mesh 
            position={[drawerWidth / 2, drawerHeight - panelThickness / 2, drawerDepth / 2]} 
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[bottomWidth, panelThickness,panelThickness * 3]} />
            <meshStandardMaterial color={interiorColor} />
          </mesh> */}
        </group>
      </group>

      {/* Selection indicator */}
      <SelectionIndicator
        objectId={id}
        color="#f59e0b"
        label={`Drawer: ${displayWidth}×${displayHeight}mm`}
      />
    </group>
  );
}
