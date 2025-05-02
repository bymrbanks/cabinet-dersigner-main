"use client"

import { useMemo } from "react"
import * as THREE from "three"

interface SideWallGridProps {
  size?: number
  divisions?: number
  color?: string
}

export default function SideWallGrid({ 
  size = 20, 
  divisions = 20,
  color = "#E8E8E8"
}: SideWallGridProps) {
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
      console.error("Error creating side wall grid:", error)
      return null
    }
  }, [size, divisions, color])

  if (!grid) return null

  return <primitive object={grid} position={[size/2, size/2, 0]} rotation={[0, Math.PI/2, 0]} />
} 