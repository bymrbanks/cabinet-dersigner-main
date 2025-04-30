"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { useThree } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { useCabinetStore } from "@/store/cabinet-store"
import { Vector3 } from "three"

interface AddSectionButtonProps {
  targetId: string
  onAdd: (sectionIndex: number) => void
}

export default function AddSectionButton({ targetId, onAdd }: AddSectionButtonProps) {
  const { scene } = useThree()
  const getSectionIndexFromId = useCabinetStore((state) => state.getSectionIndexFromId)
  const [position, setPosition] = useState<Vector3>(new Vector3(0, 0, 0))
  const buttonRef = useRef<HTMLDivElement>(null)

  // Update position based on target object
  useEffect(() => {
    const targetObject = scene.getObjectByName(targetId)
    if (!targetObject) return

    // Get the position of the target object
    const pos = new Vector3()
    targetObject.getWorldPosition(pos)

    // Get the size of the target object
    if (targetId === "cabinet") {
      // For the main cabinet, position the button at the right side
      const cabinetWidth = useCabinetStore.getState().width / 100
      pos.x += cabinetWidth / 2 + 0.2 // Add some offset
      pos.y += 0.5 // Position in the middle height
      pos.z -= 0.5 // Move it forward a bit
    } else {
      // For doors/drawers
      const size = targetObject.children[0]?.geometry?.parameters
      if (size) {
        // Position the button to the right of the object
        pos.x += size.width + 0.1 // Add some offset
        pos.y += size.height / 2
      }
    }

    setPosition(pos)
  }, [targetId, scene])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (targetId === "cabinet") {
      // For the main cabinet, add a new section at the end
      onAdd(useCabinetStore.getState().sections.length)
    } else {
      // For sections, add after the current section
      const sectionIndex = getSectionIndexFromId(targetId)
      if (sectionIndex !== null) {
        onAdd(sectionIndex)
      }
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
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: "#3b82f6",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "20px",
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
        >
          +
        </div>
      </Html>
    </group>
  )
}
