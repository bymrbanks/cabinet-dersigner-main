"use client"

import { useRef, useEffect } from "react"
import { useCabinetStore } from "@/store/cabinet-store"
import type { Mesh } from "three"

interface ShelfProps {
  id: string
  width: number
  depth: number
  thickness: number
  position: [number, number, number]
  color: string
}

export default function Shelf({ id, width, depth, thickness, position, color }: ShelfProps) {
  const { setSelectedPart } = useCabinetStore()
  const shelfRef = useRef<Mesh>(null)

  // Ensure all dimensions are positive
  const safeWidth = Math.max(0.001, width)
  const safeDepth = Math.max(0.001, depth)
  const safeThickness = Math.max(0.001, thickness)

  // Set up the shelf for selection
  useEffect(() => {
    if (shelfRef.current) {
      shelfRef.current.name = id
    }
  }, [id])

  return (
    <mesh
      ref={shelfRef}
      position={[position[0] + safeWidth / 2, position[1], position[2] + safeDepth / 2]}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation()
        setSelectedPart(id)
      }}
    >
      <boxGeometry args={[safeWidth, safeThickness, safeDepth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
} 