"use client"

import { useRef, useEffect, useState } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useCabinetStore } from "@/store/cabinet-store"

interface VisualGuidesProps {
  objectId: string
}

export default function VisualGuides({ objectId }: VisualGuidesProps) {
  const { scene } = useThree()
  const { selectedPart } = useCabinetStore()
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<THREE.Vector3>(new THREE.Vector3())
  const [size, setSize] = useState<THREE.Vector3>(new THREE.Vector3())
  const guidesRef = useRef<THREE.Group>(null)

  // Update visibility and position based on selection
  useEffect(() => {
    setVisible(selectedPart === objectId)

    if (selectedPart !== objectId) return

    const object = scene.getObjectByName(objectId)
    if (!object) return

    // Calculate bounding box
    const bbox = new THREE.Box3().setFromObject(object)

    // Calculate position and size
    const center = new THREE.Vector3()
    bbox.getCenter(center)
    setPosition(center)

    const dimensions = new THREE.Vector3()
    bbox.getSize(dimensions)
    setSize(dimensions)
  }, [selectedPart, objectId, scene])

  // Animation for rotation guides
  useEffect(() => {
    if (!guidesRef.current || !visible) return

    const animate = () => {
      if (guidesRef.current) {
        // Rotate the rotation guides
        const rotationGuides = guidesRef.current.children.filter((child) => child.name === "rotation-guide")

        rotationGuides.forEach((guide) => {
          guide.rotation.y += 0.01
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    const animationRef = { current: requestAnimationFrame(animate) }

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [visible])

  if (!visible) return null

  // Create points for height guide circle at top
  const circleSegments = 32
  const circleRadius = 0.15
  const heightCirclePoints = []

  for (let i = 0; i <= circleSegments; i++) {
    const theta = (i / circleSegments) * Math.PI * 2
    const x = Math.cos(theta) * circleRadius
    const z = Math.sin(theta) * circleRadius
    heightCirclePoints.push(x, 0, z)
  }

  // Create points for rotation guide circles
  const rotationCirclePoints = []
  const rotationRadius = size.x / 2 + 0.1

  for (let i = 0; i <= circleSegments; i++) {
    const theta = (i / circleSegments) * Math.PI * 2
    const x = Math.cos(theta) * rotationRadius
    const z = Math.sin(theta) * rotationRadius
    rotationCirclePoints.push(x, 0, z)
  }

  return (
    <group ref={guidesRef}>
      {/* Height guide circle at top */}
      <line position={[position.x, position.y + size.y / 2 + 0.2, position.z]}>
        <bufferGeometry>
          <float32BufferAttribute attach="attributes-position" args={[new Float32Array(heightCirclePoints), 3]} />
        </bufferGeometry>
        <lineDashedMaterial color="#ffffff" dashSize={0.05} gapSize={0.05} opacity={0.7} transparent />
      </line>

      {/* Rotation guide at bottom */}
      <line position={[position.x, position.y - size.y / 2 - 0.2, position.z]} name="rotation-guide">
        <bufferGeometry>
          <float32BufferAttribute attach="attributes-position" args={[new Float32Array(rotationCirclePoints), 3]} />
        </bufferGeometry>
        <lineDashedMaterial color="#ffffff" dashSize={0.05} gapSize={0.05} opacity={0.4} transparent />
      </line>

      {/* Rotation guide at middle */}
      <line position={[position.x, position.y, position.z]} rotation={[Math.PI / 2, 0, 0]} name="rotation-guide">
        <bufferGeometry>
          <float32BufferAttribute attach="attributes-position" args={[new Float32Array(rotationCirclePoints), 3]} />
        </bufferGeometry>
        <lineDashedMaterial color="#ffffff" dashSize={0.05} gapSize={0.05} opacity={0.4} transparent />
      </line>

      {/* Movement indicator at bottom */}
      <mesh position={[position.x, position.y - size.y / 2 - 0.2, position.z]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial color="#ffffff" wireframe />
      </mesh>
    </group>
  )
}
