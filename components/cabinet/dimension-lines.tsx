"use client"

import { useMemo } from "react"
import { Html } from "@react-three/drei"
import { useCabinetStore } from "@/store/cabinet-store"
import { Vector3 } from "three"

interface DimensionLinesProps {
  width: number
  height: number
  depth: number
}

export default function DimensionLines({ width, height, depth }: DimensionLinesProps) {
  const { units, convertToCurrentUnit } = useCabinetStore()

  // Ensure all dimensions are positive
  const safeWidth = Math.max(0.01, width)
  const safeHeight = Math.max(0.01, height)
  const safeDepth = Math.max(0.01, depth)

  // Format dimension for display
  const formatDimension = (value: number) => {
    try {
      // Convert from scaled units back to mm, then to current unit
      const mmValue = value * 100
      const displayValue = convertToCurrentUnit(mmValue)
      return `${displayValue.toFixed(units === "mm" ? 0 : 1)} ${units}`
    } catch (error) {
      console.error("Error formatting dimension:", error)
      return "0 " + (units || "mm")
    }
  }

  // Calculate positions for dimension labels
  const widthLabelPosition = useMemo(() => {
    return new Vector3(safeWidth / 2, -0.05, -safeDepth / 2 - 0.2)
  }, [safeWidth, safeDepth])

  const heightLabelPosition = useMemo(() => {
    return new Vector3(-0.2, safeHeight / 2, -safeDepth / 2)
  }, [safeHeight, safeDepth])

  const depthLabelPosition = useMemo(() => {
    return new Vector3(safeWidth + 0.2, 0, 0)
  }, [safeWidth])

  return (
    <group>
      {/* Width dimension */}
      <Html position={[widthLabelPosition.x, widthLabelPosition.y, widthLabelPosition.z]} center>
        <div className="bg-white px-1 text-xs border border-gray-300 rounded">{formatDimension(width)}</div>
      </Html>

      {/* Height dimension */}
      <Html position={[heightLabelPosition.x, heightLabelPosition.y, heightLabelPosition.z]} center>
        <div className="bg-white px-1 text-xs border border-gray-300 rounded">{formatDimension(height)}</div>
      </Html>

      {/* Depth dimension */}
      <Html position={[depthLabelPosition.x, depthLabelPosition.y, depthLabelPosition.z]} center>
        <div className="bg-white px-1 text-xs border border-gray-300 rounded">{formatDimension(depth)}</div>
      </Html>
    </group>
  )
}
