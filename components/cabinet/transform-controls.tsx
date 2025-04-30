"use client"

import { useEffect, useRef, useState } from "react"
import { useThree } from "@react-three/fiber"
import { TransformControls as DreiTransformControls } from "@react-three/drei"
import { useCabinetStore } from "@/store/cabinet-store"
import type * as THREE from "three"

export default function TransformControls() {
  const { scene, camera } = useThree()
  const transformRef = useRef<any>(null)
  const { selectedPart, moveCabinet, snapToGrid, saveToHistory } = useCabinetStore()
  const objectRef = useRef<THREE.Object3D | null>(null)
  const startPositionRef = useRef<THREE.Vector3 | null>(null)
  const [transformMode, setTransformMode] = useState<"translate" | "rotate" | "scale">("translate")
  const orbitControlsRef = useRef<any>(null)

  // Find orbit controls to disable during transform
  useEffect(() => {
    // Find the OrbitControls in the scene
    const orbitControls = document.querySelector("canvas")?.parentElement?.querySelector(".orbit-controls")
    if (orbitControls) {
      orbitControlsRef.current = orbitControls
    }
  }, [])

  // Find and attach to selected object
  useEffect(() => {
    if (!transformRef.current || !selectedPart) return

    // Only attach to cabinet objects (not doors, drawers, or handles)
    if (
      !selectedPart.startsWith("cabinet-") ||
      selectedPart.includes("-door-") ||
      selectedPart.includes("-drawer-") ||
      selectedPart.includes("-handle")
    ) {
      transformRef.current.detach()
      objectRef.current = null
      return
    }

    const object = scene.getObjectByName(selectedPart)
    if (!object) return

    transformRef.current.attach(object)
    transformRef.current.setMode(transformMode)
    objectRef.current = object
    startPositionRef.current = object.position.clone()
  }, [selectedPart, scene, transformMode])

  // Handle transform changes
  const handleTransformChange = () => {
    if (!objectRef.current || !selectedPart.startsWith("cabinet-")) return

    // Apply snap to grid if enabled
    if (snapToGrid && transformRef.current.mode === "translate") {
      const gridSize = 0.4 // 10cm grid
      objectRef.current.position.x = Math.round(objectRef.current.position.x / gridSize) * gridSize
      objectRef.current.position.y = Math.round(objectRef.current.position.y / gridSize) * gridSize
      objectRef.current.position.z = Math.round(objectRef.current.position.z / gridSize) * gridSize
    }

    // Update cabinet position in store
    moveCabinet(selectedPart, [
      objectRef.current.position.x,
      objectRef.current.position.y,
      objectRef.current.position.z,
    ])
  }

  // Save history when transform ends
  const handleTransformEnd = () => {
    if (startPositionRef.current && objectRef.current) {
      // Only save if position actually changed
      if (!startPositionRef.current.equals(objectRef.current.position)) {
        saveToHistory()
      }
      startPositionRef.current = null
    }
  }

  // Disable/enable orbit controls when dragging
  const handleDraggingChange = (event: { value: boolean }) => {
    // Find the OrbitControls instance directly
    const orbitControls = document.querySelector("canvas")?.parentElement?.querySelector(".r3f-orbit-controls")

    if (orbitControls) {
      // Access the __r3f instance which contains the actual OrbitControls object
      const orbitControlsInstance = (orbitControls as any).__r3f?.memoizedProps?.ref?.current

      if (orbitControlsInstance) {
        if (event.value) {
          // Disable orbit controls during transform
          orbitControlsInstance.enabled = false
        } else {
          // Re-enable orbit controls after transform
          orbitControlsInstance.enabled = true
        }
      }
    }
  }

  // Handle mode change
  const handleModeChange = (mode: "translate" | "rotate" | "scale") => {
    setTransformMode(mode)
    if (transformRef.current) {
      transformRef.current.setMode(mode)
    }
  }

  return (
    <>
      <DreiTransformControls
        ref={transformRef}
        mode={transformMode}
        size={0.5}
        onObjectChange={handleTransformChange}
        onMouseUp={handleTransformEnd}
        onDragging={handleDraggingChange}
      />

      {selectedPart &&
        selectedPart.startsWith("cabinet-") &&
        !selectedPart.includes("-door-") &&
        !selectedPart.includes("-drawer-") &&
        !selectedPart.includes("-handle") && (
          <group position={[0, -1, 0]}>
            {/* Translate mode button */}
            <group position={[-0.3, 0, 0]} onClick={() => handleModeChange("translate")}>
              <mesh>
                <sphereGeometry args={[0.05]} />
                <meshStandardMaterial color={transformMode === "translate" ? "#2563eb" : "#94a3b8"} />
              </mesh>
              {/* X, Y, Z arrows to indicate translate */}
              <group scale={0.5}>
                <mesh position={[0.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                  <coneGeometry args={[0.02, 0.04, 8]} />
                  <meshStandardMaterial color="#ff0000" />
                </mesh>
                <mesh position={[0, 0.1, 0]}>
                  <coneGeometry args={[0.02, 0.04, 8]} />
                  <meshStandardMaterial color="#00ff00" />
                </mesh>
                <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
                  <coneGeometry args={[0.02, 0.04, 8]} />
                  <meshStandardMaterial color="#0000ff" />
                </mesh>
              </group>
            </group>

            {/* Rotate mode button */}
            <group position={[0, 0, 0]} onClick={() => handleModeChange("rotate")}>
              <mesh>
                <sphereGeometry args={[0.05]} />
                <meshStandardMaterial color={transformMode === "rotate" ? "#2563eb" : "#94a3b8"} />
              </mesh>
              {/* Circle to indicate rotate */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.07, 0.01, 8, 16]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
            </group>

            {/* Scale mode button */}
            <group position={[0.3, 0, 0]} onClick={() => handleModeChange("scale")}>
              <mesh>
                <sphereGeometry args={[0.05]} />
                <meshStandardMaterial color={transformMode === "scale" ? "#2563eb" : "#94a3b8"} />
              </mesh>
              {/* Cube to indicate scale */}
              <mesh>
                <boxGeometry args={[0.06, 0.06, 0.06]} />
                <meshStandardMaterial color="#ffffff" wireframe />
              </mesh>
            </group>
          </group>
        )}
    </>
  )
}
