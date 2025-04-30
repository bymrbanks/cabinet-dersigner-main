"use client"

import { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Text } from "@react-three/drei"
import { useCabinetStore } from "@/store/cabinet-store"

interface SelectionIndicatorProps {
  objectId: string
  color?: string
  label?: string
}

export default function SelectionIndicator({ objectId, color = "#3b82f6", label }: SelectionIndicatorProps) {
  const { selectedPart } = useCabinetStore()
  const isSelected = selectedPart === objectId
  const outlineRef = useRef<THREE.LineSegments>(null)
  const textRef = useRef<THREE.Group>(null)
  const [boundingBox, setBoundingBox] = useState<THREE.Box3 | null>(null)
  const [position, setPosition] = useState<THREE.Vector3>(new THREE.Vector3())
  const [size, setSize] = useState<THREE.Vector3>(new THREE.Vector3())
  const [visible, setVisible] = useState(false)

  // Update outline on selection change
  useEffect(() => {
    if (!isSelected) {
      setVisible(false)
      return
    }

    // Find the object in the scene
    const scene = outlineRef.current?.parent
    if (!scene) return

    const object = scene.getObjectByName(objectId)
    if (!object) return

    // Calculate bounding box
    const bbox = new THREE.Box3().setFromObject(object)
    setBoundingBox(bbox)

    // Calculate position and size
    const center = new THREE.Vector3()
    bbox.getCenter(center)
    setPosition(center)

    const size = new THREE.Vector3()
    bbox.getSize(size)
    setSize(size)

    setVisible(true)
  }, [isSelected, objectId])

  // Create outline geometry
  useFrame(() => {
    if (!outlineRef.current || !boundingBox || !visible) return

    // Create wireframe box
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
    const wireframe = new THREE.EdgesGeometry(geometry)
    outlineRef.current.geometry.dispose()
    outlineRef.current.geometry = wireframe
    outlineRef.current.position.copy(position)
  })

  // Pulse animation for the outline
  const [pulseScale, setPulseScale] = useState(1)
  useFrame(({ clock }) => {
    if (!outlineRef.current || !visible) return
    const pulse = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.03
    setPulseScale(pulse)
    outlineRef.current.scale.set(pulse, pulse, pulse)
  })

  if (!isSelected) return null

  return (
    <group>
      <lineSegments ref={outlineRef} visible={visible}>
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>

      {label && visible && (
        <Text
          position={[position.x, position.y + size.y / 2 + 0.1, position.z]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {label}
        </Text>
      )}
    </group>
  )
}
