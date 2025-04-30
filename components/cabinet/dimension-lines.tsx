"use client"

import { useMemo } from "react"
import { Text } from "@react-three/drei"
import { useCabinetStore } from "@/store/cabinet-store"
import * as THREE from "three"

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

  // Create dimension lines
  const widthLine = useMemo(() => {
    const points = []
    points.push(-0.05, 0, -safeDepth / 2 - 0.1)
    points.push(safeWidth + 0.05, 0, -safeDepth / 2 - 0.1)
    return points
  }, [safeWidth, safeDepth])

  const heightLine = useMemo(() => {
    const points = []
    points.push(-0.1, 0, -safeDepth / 2 - 0.05)
    points.push(-0.1, safeHeight, -safeDepth / 2 - 0.05)
    return points
  }, [safeHeight, safeDepth])

  const depthLine = useMemo(() => {
    const points = []
    points.push(safeWidth + 0.1, 0, -0.05)
    points.push(safeWidth + 0.1, 0, safeDepth + 0.05)
    return points
  }, [safeWidth, safeDepth])

  // Create dimension text positions
  const widthTextPosition = useMemo(() => {
    return new THREE.Vector3(safeWidth / 2, 0, -safeDepth / 2 - 0.15)
  }, [safeWidth, safeDepth])

  const heightTextPosition = useMemo(() => {
    return new THREE.Vector3(-0.15, safeHeight / 2, -safeDepth / 2)
  }, [safeHeight, safeDepth])

  const depthTextPosition = useMemo(() => {
    return new THREE.Vector3(safeWidth + 0.15, 0, safeDepth / 2)
  }, [safeWidth, safeDepth])

  return (
    <group>
      {/* Width dimension line */}
      <line>
        <bufferGeometry>
          <float32BufferAttribute attach="attributes-position" args={[new Float32Array(widthLine), 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" />
      </line>

      {/* Width dimension caps */}
      <line>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-0.05, -0.05, -safeDepth / 2 - 0.1, -0.05, 0.05, -safeDepth / 2 - 0.1]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" />
      </line>

      <line>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                safeWidth + 0.05,
                -0.05,
                -safeDepth / 2 - 0.1,
                safeWidth + 0.05,
                0.05,
                -safeDepth / 2 - 0.1,
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" />
      </line>

      {/* Width dimension text */}
      <Text
        position={[widthTextPosition.x, widthTextPosition.y, widthTextPosition.z]}
        fontSize={0.05}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000000"
        backgroundColor="#333333"
        backgroundOpacity={0.7}
        padding={0.02}
      >
        {formatDimension(width)}
      </Text>

      {/* Height dimension line */}
      <line>
        <bufferGeometry>
          <float32BufferAttribute attach="attributes-position" args={[new Float32Array(heightLine), 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" />
      </line>

      {/* Height dimension caps */}
      <line>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-0.1 - 0.05, 0, -safeDepth / 2 - 0.05, -0.1 + 0.05, 0, -safeDepth / 2 - 0.05]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" />
      </line>

      <line>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                -0.1 - 0.05,
                safeHeight,
                -safeDepth / 2 - 0.05,
                -0.1 + 0.05,
                safeHeight,
                -safeDepth / 2 - 0.05,
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" />
      </line>

      {/* Height dimension text */}
      <Text
        position={[heightTextPosition.x, heightTextPosition.y, heightTextPosition.z]}
        fontSize={0.05}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000000"
        backgroundColor="#333333"
        backgroundOpacity={0.7}
        padding={0.02}
        rotation={[0, Math.PI / 2, 0]}
      >
        {formatDimension(height)}
      </Text>

      {/* Depth dimension line */}
      <line>
        <bufferGeometry>
          <float32BufferAttribute attach="attributes-position" args={[new Float32Array(depthLine), 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" />
      </line>

      {/* Depth dimension caps */}
      <line>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[new Float32Array([safeWidth + 0.1, 0, -0.05, safeWidth + 0.1, 0, 0.05]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" />
      </line>

      <line>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[new Float32Array([safeWidth + 0.1, 0, safeDepth - 0.05, safeWidth + 0.1, 0, safeDepth + 0.05]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" />
      </line>

      {/* Depth dimension text */}
      <Text
        position={[depthTextPosition.x, depthTextPosition.y, depthTextPosition.z]}
        fontSize={0.05}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000000"
        backgroundColor="#333333"
        backgroundOpacity={0.7}
        padding={0.02}
        rotation={[0, -Math.PI / 2, 0]}
      >
        {formatDimension(depth)}
      </Text>
    </group>
  )
}
