"use client"

import { useState, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import FootprintBox, { FootprintBoxProps } from "./FootprintBox"

export interface Footprint {
  id: string
  position: [number, number, number]
  width: number
  depth: number
  color?: string
  type?: "cabinet" | "island" | "appliance"
}

interface FootprintManagerProps {
  onFootprintsChange?: (footprints: Footprint[]) => void
}

export default function FootprintManager({ onFootprintsChange }: FootprintManagerProps) {
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [selectedFootprint, setSelectedFootprint] = useState<string | null>(null)
  const { scene } = useThree()

  // When footprints change, notify parent
  useEffect(() => {
    if (onFootprintsChange) {
      onFootprintsChange(footprints)
    }
  }, [footprints, onFootprintsChange])

  // Handle background click to add new footprint or deselect
  const handleBackgroundClick = (event: any) => {
    // Only respond to click on the background plane
    if (event.object.name !== "background-plane") return
    
    // Add a new footprint at the click position
    const point = event.point
    const newFootprint: Footprint = {
      id: `footprint-${Date.now()}`,
      position: [point.x, 0.01, point.z],
      width: 2,
      depth: 2,
      color: "#6495ED",
      type: "cabinet"
    }
    
    setFootprints([...footprints, newFootprint])
    setSelectedFootprint(newFootprint.id)
  }

  // Update a footprint's properties
  const updateFootprint = (
    id: string,
    position: [number, number, number],
    width: number,
    depth: number
  ) => {
    setFootprints(
      footprints.map(fp => 
        fp.id === id 
          ? { ...fp, position, width, depth } 
          : fp
      )
    )
  }

  // Delete a footprint
  const deleteFootprint = (id: string) => {
    setFootprints(footprints.filter(fp => fp.id !== id))
    if (selectedFootprint === id) {
      setSelectedFootprint(null)
    }
  }

  // Select a footprint
  const selectFootprint = (id: string) => {
    setSelectedFootprint(id)
  }

  // Add event listener to background plane
  useEffect(() => {
    const backgroundPlane = scene.getObjectByName("background-plane")
    if (backgroundPlane) {
      backgroundPlane.addEventListener("click", handleBackgroundClick)
      return () => {
        backgroundPlane.removeEventListener("click", handleBackgroundClick)
      }
    }
  }, [scene, footprints])

  return (
    <>
      {/* Render all footprints */}
      {footprints.map(footprint => (
        <FootprintBox
          key={footprint.id}
          id={footprint.id}
          position={footprint.position}
          width={footprint.width}
          depth={footprint.depth}
          color={footprint.color}
          selected={footprint.id === selectedFootprint}
          onUpdate={updateFootprint}
          onDelete={deleteFootprint}
          onSelect={selectFootprint}
        />
      ))}
    </>
  )
} 