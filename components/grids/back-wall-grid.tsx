"use client"

import { useMemo } from "react"
import * as THREE from "three"

interface BackWallGridProps {
  size?: number
  divisions?: number
  color?: string
}

export default function BackWallGrid({ 
  size = 20, 
  divisions = 20,
  color = "#E0E0E0"
}: BackWallGridProps) {
  const grid = useMemo(() => {
    
    try {
      const gridGeometry = new THREE.PlaneGeometry(size, size, divisions, divisions)
      const gridMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      })
      
      return new THREE.Mesh(gridGeometry, gridMaterial)
    } catch (error) {
      console.error("Error creating back wall grid:", error)
      return null
    }
  }, [size, divisions, color])

  if (!grid) return null

  return <primitive object={grid} position={[0, size/2, -size/2]} rotation={[0, 0, 0]} />
} 