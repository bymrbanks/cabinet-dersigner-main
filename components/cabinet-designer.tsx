"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Suspense, useEffect, useRef, useState, useCallback, createContext } from "react"
import Grid from "./grids/grid"
import SideWallGrid from "./grids/side-wall-grid"
import BackWallGrid from "./grids/back-wall-grid"
import { toolbarState, ToolMode } from "./ToolbarFloating"
import ToolbarFloating, { useToolbarState } from "./ToolbarFloating"
import { useBlankStore } from "@/store/blank-store"
import { useThree } from "@react-three/fiber"
import FootprintManager from "./footprint/FootprintManager"
import AttributesPanel from "./footprint/AttributesPanel"
import Outliner from "./footprint/Outliner"
import { Footprint } from "./footprint/types"

// Create a context for sharing footprint data between components
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

export default function CabinetDesigner() {
  const { setSelectedPart } = useBlankStore()
  
  // Global state for footprints
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [selectedFootprintId, setSelectedFootprintId] = useState<string | null>(null)

  // Log footprints state changes at the top level
  useEffect(() => {
    console.log("CabinetDesigner: Footprints state updated:", footprints.length)
  }, [footprints])

  // Callback to update a footprint
  const updateFootprint = useCallback((id: string, updates: Partial<Footprint>) => {
    setFootprints(prevFootprints =>
      prevFootprints.map(fp =>
        fp.id === id ? { ...fp, ...updates } : fp
      )
    )
  }, [])
  
  // Create a wrapped setFootprints function that logs updates
  const handleSetFootprints = useCallback((newFootprints: Footprint[]) => {
    console.log("Setting footprints:", newFootprints.length)
    setFootprints(newFootprints)
  }, [])

  // Initialize history on first render
  useEffect(() => {
    try {
      // Reset selected part on initial load
      setSelectedPart(null)
    } catch (error) {
      console.error("Error initializing:", error)
    }
  }, [])

  // Get the selected footprint for the attributes panel
  const selectedFootprint = footprints.find(fp => fp.id === selectedFootprintId) || null

  // Create context value
  const footprintContextValue = {
    footprints,
    selectedFootprint: selectedFootprintId,
    updateFootprint
  }

  return (
    <FootprintContext.Provider value={footprintContextValue}>
      <div className="relative w-full h-full flex">
        {/* Outliner panel on the left */}
        <Outliner 
          footprints={footprints}
          selectedFootprintId={selectedFootprintId}
          onSelectFootprint={setSelectedFootprintId}
          onUpdateFootprint={updateFootprint}
        />
        
        {/* Main canvas area */}
        <div className="flex-1 relative">
          {/* Floating toolbar */}
          <ToolbarFloating />

          <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }}>
            <Suspense fallback={null}>
              <SceneContent 
                footprints={footprints}
                selectedFootprintId={selectedFootprintId}
                setFootprints={handleSetFootprints}
                setSelectedFootprintId={setSelectedFootprintId}
              />
            </Suspense>
          </Canvas>
        </div>
        
        {/* Attributes panel */}
        <AttributesPanel 
          footprint={selectedFootprint}
          updateFootprint={updateFootprint}
        />
      </div>
    </FootprintContext.Provider>
  )
}

// Separate Scene content so it can receive props
interface SceneContentProps {
  footprints: Footprint[];
  selectedFootprintId: string | null;
  setFootprints: (footprints: Footprint[]) => void;
  setSelectedFootprintId: (id: string | null) => void;
}

function SceneContent({
  footprints,
  selectedFootprintId,
  setFootprints,
  setSelectedFootprintId
}: SceneContentProps) {
  const orbitControlsRef = useRef<any>(null)
  const { camera, gl } = useThree()
  
  const [toolMode, setToolMode] = useState<ToolMode>('select')
  const [cursor, setCursor] = useState<string>("auto")
  
  const { setSelectedPart } = useBlankStore()
  
  // Log when footprints change
  useEffect(() => {
    console.log("SceneContent: Footprints updated:", footprints.length);
    footprints.forEach(fp => console.log(" - Footprint:", fp.id, fp.position));
  }, [footprints]);
  
  // Function to safely update footprints
  const updateFootprintsArray = useCallback((newFootprints: Footprint[]) => {
    console.log("SceneContent: Updating footprints array:", newFootprints.length);
    setFootprints(newFootprints);
  }, [setFootprints]);
  
  // Handle toolbar mode changes
  const handleToolModeChange = useCallback((mode: ToolMode) => {
    console.log("SceneContent: Tool mode changed to:", mode)
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
  const { currentMode } = useToolbarState(handleToolModeChange)
  
  // Force sync of local state with global toolbar state
  useEffect(() => {
    console.log("Syncing local state with toolbar state:", currentMode)
    if (currentMode !== toolMode) {
      setToolMode(currentMode)
    }
  }, [currentMode, toolMode])
  
  // Log when we render with different modes
  useEffect(() => {
    console.log("SceneContent rendering with toolMode:", toolMode)
    console.log("Global toolbar state mode:", toolbarState.toolMode)
  }, [toolMode])
  
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
        onFootprintsChange={updateFootprintsArray}
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
    </>
  )
}
