"use client"

import { useRef, useEffect } from "react"
import { useCabinetStore } from "@/store/cabinet-store"
import type { HandleStyle, HandleOrientation } from "@/store/cabinet-store"
import type { Group } from "three"

interface HandleProps {
  position: [number, number, number]
  orientation: HandleOrientation
  style?: HandleStyle
  size?: number
  color?: string
  id: string
}

export default function Handle({
  position,
  orientation,
  style = "bar",
  size = 100,
  color = "#888888",
  id,
}: HandleProps) {
  const { setSelectedPart } = useCabinetStore()
  const handleRef = useRef<Group>(null)

  // Scale factor to make the handle smaller in the 3D space
  const scaleFactor = 100

  // Set up the handle for selection
  useEffect(() => {
    if (handleRef.current) {
      handleRef.current.name = id
    }
  }, [id])

  // Handle dimensions based on style and size
  const getHandleDimensions = () => {
    // Scale size from mm to our 3D units
    const scaledSize = Math.max(0.001, size / scaleFactor)

    switch (style) {
      case "bar":
        return {
          width: orientation === "horizontal" ? scaledSize : 10 / scaleFactor,
          height: orientation === "vertical" ? scaledSize : 10 / scaleFactor,
          depth: 20 / scaleFactor,
        }
      case "knob":
        const knobSize = Math.max(0.001, Math.min(size, 50) / scaleFactor)
        return {
          width: knobSize,
          height: knobSize,
          depth: knobSize,
          isRound: true,
        }
      case "cup":
        return {
          width: orientation === "horizontal" ? scaledSize : 30 / scaleFactor,
          height: orientation === "vertical" ? scaledSize : 30 / scaleFactor,
          depth: 15 / scaleFactor,
          isCup: true,
        }
      case "edge":
        return {
          width: orientation === "horizontal" ? scaledSize : 5 / scaleFactor,
          height: orientation === "vertical" ? scaledSize : 5 / scaleFactor,
          depth: 10 / scaleFactor,
        }
      case "none":
        return null
      default:
        return {
          width: orientation === "horizontal" ? scaledSize : 10 / scaleFactor,
          height: orientation === "vertical" ? scaledSize : 10 / scaleFactor,
          depth: 20 / scaleFactor,
        }
    }
  }

  // Calculate rotation and dimensions based on orientation
  const rotation = orientation === "horizontal" ? [0, 0, 0] : [0, 0, Math.PI / 2]
  const dimensions = getHandleDimensions()

  // If no handle (style is "none"), don't render anything
  if (style === "none" || !dimensions) {
    return null
  }

  return (
    <group
      ref={handleRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedPart(id)
      }}
    >
      {dimensions.isRound ? (
        // Knob style (round)
        <mesh position={[0, 0, -dimensions.depth / 2]} castShadow>
          <sphereGeometry args={[dimensions.width]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
      ) : dimensions.isCup ? (
        // Cup style (recessed)
        <group rotation={rotation}>
          <mesh position={[0, 0, -dimensions.depth / 2]} castShadow>
            <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Inner recess */}
          <mesh position={[0, 0, -dimensions.depth]} castShadow>
            <boxGeometry args={[dimensions.width * 0.8, dimensions.height * 0.6, dimensions.depth * 0.5]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      ) : (
        // Bar or edge style
        <mesh position={[0, 0, -dimensions.depth / 2]} rotation={rotation} castShadow>
          <boxGeometry
            args={[
              Math.max(0.001, dimensions.width),
              Math.max(0.001, dimensions.height),
              Math.max(0.001, dimensions.depth),
            ]}
          />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
      )}
    </group>
  )
}
