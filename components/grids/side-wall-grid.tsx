"use client"

import { useMemo } from "react"
import * as THREE from "three"

interface SideWallGridProps {
  size?: number
  divisions?: number
  color?: string
}

export default function SideWallGrid({ 
  size = 108, 
  divisions = 36,
  color = "#CCCCCC"
}: SideWallGridProps) {
  // Create a custom grid for the side wall (XY plane)
  const sideWallGrid = useMemo(() => {
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
      console.error("Error creating side wall grid:", error)
      return null
    }
  }, [size, color])

  if (!sideWallGrid) return null

  return <primitive object={sideWallGrid} position={[-54, size/2, 0]} rotation={[0, Math.PI/2, 0]} />
} 