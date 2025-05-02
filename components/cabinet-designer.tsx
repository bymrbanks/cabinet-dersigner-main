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

function Scene() {
  const orbitControlsRef = useRef<any>(null)
  const { camera, gl } = useThree()
  
  const [toolMode, setToolMode] = useState<ToolMode>('select')
  const [cursor, setCursor] = useState<string>("auto")
  
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

      {/* Footprint Manager */}
      <FootprintManager 
        orbitControlsRef={orbitControlsRef}
        toolMode={toolMode}
        setCursor={setCursor}
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
