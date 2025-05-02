"use client"

import { useMemo } from "react"
import * as THREE from "three"

interface GridProps {
  size?: number
  divisions?: number
  color?: string
}

export default function Grid({ 
  size = 108, 
  divisions = 36,
  color = "#999999"
}: GridProps) {
  // Create a simple grid helper
  const grid = useMemo(() => {
    try {
      // Create grid with darker color for better visibility
      const mainColor = color
      const secondaryColor = "#666666"
      const grid = new THREE.GridHelper(size, divisions, secondaryColor, mainColor)

      // Make the grid more visible
      if (grid.material) {
        const material = Array.isArray(grid.material) ? grid.material[0] : grid.material
        material.opacity = 0.8
        material.transparent = true
      }

      return grid
    } catch (error) {
      console.error("Error creating grid:", error)
      return null
    }
  }, [size, divisions, color])

  if (!grid) return null

  return <primitive object={grid} position={[0, 0.01, 0]} />
}
