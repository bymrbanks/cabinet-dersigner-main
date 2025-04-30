"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useThree } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

interface ResizeHandleProps {
  position: [number, number, number]
  direction: "x" | "y" | "z"
  onResize: (delta: number) => void
  visible: boolean
}

export default function ResizeHandle({ position, direction, onResize, visible }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startPositionRef = useRef<THREE.Vector3 | null>(null)
  const { camera } = useThree()

  // Handle pointer down
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    startPositionRef.current = new THREE.Vector3(e.clientX, e.clientY, 0)

    // Add event listeners to window
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
  }

  // Handle pointer move
  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging || !startPositionRef.current) return

    const currentPosition = new THREE.Vector3(e.clientX, e.clientY, 0)
    const delta = new THREE.Vector3().subVectors(currentPosition, startPositionRef.current)

    // Project delta to world space
    const worldDelta = projectScreenDeltaToWorld(delta, direction)

    // Call resize callback
    onResize(worldDelta)

    // Update start position for next move
    startPositionRef.current = currentPosition
  }

  // Handle pointer up
  const handlePointerUp = () => {
    setIsDragging(false)
    startPositionRef.current = null

    // Remove event listeners
    window.removeEventListener("pointermove", handlePointerMove)
    window.removeEventListener("pointerup", handlePointerUp)
  }

  // Project screen delta to world space
  const projectScreenDeltaToWorld = (screenDelta: THREE.Vector3, direction: "x" | "y" | "z"): number => {
    // Create a ray from camera in the direction of the handle
    const raycaster = new THREE.Raycaster()
    const mouseDirection = new THREE.Vector2()

    // Determine which component to use based on resize direction
    if (direction === "x") {
      mouseDirection.x = screenDelta.x / window.innerWidth
    } else if (direction === "y") {
      mouseDirection.y = -screenDelta.y / window.innerHeight
    } else {
      mouseDirection.x = screenDelta.x / window.innerWidth
      mouseDirection.y = -screenDelta.y / window.innerHeight
    }

    // Scale factor to make the movement more natural
    const scaleFactor = 2

    return direction === "x"
      ? mouseDirection.x * scaleFactor
      : direction === "y"
        ? mouseDirection.y * scaleFactor
        : Math.sqrt(mouseDirection.x ** 2 + mouseDirection.y ** 2) * scaleFactor
  }

  // Determine handle appearance based on direction
  const getHandleStyle = () => {
    const baseStyle = {
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      backgroundColor: "white",
      border: "2px solid #3b82f6",
      cursor: direction === "x" ? "ew-resize" : direction === "y" ? "ns-resize" : "nwse-resize",
      display: visible ? "block" : "none",
      boxShadow: "0 0 5px rgba(0,0,0,0.3)",
      transition: "transform 0.1s ease-out",
    }

    return {
      ...baseStyle,
      transform: isDragging ? "scale(1.2)" : "scale(1)",
    }
  }

  return (
    <group position={position}>
      <Html transform distanceFactor={10}>
        <div style={getHandleStyle()} onPointerDown={handlePointerDown} />
      </Html>
    </group>
  )
}
