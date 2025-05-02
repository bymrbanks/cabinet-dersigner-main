"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Text } from "@react-three/drei"
import { Suspense, useEffect, useRef, useState } from "react"
import Grid from "./grids/grid"
import SideWallGrid from "./grids/side-wall-grid"
import BackWallGrid from "./grids/back-wall-grid"
import FootprintManager, { Footprint } from "./cabinet/FootprintManager"
import { useBlankStore } from "@/store/blank-store"
import ToolbarFloating from "./ToolbarFloating"

function Scene() {
  const orbitControlsRef = useRef<any>(null)
  const { setSelectedPart } = useBlankStore()
  const [showFootprintEditor, setShowFootprintEditor] = useState(false)
  const [footprints, setFootprints] = useState<Footprint[]>([])

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
      
      {/* Footprint Editor */}
      {showFootprintEditor && (
        <FootprintManager onFootprintsChange={handleFootprintsChange} />
      )}

      {/* Footprint Editor Toggle Button */}
      <group position={[9, 0.1, 9]}>
        <mesh 
          position={[0, 0, 0]} 
          onClick={() => setShowFootprintEditor(!showFootprintEditor)}
        >
          <boxGeometry args={[2, 0.1, 0.5]} />
          <meshStandardMaterial color={showFootprintEditor ? "#E91E63" : "#3F51B5"} />
        </mesh>
        <Text
          position={[0, 0.15, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {showFootprintEditor ? "Exit Layout Mode" : "Enter Layout Mode"}
        </Text>
      </group>

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
