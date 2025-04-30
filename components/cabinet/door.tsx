"use client"

import { useMemo, useRef, useEffect } from "react"
import { BoxGeometry } from "three"
import Handle from "./handle"
import SelectionIndicator from "./selection-indicator"
import { useCabinetStore } from "@/store/cabinet-store"
import type { Group } from "three"

interface DoorProps {
  width: number
  height: number
  thickness: number
  position: [number, number, number]
  color: string
  hingePosition?: "left" | "right"
  id: string
}

export default function Door({ width, height, thickness, position, color, hingePosition = "left", id }: DoorProps) {
  // Ensure all dimensions are positive
  const safeWidth = Math.max(0.001, width)
  const safeHeight = Math.max(0.001, height)
  const safeThickness = Math.max(0.001, thickness)

  // Get open state and handle config
  const { setSelectedPart, isPartOpen, toggleOpenState, getHandleById } = useCabinetStore()
  const isOpen = isPartOpen(id)
  const handleConfig = getHandleById(id) || {
    style: "bar",
    orientation: "vertical",
    size: 100,
    position: 50,
    color: "#888888",
  }

  // Create door geometry
  const doorGeometry = useMemo(
    () => new BoxGeometry(safeWidth, safeHeight, safeThickness),
    [safeWidth, safeHeight, safeThickness],
  )

  const doorRef = useRef<Group>(null)
  const doorPivotRef = useRef<Group>(null)

  // Set up the door for selection
  useEffect(() => {
    if (doorRef.current) {
      doorRef.current.name = id
      doorRef.current.position.set(position[0], position[1], position[2])
    }
  }, [id, position])

  // Handle door opening/closing with direct manipulation instead of animation
  useEffect(() => {
    if (doorPivotRef.current) {
      const openRotation = hingePosition === "left" ? Math.PI / 2 : -Math.PI / 2 // 90 degrees
      doorPivotRef.current.rotation.y = isOpen ? openRotation : 0
    }
  }, [isOpen, hingePosition])

  // Calculate handle position based on handle config and hinge position
  const getHandlePosition = () => {
    // Position is a percentage (0-100) from top/left
    const positionPercent = handleConfig.position / 100

    // For vertical handles on doors, position horizontally based on hinge
    if (handleConfig.orientation === "vertical") {
      const handleX = hingePosition === "left" ? safeWidth - 0.05 : 0.05 // 5cm from edge
      const handleY = safeHeight * positionPercent
      return [handleX, handleY, 0]
    }
    // For horizontal handles
    else {
      const handleX = safeWidth * (hingePosition === "left" ? 0.75 : 0.25) // 25% from opposite edge
      const handleY = safeHeight * positionPercent
      return [handleX, handleY, 0]
    }
  }

  // Set the pivot point for rotation based on hinge position
  const pivotX = hingePosition === "left" ? 0 : safeWidth

  // Generate a unique ID for the handle
  const handleId = `${id}-handle`

  // Calculate dimensions for display
  const displayWidth = Math.round(safeWidth * 100)
  const displayHeight = Math.round(safeHeight * 100)

  return (
    <group
      ref={doorRef}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedPart(id)
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        toggleOpenState(id)
      }}
    >
      <group ref={doorPivotRef} position={[pivotX, 0, 0]}>
        <group position={[-pivotX, 0, 0]}>
          <mesh
            geometry={doorGeometry}
            position={[safeWidth / 2, safeHeight / 2, safeThickness / 2]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={color} />
          </mesh>

          <Handle
            position={getHandlePosition()}
            orientation={handleConfig.orientation}
            style={handleConfig.style}
            size={handleConfig.size}
            color={handleConfig.color}
            id={handleId}
          />
        </group>
      </group>

      {/* Selection indicator */}
      <SelectionIndicator
        objectId={id}
        color="#22c55e"
        label={`Door: ${displayWidth}×${displayHeight}mm (${hingePosition} hinge)`}
      />
    </group>
  )
}
