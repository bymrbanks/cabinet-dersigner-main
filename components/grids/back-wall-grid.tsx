"use client"

import { useMemo } from "react"
import * as THREE from "three"

interface BackWallGridProps {
  size?: number
  divisions?: number
  color?: string
}

export default function BackWallGrid({ 
  size = 108, 
  divisions = 36,
  color = "#CCCCCC"
}: BackWallGridProps) {
  // Create a custom grid for the back wall (XY plane)
  const backWallGrid = useMemo(() => {
    try {
      // Create a grid geometry
      const gridGeometry = new THREE.PlaneGeometry(size, size)
      
      // Create a grid material with a grid pattern
      const gridMaterial = new THREE.MeshBasicMaterial({
        color: color,
        opacity: 0.2,
        transparent: true,
        wireframe: true,
      })
      
      return new THREE.Mesh(gridGeometry, gridMaterial)
    } catch (error) {
      console.error("Error creating back wall grid:", error)
      return null
    }
  }, [size, color])

  if (!backWallGrid) return null

  return <primitive object={backWallGrid} position={[0, size/2, -54]} rotation={[0, 0, 0]} />
} 