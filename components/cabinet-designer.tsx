"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Suspense, useEffect, useRef, useState, useCallback } from "react"
import Grid from "./grids/grid"
import SideWallGrid from "./grids/side-wall-grid"
import BackWallGrid from "./grids/back-wall-grid"
import { toolbarState, ToolMode } from "./ToolbarFloating"
import ToolbarFloating, { useToolbarState } from "./ToolbarFloating"
import { useBlankStore } from "@/store/blank-store"
import * as THREE from "three"

// Define the Footprint type directly here
interface Footprint {
  id: string
  position: [number, number, number]
  width: number
  depth: number
  color?: string
  selected?: boolean
}

function Scene() {
  const orbitControlsRef = useRef<any>(null)
  const { gl, scene, camera } = useThree()
  
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [selectedFootprint, setSelectedFootprint] = useState<string | null>(null)
  const [toolMode, setToolMode] = useState<ToolMode>('select')
  
  const { setSelectedPart } = useBlankStore()
  
  // Handle toolbar mode changes
  const handleToolModeChange = useCallback((mode: ToolMode) => {
    console.log("Tool mode changed to:", mode)
    setToolMode(mode)
    
    // When switching to layout mode, disable orbit controls
    if (orbitControlsRef.current) {
      if (mode === 'layout') {
        orbitControlsRef.current.enabled = false
        console.log("Orbit controls disabled for layout mode")
      } else {
        orbitControlsRef.current.enabled = true
        console.log("Orbit controls enabled")
      }
    }
    
    // Deselect any selected footprint when changing modes
    setSelectedFootprint(null)
  }, [])
  
  // Subscribe to toolbar state changes
  useToolbarState(handleToolModeChange)
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toolMode === 'layout') {
        // Exit layout mode when Escape is pressed
        handleToolModeChange('select')
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete selected footprint
        if (selectedFootprint) {
          setFootprints(current => current.filter(fp => fp.id !== selectedFootprint))
          setSelectedFootprint(null)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [toolMode, handleToolModeChange, selectedFootprint])

  // Handle background plane click
  const handlePlaneClick = (e: any) => {
    e.stopPropagation() // Stop event propagation
    
    console.log("Background plane clicked in mode:", toolMode)
    console.log("Click point:", e.point)
    
    if (toolMode === 'layout') {
      // Add a new box at the click position
      const newFootprint: Footprint = {
        id: `footprint-${Date.now()}`,
        position: [e.point.x, 0.01, e.point.z],
        width: 2,
        depth: 2,
        color: "#6495ED",
        selected: false
      }
      
      console.log("Creating new footprint:", newFootprint)
      
      setFootprints(prevFootprints => [...prevFootprints, newFootprint])
      setSelectedFootprint(newFootprint.id)
    } else {
      // In select mode, deselect the current footprint
      setSelectedFootprint(null)
    }
  }
  
  // Handle footprint box click
  const handleBoxClick = (e: any, id: string) => {
    e.stopPropagation() // Stop event from reaching the background plane
    console.log("Box clicked:", id)
    setSelectedFootprint(id)
  }
  
  // Handle footprint double click (delete)
  const handleBoxDoubleClick = (e: any, id: string) => {
    e.stopPropagation()
    console.log("Box double-clicked (deleting):", id)
    setFootprints(footprints => footprints.filter(fp => fp.id !== id))
    setSelectedFootprint(null)
  }
  
  // Render a footprint box
  const renderFootprintBox = (footprint: Footprint) => {
    const { id, position, width, depth, color = "#6495ED" } = footprint
    const isSelected = selectedFootprint === id
    const boxColor = color
    const borderColor = isSelected ? "#FF4500" : "#4682B4"
    const opacity = isSelected ? 0.6 : 0.4
    const handleSize = 0.3
    
    console.log("Rendering footprint:", id, "selected:", isSelected)
    
    return (
      <group 
        key={id} 
        position={position} 
        onClick={(e) => handleBoxClick(e, id)}
        onDoubleClick={(e) => handleBoxDoubleClick(e, id)}
      >
        {/* Main box */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[width, 0.02, depth]} />
          <meshStandardMaterial color={boxColor} transparent opacity={opacity} />
        </mesh>

        {/* Border */}
        <lineSegments position={[0, 0.025, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(width, 0.02, depth)]} />
          <lineBasicMaterial color={borderColor} linewidth={2} />
        </lineSegments>

        {/* Resize handles - only show when selected */}
        {isSelected && (
          <>
            {/* Top-left handle */}
            <mesh position={[-width/2, 0.05, -depth/2]}>
              <boxGeometry args={[handleSize, handleSize, handleSize]} />
              <meshStandardMaterial color="#FF0000" />
            </mesh>

            {/* Top-right handle */}
            <mesh position={[width/2, 0.05, -depth/2]}>
              <boxGeometry args={[handleSize, handleSize, handleSize]} />
              <meshStandardMaterial color="#FF0000" />
            </mesh>

            {/* Bottom-left handle */}
            <mesh position={[-width/2, 0.05, depth/2]}>
              <boxGeometry args={[handleSize, handleSize, handleSize]} />
              <meshStandardMaterial color="#FF0000" />
            </mesh>

            {/* Bottom-right handle */}
            <mesh position={[width/2, 0.05, depth/2]}>
              <boxGeometry args={[handleSize, handleSize, handleSize]} />
              <meshStandardMaterial color="#FF0000" />
            </mesh>
          </>
        )}
      </group>
    )
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
        onClick={handlePlaneClick}
      >
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
      
      {/* Render all footprints */}
      {footprints.map(footprint => renderFootprintBox(footprint))}

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
