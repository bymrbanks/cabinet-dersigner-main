"use client";

import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import Handle from "./handle";
import SelectionIndicator from "./selection-indicator";

interface DrawerProps {
  width: number; // Width of the drawer opening in meters
  height: number; // Height of the drawer opening in meters
  depth: number; // Depth of the drawer opening in meters
  position: [number, number, number]; // 3D position coordinates [x, y, z]
  color: string; // Color of the drawer front
  id: string; // Unique identifier for the drawer
  isSelected?: boolean; // Whether the drawer is selected
  isOpen?: boolean; // Whether the drawer is open
  onSelect?: (id: string) => void; // Callback when drawer is selected
  onToggleOpen?: (id: string) => void; // Callback when drawer is opened/closed
  handleConfig?: {
    style: "bar" | "knob";
    orientation: "horizontal" | "vertical";
    size: number;
    position: number;
    color: string;
  };
}

export default function Drawer({
  width,
  height,
  depth,
  position,
  color,
  id,
  isSelected = false,
  isOpen = false,
  onSelect = () => {},
  onToggleOpen = () => {},
  handleConfig = {
    style: "bar",
    orientation: "horizontal",
    size: 100,
    position: 50,
    color: "#888888",
  },
}: DrawerProps) {
  // Convert inches to meters for fixed panel thicknesses
  const inchToMeters = 0.0254;
  const frontPanelThicknessM = 0.75 * inchToMeters; // 3/4 inch
  const sidePanelThicknessM = 0.5 * inchToMeters; // 1/2 inch
  const backPanelThicknessM = 0.5 * inchToMeters; // 1/2 inch
  const bottomPanelThicknessM = 0.25 * inchToMeters; // 1/4 inch

  // DRAWER DIMENSIONS - Based on provided props and fixed thicknesses
  // Ensure minimum dimensions
  const outerWidth = Math.max(0.01, width);
  const outerHeight = Math.max(0.01, height);
  const outerDepth = Math.max(0.01, depth);

  // Inner dimensions for the drawer box content area
  const innerWidth = outerWidth - 2 * sidePanelThicknessM;
  const innerHeight = outerHeight - bottomPanelThicknessM;
  const innerDepth = outerDepth - frontPanelThicknessM - backPanelThicknessM;

  // Dimensions for each panel
  // Front Panel
  const frontPanelWidth = outerWidth;
  const frontPanelHeight = outerHeight;

  // Bottom Panel
  const bottomPanelWidth = innerWidth;
  const bottomPanelDepth = innerDepth + backPanelThicknessM;

  // Side Panels (Left & Right)
  const sidePanelHeight = innerHeight;
  const sidePanelDepth = innerDepth + backPanelThicknessM;

  // Back Panel
  const backPanelWidth = innerWidth;
  const backPanelHeight = innerHeight;

  // Colors
  const exteriorColor = color;
  const interiorColor = color === "#D1D5DB" ? "#A0A0A0" : "#8E8E8E";

  // Open distance depends on the actual depth of the drawer box
  const openDistance = isOpen ? -(outerDepth - frontPanelThicknessM) * 0.8 : 0;
  
  // Create drawer front geometry using its specific thickness
  const drawerFrontGeometry = useMemo(
    () => new THREE.BoxGeometry(frontPanelWidth, frontPanelHeight, frontPanelThicknessM),
    [frontPanelWidth, frontPanelHeight, frontPanelThicknessM]
  );

  // Refs for drawer groups
  const drawerRef = useRef<THREE.Group>(null);
  const drawerBodyRef = useRef<THREE.Group>(null);

  // Position the drawer group based on props
  useEffect(() => {
    if (drawerRef.current) {
      drawerRef.current.name = id;
      drawerRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [id, position]);

  // Animate the opening/closing of the drawer
  useEffect(() => {
    if (drawerBodyRef.current) {
      drawerBodyRef.current.position.z = openDistance;
    }
  }, [openDistance]);

  // Calculate handle position relative to the front panel center
  const getHandlePosition = () => {
    const positionPercent = handleConfig.position / 100;
    const handleSizeM = (handleConfig.size || 100) / 1000;

    // Position slightly proud of the front face
    const z = frontPanelThicknessM / 2 + 0.005;
    
    // Center the handle on the front panel
    return [
      frontPanelWidth / 2,
      frontPanelHeight / 2,
      z
    ] as [number, number, number];
  };

  // Handle ID
  const handleId = `${id}-handle`;

  // Display dimensions in mm for the label
  const displayWidth = Math.round(outerWidth * 1000);
  const displayHeight = Math.round(outerHeight * 1000);
  const displayDepth = Math.round(outerDepth * 1000);

  return (
    <group
      ref={drawerRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onToggleOpen(id);
      }}
    >
      {/* This group moves in/out for opening */}
      <group ref={drawerBodyRef}>
        {/* Drawer front panel */}
        <mesh
          geometry={drawerFrontGeometry}
          position={[frontPanelWidth / 2, frontPanelHeight / 2, frontPanelThicknessM / 2]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={exteriorColor} />
        </mesh>

        {/* Handle */}
        <Handle
          position={getHandlePosition()}
          orientation={handleConfig.orientation}
          style={handleConfig.style}
          size={handleConfig.size}
          color={handleConfig.color}
          id={handleId}
        />

        {/* Drawer box - behind the front panel */}
        <group position={[0, 0, frontPanelThicknessM]}>
          {/* Bottom panel */}
          <mesh
            position={[
              sidePanelThicknessM + innerWidth / 2,
              bottomPanelThicknessM / 2,
              backPanelThicknessM + innerDepth / 2
            ]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[bottomPanelWidth, bottomPanelThicknessM, bottomPanelDepth]} />
            <meshStandardMaterial color={interiorColor} />
          </mesh>

          {/* Left side panel */}
          <mesh
            position={[
              sidePanelThicknessM / 2,
              bottomPanelThicknessM + innerHeight / 2,
              backPanelThicknessM + innerDepth / 2
            ]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[sidePanelThicknessM, sidePanelHeight, sidePanelDepth]} />
            <meshStandardMaterial color={interiorColor} />
          </mesh>

          {/* Right side panel */}
          <mesh
            position={[
              sidePanelThicknessM + innerWidth + sidePanelThicknessM / 2,
              bottomPanelThicknessM + innerHeight / 2,
              backPanelThicknessM + innerDepth / 2
            ]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[sidePanelThicknessM, sidePanelHeight, sidePanelDepth]} />
            <meshStandardMaterial color={interiorColor} />
          </mesh>

          {/* Back panel */}
          <mesh
            position={[
              sidePanelThicknessM + innerWidth / 2,
              bottomPanelThicknessM + innerHeight / 2,
              backPanelThicknessM / 2
            ]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[backPanelWidth, backPanelHeight, backPanelThicknessM]} />
            <meshStandardMaterial color={interiorColor} />
          </mesh>
        </group>
      </group>

      {/* Selection indicator */}
      {isSelected && (
        <SelectionIndicator
          objectId={id}
          color="#f59e0b"
          label={`Drawer: ${displayWidth}×${displayHeight}×${displayDepth}mm`}
        />
      )}
    </group>
  );
} 