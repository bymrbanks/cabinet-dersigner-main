"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Suspense, useEffect, useRef, useState, useCallback } from "react"
import Grid from "./grids/grid"
import SideWallGrid from "./grids/side-wall-grid"
import BackWallGrid from "./grids/back-wall-grid"
import { toolbarState, ToolMode } from "./ToolbarFloating"
import ToolbarFloating, { useToolbarState } from "./ToolbarFloating"
import { useBlankStore } from "@/store/blank-store"
import { useThree } from "@react-three/fiber"
import FootprintManager from "./footprint/FootprintManager"
import AttributesPanel from "./footprint/AttributesPanel"
import { Footprint } from "./footprint/types"

// Create a context for sharing footprint data between components
import { createContext } from 'react'

interface FootprintContextType {
  footprints: Footprint[];
  selectedFootprint: string | null;
  updateFootprint: (id: string, updates: Partial<Footprint>) => void;
}

export const FootprintContext = createContext<FootprintContextType>({
  footprints: [],
  selectedFootprint: null,
  updateFootprint: () => {},
});

function Scene() {
  const orbitControlsRef = useRef<any>(null)
  const { camera, gl } = useThree()
  
  const [toolMode, setToolMode] = useState<ToolMode>('select')
  const [cursor, setCursor] = useState<string>("auto")
  
  // Footprint state for sharing between components
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [selectedFootprintId, setSelectedFootprintId] = useState<string | null>(null)
  
  // Callback to update a footprint from either the manager or attributes panel
  const updateFootprint = useCallback((id: string, updates: Partial<Footprint>) => {
    setFootprints(prevFootprints =>
      prevFootprints.map(fp =>
        fp.id === id ? { ...fp, ...updates } : fp
      )
    )
  }, [])
  
  const { setSelectedPart } = useBlankStore()
  
  // Handle toolbar mode changes
  const handleToolModeChange = useCallback((mode: ToolMode) => {
    console.log("Tool mode changed to:", mode)
    setToolMode(mode)
    
    // When switching to layout mode, disable orbit controls
    if (orbitControlsRef.current) {
      if (mode === 'layout') {
        orbitControlsRef.current.enabled = false
        setCursor("crosshair")
        console.log("Orbit controls disabled for layout mode")
      } else {
        orbitControlsRef.current.enabled = true
        setCursor("auto")
        console.log("Orbit controls enabled")
      }
    }
  }, [])
  
  // Subscribe to toolbar state changes
  useToolbarState(handleToolModeChange)
  
  // Apply cursor style to the canvas
  useEffect(() => {
    const canvas = gl.domElement
    canvas.style.cursor = cursor
    
    return () => {
      canvas.style.cursor = 'auto'
    }
  }, [cursor, gl])
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toolMode === 'layout') {
        // Exit layout mode when Escape is pressed
        handleToolModeChange('select')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [toolMode, handleToolModeChange])

  // Get the selected footprint based on ID
  const selectedFootprint = footprints.find(fp => fp.id === selectedFootprintId) || null

  // Create context value for sharing footprint data
  const footprintContextValue = {
    footprints,
    selectedFootprint: selectedFootprintId,
    updateFootprint
  }

  return (
    <FootprintContext.Provider value={footprintContextValue}>
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

      {/* Footprint Manager */}
      <FootprintManager 
        orbitControlsRef={orbitControlsRef}
        toolMode={toolMode}
        setCursor={setCursor}
        onFootprintsChange={setFootprints}
        onSelectFootprint={setSelectedFootprintId}
        footprints={footprints}
        selectedFootprint={selectedFootprintId}
      />

      <OrbitControls
        ref={orbitControlsRef}
        className="r3f-orbit-controls"
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        minDistance={2}
        maxDistance={100}
        makeDefault
      />
    </FootprintContext.Provider>
  )
}

export default function CabinetDesigner() {
  const { setSelectedPart } = useBlankStore()
  const [selectedFootprint, setSelectedFootprint] = useState<Footprint | null>(null)
  const [footprints, setFootprints] = useState<Footprint[]>([])

  // Initialize history on first render
  useEffect(() => {
    try {
      // Reset selected part on initial load
      setSelectedPart(null)
    } catch (error) {
      console.error("Error initializing:", error)
    }
  }, [])

  // Update selected footprint when footprints change
  useEffect(() => {
    if (footprints.length > 0) {
      const selected = footprints.find(fp => fp.selected)
      setSelectedFootprint(selected || null)
    } else {
      setSelectedFootprint(null)
    }
  }, [footprints])

  // Handler to update footprint from the attributes panel
  const handleUpdateFootprint = (id: string, updates: Partial<Footprint>) => {
    setFootprints(prevFootprints =>
      prevFootprints.map(fp =>
        fp.id === id ? { ...fp, ...updates } : fp
      )
    )
  }

  return (
    <div className="relative w-full h-full flex">
      {/* Main canvas area */}
      <div className="flex-1 relative">
        {/* Floating toolbar */}
        <ToolbarFloating />

        <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Attributes panel */}
      <AttributesPanel 
        footprint={selectedFootprint}
        updateFootprint={handleUpdateFootprint}
      />
    </div>
  )
}
