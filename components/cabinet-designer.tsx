"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Suspense, useEffect, useRef, useState, useCallback } from "react"
import Grid from "./grids/grid"
import SideWallGrid from "./grids/side-wall-grid"
import BackWallGrid from "./grids/back-wall-grid"
import FootprintManager, { Footprint } from "./cabinet/FootprintManager"
import { useBlankStore } from "@/store/blank-store"
import ToolbarFloating, { useToolbarState, ToolMode } from "./ToolbarFloating"

function Scene() {
  const orbitControlsRef = useRef<any>(null)
  const { setSelectedPart } = useBlankStore()
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [toolMode, setToolMode] = useState<ToolMode>('select')
  
  // Handle toolbar mode changes
  const handleToolModeChange = useCallback((mode: ToolMode) => {
    setToolMode(mode)
    
    // When switching to layout mode, disable orbit controls
    if (orbitControlsRef.current) {
      if (mode === 'layout') {
        orbitControlsRef.current.enabled = false;
      } else {
        orbitControlsRef.current.enabled = true;
      }
    }
  }, []);
  
  // Subscribe to toolbar state changes
  useToolbarState(handleToolModeChange);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toolMode === 'layout') {
        // Exit layout mode when Escape is pressed
        handleToolModeChange('select');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toolMode, handleToolModeChange]);

  // Handle background click
  const handleBackgroundClick = (e: any) => {
    // Only handle direct background clicks
    if (e.object.name !== "background-plane") return

    // Deselect current selection
    setSelectedPart(null)
  }

  // Handle footprints change
  const handleFootprintsChange = (updatedFootprints: Footprint[]) => {
    setFootprints(updatedFootprints)
    // Here you could add logic to convert footprints to actual cabinets or other objects
  }

  return (
    <>
      <color attach="background" args={["#f5f5f5"]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
      />
      <Environment preset="apartment" />

      {/* Floor Grid */}
      <Grid />
      
      {/* Wall Grids */}
      <SideWallGrid />
      <BackWallGrid />

      {/* Background plane for mouse interaction */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        name="background-plane"
        onClick={handleBackgroundClick}
      >
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
      
      {/* Footprint Editor - only shows when in layout mode */}
      {toolMode === 'layout' && (
        <FootprintManager onFootprintsChange={handleFootprintsChange} />
      )}

      <OrbitControls
        ref={orbitControlsRef}
        className="r3f-orbit-controls"
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        minDistance={2}
        maxDistance={100}
        makeDefault
      />
    </>
  )
}

export default function CabinetDesigner() {
  const { setSelectedPart } = useBlankStore()

  // Initialize history on first render
  useEffect(() => {
    try {
      // Reset selected part on initial load
      setSelectedPart(null)
    } catch (error) {
      console.error("Error initializing:", error)
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* Floating toolbar */}
      <ToolbarFloating />

      <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
