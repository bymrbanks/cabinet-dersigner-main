"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import { Suspense, useEffect, useRef } from "react"
import Cabinet from "./cabinet/cabinet"
import Grid from "./cabinet/grid"
import TransformControls from "./cabinet/transform-controls"
import { Button } from "@/components/ui/button"
import { Download, Camera, Undo, Redo, Ruler, GridIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCabinetStore } from "@/store/cabinet-store"
import ToolbarFloating from "./ToolbarFloating"

function Scene() {
  const { toast } = useToast()
  const orbitControlsRef = useRef<any>(null)
  const {
    cabinets,
    selectedPart,
    setSelectedPart,
    activeCabinetId,
    setActiveCabinet,
    addCabinet,
    showDimensionLines,
    snapToGrid,
    toggleOpenState,
  } = useCabinetStore()

  // Handle background click to deselect
  const handleBackgroundClick = (e: any) => {
    // Only handle direct background clicks
    if (e.object.name !== "background-plane") return

    // Deselect current selection
    setSelectedPart(null)
  }

  // Handle adding a new cabinet
  const handleAddCabinet = (position: [number, number, number]) => {
    addCabinet(position)
    toast({
      title: "Cabinet added",
      description: "A new cabinet has been added to the scene",
    })
  }

  // Debug function to open a drawer on load (for testing)
  useEffect(() => {
    // Log all cabinets for debugging
    console.log("All cabinets:", cabinets)
    
    // Log when a part is selected
    if (selectedPart) {
      console.log("Selected part:", selectedPart)
    }
  }, [cabinets, selectedPart])

  return (
    <>
      <color attach="background" args={["#f5f5f5"]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <Environment preset="apartment" />
      <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={20} blur={2} far={4} resolution={256} />

      {/* Grid */}
      <Grid />

      {/* Render all cabinets */}
      {cabinets &&
        cabinets.map((cabinet) => {
          if (!cabinet) return null
          return (
            <Cabinet
              key={cabinet.id}
              id={cabinet.id}
              position={cabinet.position || [0, 0, 0]}
              width={Math.max(1, cabinet.width || 0)}
              height={Math.max(1, cabinet.height || 0)}
              depth={Math.max(1, cabinet.depth || 0)}
              type={cabinet.type || "base"}
              compartments={(cabinet.compartments || []).map((compartment) => ({
                ...compartment,
                sections: (compartment?.sections || []).map((section) => ({
                  ...section,
                  type: section?.type || "door",
                  height: Math.max(1, section?.height || 0),
                })),
              }))}
              materialColor={cabinet.materialColor || "#D1D5DB"}
            />
          )
        })}

      {/* Transform controls for selected objects */}
      <TransformControls />

      {/* Background plane for deselection */}
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
  const { toast } = useToast()
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    showDimensionLines,
    setShowDimensionLines,
    gridVisible,
    setGridVisible,
    snapToGrid,
    setSnapToGrid,
    setSelectedPart,
    toggleAllOpenState,
    selectedPart,
  } = useCabinetStore()

  // Initialize history on first render
  useEffect(() => {
    try {
      useCabinetStore.getState().saveToHistory()

      // Reset selected part on initial load to avoid TransformControls errors
      setSelectedPart(null)
    } catch (error) {
      console.error("Error initializing history:", error)
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant={gridVisible ? "default" : "outline"}
          size="sm"
          onClick={() => setGridVisible(!gridVisible)}
          title={gridVisible ? "Hide grid" : "Show grid"}
        >
          <GridIcon className="h-4 w-4" />
        </Button>
        <Button
          variant={snapToGrid ? "default" : "outline"}
          size="sm"
          onClick={() => setSnapToGrid(!snapToGrid)}
          title={snapToGrid ? "Disable snap" : "Enable snap"}
        >
          <GridIcon className="h-4 w-4" />
          <span className="ml-1">Snap</span>
        </Button>
        <Button
          variant={showDimensionLines ? "default" : "outline"}
          size="sm"
          onClick={() => setShowDimensionLines(!showDimensionLines)}
          title={showDimensionLines ? "Hide dimensions" : "Show dimensions"}
        >
          <Ruler className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => undo()} disabled={!canUndo()}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => redo()} disabled={!canRedo()}>
          <Redo className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const canvas = document.querySelector("canvas")
            if (canvas) {
              try {
                const link = document.createElement("a")
                link.download = "cabinet-screenshot.png"
                link.href = canvas.toDataURL("image/png")
                link.click()
                toast({
                  title: "Screenshot saved",
                  description: "Your cabinet screenshot has been saved",
                })
              } catch (error) {
                console.error("Error taking screenshot:", error)
                toast({
                  title: "Screenshot failed",
                  description: "There was an error taking the screenshot",
                  variant: "destructive",
                })
              }
            }
          }}
        >
          <Camera className="h-4 w-4 mr-2" />
          Screenshot
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            toast({
              title: "Export feature disabled",
              description: "3D export is not available in the preview environment",
            })
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export 3D
        </Button>
      </div>

      {/* Add Open/Close All buttons */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white p-2 rounded-md shadow-md">
        <Button variant="outline" size="sm" onClick={() => toggleAllOpenState(true)}>
          Open All
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleAllOpenState(false)}>
          Close All
        </Button>
      </div>

      {/* Selection info panel */}
      {selectedPart && (
        <div className="absolute bottom-4 left-4 z-10 bg-white p-3 rounded-md shadow-md max-w-xs">
          <div className="font-medium mb-1">Selected:</div>
          <div className="text-sm truncate">{selectedPart}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {selectedPart.includes("cabinet") && !selectedPart.includes("door") && !selectedPart.includes("drawer")
              ? "Use transform controls to move cabinet"
              : selectedPart.includes("door") || selectedPart.includes("drawer")
                ? "Double-click to open/close"
                : "Click to customize"}
          </div>
        </div>
      )}

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
