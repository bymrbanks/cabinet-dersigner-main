"use client"

import { useRef, useEffect } from "react"
import { useCabinetStore } from "@/store/cabinet-store"
import Door from "./door"
import Drawer from "./drawer"
import Shelf from "./shelf"
import type { Group } from "three"
import type { CabinetSection } from "@/store/cabinet-store"

interface CompartmentProps {
  cabinetId: string
  compartmentIndex: number
  width: number
  height: number
  depth: number
  thickness: number
  backThickness: number
  xOffset: number
  sections: CabinetSection[]
  color: string
  shelves: number[] // Array of shelf positions (0-100 percentage of height)
}

export default function Compartment({
  cabinetId,
  compartmentIndex,
  width,
  height,
  depth,
  thickness,
  backThickness,
  xOffset,
  sections,
  color,
  shelves = [],
}: CompartmentProps) {
  const { setSelectedPart } = useCabinetStore()
  const compartmentRef = useRef<Group>(null)

  // Ensure all dimensions are positive
  const safeWidth = Math.max(0.001, width)
  const safeHeight = Math.max(0.001, height)
  const safeDepth = Math.max(0.001, depth)

  // Calculate internal dimensions
  const internalWidth = Math.max(0.001, safeWidth - thickness)
  const internalHeight = Math.max(0.001, safeHeight - thickness * 2)
  const internalDepth = Math.max(0.001, safeDepth - backThickness)

  // Gap between components
  const gap = 2 / 100 // 2mm gap scaled down

  // Set up the compartment for selection
  useEffect(() => {
    if (compartmentRef.current) {
      compartmentRef.current.name = `${cabinetId}-compartment-${compartmentIndex}`
    }
  }, [cabinetId, compartmentIndex])

  // Calculate components based on compartment configuration
  const renderFrontComponents = () => {
    if (!sections || sections.length === 0) {
      // Default to a single door if no sections defined
      return (
        <Door
          width={internalWidth}
          height={internalHeight}
          thickness={thickness}
          position={[thickness, thickness, thickness]}
          color={color}
          hingePosition="left" // Default hinge position
          id={`${cabinetId}-compartment-${compartmentIndex}-door-main`}
        />
      )
    }

    // Calculate total height of all sections
    const totalSectionHeight = sections.reduce((sum, section) => sum + Math.max(0, section?.height || 0), 0)

    // If total height doesn't match internal height, scale sections proportionally
    const scaleFactor = totalSectionHeight > 0 ? internalHeight / (totalSectionHeight / 100) : 1

    let currentY = thickness

    return sections.map((section, index) => {
      if (!section) return null

      const sectionHeight = Math.max(0.001, ((section.height || 0) / 100) * scaleFactor)
      const component =
        section.type === "door" ? (
          <Door
            key={`${cabinetId}-compartment-${compartmentIndex}-door-${index}`}
            id={`${cabinetId}-compartment-${compartmentIndex}-door-${index}`}
            width={internalWidth}
            height={Math.max(0.001, sectionHeight - gap)}
            thickness={thickness}
            position={[thickness, currentY, thickness]}
            color={color}
            hingePosition={section.hingePosition || "left"} // Use the section's hinge position or default to left
          />
        ) : (
          <Drawer
            key={`${cabinetId}-compartment-${compartmentIndex}-drawer-${index}`}
            id={`${cabinetId}-compartment-${compartmentIndex}-drawer-${index}`}
            width={internalWidth}
            height={Math.max(0.001, sectionHeight - gap)}
            thickness={thickness}
            position={[thickness, currentY, thickness]}
            color={color}
          />
        )

      currentY += sectionHeight
      return component
    })
  }

  // Render shelves based on the shelves array
  const renderShelves = () => {
    // If no shelves defined, return empty array
    if (!shelves || shelves.length === 0) {
      return []
    }

    return shelves.map((position, index) => {
      // Calculate shelf Y position based on percentage (0-100)
      const yPosition = thickness + (internalHeight * position) / 100
      
      return (
        <Shelf
          key={`${cabinetId}-compartment-${compartmentIndex}-shelf-${index}`}
          id={`${cabinetId}-compartment-${compartmentIndex}-shelf-${index}`}
          width={internalWidth}
          depth={internalDepth}
          thickness={thickness}
          position={[thickness, yPosition, thickness + backThickness]}
          color={color}
        />
      )
    })
  }

  return (
    <group
      ref={compartmentRef}
      position={[xOffset, 0, 0]}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedPart(`${cabinetId}-compartment-${compartmentIndex}`)
      }}
    >
      {/* Compartment structure - vertical divider */}
      <mesh position={[thickness / 2, safeHeight / 2, safeDepth / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, safeHeight, safeDepth]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Render front components (doors/drawers) */}
      {renderFrontComponents()}

      {/* Render shelves */}
      {renderShelves()}
    </group>
  )
}
