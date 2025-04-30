"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { useThree } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { useCabinetStore } from "@/store/cabinet-store"
import { Vector3 } from "three"

interface AddCabinetButtonProps {
  targetId: string
  onAdd: (position: [number, number, number]) => void
}

export default function AddCabinetButton({ targetId, onAdd }: AddCabinetButtonProps) {
  const { scene } = useThree()
  const [position, setPosition] = useState<Vector3>(new Vector3(0, 0, 0))
  const buttonRef = useRef<HTMLDivElement>(null)

  // Update position based on target object
  useEffect(() => {
    const targetObject = scene.getObjectByName(targetId)
    if (!targetObject) return

    // Get the position of the target object
    const pos = new Vector3()
    targetObject.getWorldPosition(pos)

    // Find the cabinet with this ID
    const cabinet = useCabinetStore.getState().cabinets.find((c) => c.id === targetId)
    if (cabinet) {
      // Position the button to the right of the cabinet
      const scaledWidth = cabinet.width / 100
      pos.x += scaledWidth / 2 + 0.5 // Add offset to the right
      pos.y += 0.5 // Position in the middle height
    }

    setPosition(pos)
  }, [targetId, scene])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    // Get the cabinet's position
    const cabinet = useCabinetStore.getState().cabinets.find((c) => c.id === targetId)
    if (cabinet) {
      // Create a new position offset from the current cabinet
      const newPosition: [number, number, number] = [
        cabinet.position[0] + cabinet.width / 100 + 0.5, // Place it to the right with some spacing
        cabinet.position[1],
        cabinet.position[2],
      ]
      onAdd(newPosition)
    }
  }

  return (
    <group position={[position.x, position.y, position.z]}>
      <Html
        transform
        distanceFactor={10}
        position={[0, 0, 0]}
        style={{
          transition: "all 0.2s",
          opacity: 1,
          transform: "scale(1)",
        }}
      >
        <div
          ref={buttonRef}
          onClick={handleClick}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#3b82f6",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "24px",
            fontWeight: "bold",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            userSelect: "none",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.1)"
            e.currentTarget.style.backgroundColor = "#2563eb"
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)"
            e.currentTarget.style.backgroundColor = "#3b82f6"
          }}
          title="Add new cabinet"
        >
          +
        </div>
      </Html>
    </group>
  )
}
