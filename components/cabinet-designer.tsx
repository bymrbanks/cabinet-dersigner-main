"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import { Suspense, useEffect, useRef, useState } from "react"
import Cabinet from "./cabinet/cabinet"
import Grid from "./cabinet/grid"
import TransformControls from "./cabinet/transform-controls"
import { useCabinetStore } from "@/store/cabinet-store"
import ToolbarFloating from "./ToolbarFloating"

function Scene() {
  const orbitControlsRef = useRef<any>(null)
  const {
    cabinets,
    selectedPart,
    setSelectedPart,
    addCabinet,
    snapToGrid,
  } = useCabinetStore()

  // Handle background click to deselect
  const handleBackgroundClick = (e: any) => {
    // Only handle direct background clicks
    if (e.object.name !== "background-plane") return

    // Deselect current selection
    setSelectedPart(null)
  }

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
              rotation={cabinet.rotation || 0}
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
