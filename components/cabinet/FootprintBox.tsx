"use client"

import { useState } from "react"
import * as THREE from "three"

const HANDLE_SIZE = 0.3

export interface FootprintBoxProps {
  id: string
  position: [number, number, number]
  width: number
  depth: number
  onUpdate: (id: string, position: [number, number, number], width: number, depth: number) => void
  onDelete?: (id: string) => void
  onSelect?: (id: string) => void
  color?: string
  selected?: boolean
}

export default function FootprintBox({
  id,
  position,
  width,
  depth,
  onUpdate,
  onDelete,
  onSelect,
  color = "#6495ED",
  selected = false
}: FootprintBoxProps) {
  const [dragging, setDragging] = useState<string | null>(null)
  const borderColor = selected ? "#FF4500" : "#4682B4"
  const opacity = selected ? 0.6 : 0.4

  // Handle dragging for resize and movement
  const handlePointerDown = (e: THREE.Event, handle: string) => {
    e.stopPropagation()
    
    // Select this box when clicked
    if (onSelect) {
      onSelect(id)
    }
    
    setDragging(handle)
  }

  const handlePointerUp = () => {
    setDragging(null)
  }

  const handlePointerMove = (e: THREE.Event) => {
    if (!dragging) return

    const delta = e.delta as THREE.Vector3
    
    // Calculate new position and dimensions
    let newPos: [number, number, number] = [...position]
    let newWidth = width
    let newDepth = depth

    if (dragging === "move") {
      // Move the entire box
      newPos = [
        position[0] + delta.x,
        position[1],
        position[2] + delta.z
      ]
    } else {
      // Handle corner resizing
      switch (dragging) {
        case "top-left":
          newPos = [position[0] + delta.x/2, position[1], position[2] + delta.z/2]
          newWidth = Math.max(0.5, width - delta.x)
          newDepth = Math.max(0.5, depth - delta.z)
          break
        case "top-right":
          newPos = [position[0] + delta.x/2, position[1], position[2] + delta.z/2]
          newWidth = Math.max(0.5, width + delta.x)
          newDepth = Math.max(0.5, depth - delta.z)
          break
        case "bottom-left":
          newPos = [position[0] + delta.x/2, position[1], position[2] + delta.z/2]
          newWidth = Math.max(0.5, width - delta.x)
          newDepth = Math.max(0.5, depth + delta.z)
          break
        case "bottom-right":
          newPos = [position[0] + delta.x/2, position[1], position[2] + delta.z/2]
          newWidth = Math.max(0.5, width + delta.x)
          newDepth = Math.max(0.5, depth + delta.z)
          break
      }
    }

    onUpdate(id, newPos, newWidth, newDepth)
  }

  const handleDoubleClick = (e: THREE.Event) => {
    e.stopPropagation()
    if (onDelete) onDelete(id)
  }

  return (
    <group position={position}>
      {/* Main box */}
      <mesh 
        position={[0, 0.02, 0]} 
        onPointerDown={(e) => handlePointerDown(e, "move")}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onDoubleClick={handleDoubleClick}
      >
        <boxGeometry args={[width, 0.02, depth]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </mesh>

      {/* Border */}
      <lineSegments position={[0, 0.025, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, 0.02, depth)]} />
        <lineBasicMaterial color={borderColor} linewidth={2} />
      </lineSegments>

      {/* Resize handles */}
      {selected && (
        <>
          {/* Top-left handle */}
          <mesh
            position={[-width/2, 0.05, -depth/2]}
            onPointerDown={(e) => handlePointerDown(e, "top-left")}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
          >
            <boxGeometry args={[HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>

          {/* Top-right handle */}
          <mesh
            position={[width/2, 0.05, -depth/2]}
            onPointerDown={(e) => handlePointerDown(e, "top-right")}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
          >
            <boxGeometry args={[HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>

          {/* Bottom-left handle */}
          <mesh
            position={[-width/2, 0.05, depth/2]}
            onPointerDown={(e) => handlePointerDown(e, "bottom-left")}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
          >
            <boxGeometry args={[HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>

          {/* Bottom-right handle */}
          <mesh
            position={[width/2, 0.05, depth/2]}
            onPointerDown={(e) => handlePointerDown(e, "bottom-right")}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
          >
            <boxGeometry args={[HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>
        </>
      )}
    </group>
  )
} 