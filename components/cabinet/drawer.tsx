"use client"

import { useMemo, useRef, useEffect } from "react"
import { BoxGeometry } from "three"
import Handle from "./handle"
import { useCabinetStore } from "@/store/cabinet-store"
import type { Group } from "three"

interface DrawerProps {
  width: number
  height: number
  thickness: number
  position: [number, number, number]
  color: string
  id: string
}

export default function Drawer({ width, height, thickness, position, color, id }: DrawerProps) {
  // Ensure all dimensions are positive
  const safeWidth = Math.max(0.001, width)
  const safeHeight = Math.max(0.001, height)
  const safeThickness = Math.max(0.001, thickness)

  // Get open state and handle config
  const { setSelectedPart, isPartOpen, toggleOpenState, getHandleById } = useCabinetStore()
  const isOpen = isPartOpen(id)
  const handleConfig = getHandleById(id) || {
    style: "bar",
    orientation: "horizontal",
    size: 100,
    position: 50,
    color: "#888888",
  }

  // Create drawer front geometry
  const drawerGeometry = useMemo(
    () => new BoxGeometry(safeWidth, safeHeight, safeThickness),
    [safeWidth, safeHeight, safeThickness],
  )

  const drawerRef = useRef<Group>(null)

  // Set up the drawer for selection
  useEffect(() => {
    if (drawerRef.current) {
      drawerRef.current.name = id

      // Calculate open position
      const openDistance = 0.25 // 25cm in our scale
      const zPosition = isOpen ? position[2] + openDistance : position[2]

      // Set position directly
      drawerRef.current.position.set(position[0], position[1], zPosition)
    }
  }, [id, position, isOpen])

  // Calculate handle position based on handle config
  const getHandlePosition = () => {
    // Position is a percentage (0-100) from top/left
    const positionPercent = handleConfig.position / 100

    if (handleConfig.orientation === "horizontal") {
      return [safeWidth * positionPercent, safeHeight / 2, 0]
    } else {
      return [safeWidth / 2, safeHeight * positionPercent, 0]
    }
  }

  // Generate a unique ID for the handle
  const handleId = `${id}-handle`

  return (
    <group
      ref={drawerRef}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedPart(id)
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        toggleOpenState(id)
      }}
    >
      <mesh
        geometry={drawerGeometry}
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

      {/* Draw the drawer box when open */}
      {isOpen && (
        <mesh position={[safeWidth / 2, safeHeight / 2, -0.125]} castShadow>
          <boxGeometry args={[safeWidth - 0.02, safeHeight - 0.02, 0.25]} />
          <meshStandardMaterial color={color} opacity={0.9} transparent />
        </mesh>
      )}
    </group>
  )
}
