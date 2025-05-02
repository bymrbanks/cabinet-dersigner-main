"use client"

import { useRef, useEffect } from "react"
import { useCabinetStore } from "@/store/cabinet-store"
import CabinetBody from "./cabinet-body"
import Compartment from "./compartment"
import DimensionLines from "./dimension-lines"
import SelectionIndicator from "./selection-indicator"
import DirectManipulationControls from "./direct-manipulation-controls"
import VisualGuides from "./visual-guides"
import type { Group } from "three"

interface CabinetProps {
  id: string
  position?: [number, number, number]
  width: number
  height: number
  depth: number
  type: "base" | "wall"
  rotation?: number // Rotation in degrees for L-shaped layouts
  compartments: Array<{ 
    sections: Array<{ type: "door" | "drawer"; height: number }>;
    shelves: number[] 
  }>
  materialColor: string
}

export default function Cabinet({
  id,
  position = [0, 0, 0],
  width,
  height,
  depth,
  type,
  rotation = 0, // Default to 0 if not provided
  compartments = [],
  materialColor,
}: CabinetProps) {
  const { selectedPart, setSelectedPart, setActiveCabinet, showDimensionLines } = useCabinetStore()

  // Ensure all dimensions are positive
  const safeWidth = Math.max(1, width)
  const safeHeight = Math.max(1, height)
  const safeDepth = Math.max(1, depth)

  // Scale factor to make the cabinet smaller in the 3D space (1 unit = 100mm)
  const scaleFactor = 100
  const scaledWidth = safeWidth / scaleFactor
  const scaledHeight = safeHeight / scaleFactor
  const scaledDepth = safeDepth / scaleFactor
  const scaledThickness = 18 / scaleFactor // 18mm standard thickness scaled down

  const cabinetRef = useRef<Group>(null)

  // Set up the cabinet for selection
  useEffect(() => {
    if (cabinetRef.current) {
      cabinetRef.current.name = id

      // Set position directly in the useEffect to avoid read-only property issues
      cabinetRef.current.position.set(position[0], position[1], position[2])
      
      // Apply rotation in radians (convert from degrees)
      cabinetRef.current.rotation.y = (rotation * Math.PI) / 180;

      // Make sure all children have proper names too
      cabinetRef.current.traverse((child) => {
        if (!child.name) {
          child.name = `${id}-part-${Math.random().toString(36).substring(2, 9)}`
        }
      })
    }
  }, [id, position, rotation])

  // Calculate internal dimensions
  const thickness = scaledThickness
  const backThickness = 5 / scaleFactor // 5mm for back panel scaled down

  // Calculate compartment widths and positions
  const compartmentData = compartments.map((compartment, index) => {
    const compartmentWidth = scaledWidth / compartments.length
    return {
      width: compartmentWidth,
      xOffset: index * compartmentWidth,
      index,
      sections: compartment.sections || [],
      shelves: compartment.shelves || []
    }
  })

  // Get cabinet dimensions for display
  const displayWidth = Math.round(width)
  const displayHeight = Math.round(height)
  const displayDepth = Math.round(depth)

  return (
    <group
      ref={cabinetRef}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedPart(id)
        setActiveCabinet(id)
      }}
    >
      <CabinetBody
        width={scaledWidth}
        height={scaledHeight}
        depth={scaledDepth}
        thickness={thickness}
        backThickness={backThickness}
        type={type}
        compartmentCount={compartments.length}
        color={materialColor}
      />

      {/* Render compartments */}
      {compartmentData.map((compartment) => (
        <Compartment
          key={`${id}-compartment-${compartment.index}`}
          cabinetId={id}
          compartmentIndex={compartment.index}
          width={compartment.width}
          height={scaledHeight}
          depth={scaledDepth}
          thickness={thickness}
          backThickness={backThickness}
          xOffset={compartment.xOffset}
          sections={compartment.sections}
          shelves={compartment.shelves}
          color={materialColor}
        />
      ))}

      {/* Dimension lines */}
      {showDimensionLines && <DimensionLines width={scaledWidth} height={scaledHeight} depth={scaledDepth} />}

      {/* Selection indicator */}
      <SelectionIndicator objectId={id} label={`${displayWidth}×${displayHeight}×${displayDepth}`} />

      {/* Direct manipulation controls */}
      <DirectManipulationControls objectId={id} />

      {/* Visual guides */}
      <VisualGuides objectId={id} />
    </group>
  )
}
