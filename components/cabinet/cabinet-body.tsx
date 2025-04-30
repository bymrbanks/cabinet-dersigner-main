"use client"

import { useMemo } from "react"
import { BoxGeometry } from "three"

interface CabinetBodyProps {
  width: number
  height: number
  depth: number
  thickness: number
  backThickness: number
  type: "base" | "wall"
  compartmentCount: number
  color: string
}

export default function CabinetBody({
  width,
  height,
  depth,
  thickness,
  backThickness,
  type,
  compartmentCount,
  color,
}: CabinetBodyProps) {
  // Ensure all dimensions are positive with a minimum value
  const safeWidth = Math.max(0.001, width)
  const safeHeight = Math.max(0.001, height)
  const safeDepth = Math.max(0.001, depth)
  const safeThickness = Math.max(0.001, thickness)
  const safeBackThickness = Math.max(0.001, backThickness)

  // Create geometries with safe dimensions
  const sideGeometry = useMemo(
    () => new BoxGeometry(safeThickness, safeHeight, safeDepth),
    [safeThickness, safeHeight, safeDepth],
  )

  const bottomTopGeometry = useMemo(() => {
    const innerWidth = Math.max(0.001, safeWidth - safeThickness * 2)
    return new BoxGeometry(innerWidth, safeThickness, safeDepth)
  }, [safeWidth, safeThickness, safeDepth])

  const backGeometry = useMemo(
    () => new BoxGeometry(safeWidth, safeHeight, safeBackThickness),
    [safeWidth, safeHeight, safeBackThickness],
  )

  // For toe kick (if base cabinet)
  const toeKickHeight = type === "base" ? 100 / 100 : 0 // 100mm toe kick for base cabinets, scaled
  const toeKickDepth = 50 / 100 // 50mm inset, scaled

  return (
    <group>
      {/* Left side panel */}
      <mesh
        geometry={sideGeometry}
        position={[safeThickness / 2, safeHeight / 2, safeDepth / 2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Right side panel */}
      <mesh
        geometry={sideGeometry}
        position={[safeWidth - safeThickness / 2, safeHeight / 2, safeDepth / 2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Bottom panel */}
      <mesh
        geometry={bottomTopGeometry}
        position={[safeWidth / 2, safeThickness / 2, safeDepth / 2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Top panel */}
      <mesh
        geometry={bottomTopGeometry}
        position={[safeWidth / 2, safeHeight - safeThickness / 2, safeDepth / 2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Back panel */}
      <mesh
        geometry={backGeometry}
        position={[safeWidth / 2, safeHeight / 2, safeDepth - safeBackThickness / 2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Toe kick (for base cabinet) */}
      {type === "base" && (
        <mesh position={[safeWidth / 2, safeThickness / 2, toeKickDepth / 2]} castShadow receiveShadow>
          <boxGeometry args={[safeWidth, safeThickness, toeKickDepth]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}
    </group>
  )
}
