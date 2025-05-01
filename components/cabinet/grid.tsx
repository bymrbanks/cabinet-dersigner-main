"use client"

import { useMemo } from "react"
import { useCabinetStore } from "@/store/cabinet-store"
import * as THREE from "three"

interface GridProps {
  size?: number
  divisions?: number
}

export default function Grid({ size = 20, divisions = 20 }: GridProps) {
  const { gridVisible, gridSize, gridColor } = useCabinetStore()

  // Calculate actual grid size based on store settings
  const actualSize = gridSize * size
  const actualDivisions = gridSize * divisions

  // Create a simple grid helper
  const grid = useMemo(() => {
    try {
      const grid = new THREE.GridHelper(actualSize, actualDivisions, gridColor, gridColor)

      // Make the grid semi-transparent
      if (grid.material) {
        const material = Array.isArray(grid.material) ? grid.material[0] : grid.material
        material.opacity = 1
        material.transparent = true
      }

      return grid
    } catch (error) {
      console.error("Error creating grid:", error)
      return null
    }
  }, [actualSize, actualDivisions, gridColor])

  if (!gridVisible || !grid) return null

  return <primitive object={grid} position={[0, 0.01, 0]} />
}
