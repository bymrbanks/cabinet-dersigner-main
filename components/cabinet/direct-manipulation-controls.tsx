"use client"

import { useRef, useEffect, useState } from "react"
import { useThree } from "@react-three/fiber"
import { useCabinetStore } from "@/store/cabinet-store"
import * as THREE from "three"

interface DirectManipulationControlsProps {
  objectId: string
}

export default function DirectManipulationControls({ objectId }: DirectManipulationControlsProps) {
  const { scene, camera, raycaster, pointer } = useThree()
  const { selectedPart, setWidth, setHeight, setDepth, getWidth, getHeight, getDepth, saveToHistory } =
    useCabinetStore()
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<THREE.Vector3>(new THREE.Vector3())
  const [size, setSize] = useState<THREE.Vector3>(new THREE.Vector3())
  const [activeDimension, setActiveDimension] = useState<"width" | "height" | "depth" | null>(null)
  const startDragRef = useRef<{ point: THREE.Vector3; dimension: string; value: number } | null>(null)
  const objectRef = useRef<THREE.Object3D | null>(null)
  const controlsRef = useRef<THREE.Group>(null)

  // Update visibility and position based on selection
  useEffect(() => {
    setVisible(selectedPart === objectId)

    if (selectedPart !== objectId) return

    const object = scene.getObjectByName(objectId)
    if (!object) return

    objectRef.current = object

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

  // Handle pointer down on controls
  const handlePointerDown = (e: THREE.Event, dimension: "width" | "height" | "depth") => {
    e.stopPropagation()

    // Prevent any default behavior
    if (e.nativeEvent) {
      e.nativeEvent.stopPropagation()
      e.nativeEvent.preventDefault()
    }

    // Explicitly disable orbit controls
    const orbitControls = document.querySelector("canvas")?.parentElement?.querySelector(".r3f-orbit-controls")
    if (orbitControls) {
      const orbitControlsInstance = (orbitControls as any).__r3f?.memoizedProps?.ref?.current
      if (orbitControlsInstance) {
        orbitControlsInstance.enabled = false
      }
    }

    // Get current value
    let currentValue = 0
    switch (dimension) {
      case "width":
        currentValue = getWidth()
        break
      case "height":
        currentValue = getHeight()
        break
      case "depth":
        currentValue = getDepth()
        break
    }

    // Store start point and dimension
    startDragRef.current = {
      point: e.point.clone(),
      dimension,
      value: currentValue,
    }

    setActiveDimension(dimension)

    // Add global event listeners
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointermove", handlePointerMove)
  }

  // Handle pointer move
  const handlePointerMove = (e: PointerEvent) => {
    if (!startDragRef.current || !activeDimension) return

    // Update raycaster with current pointer position
    raycaster.setFromCamera(pointer, camera)

    // Create a plane for the drag operation based on the active dimension
    const dragPlane = new THREE.Plane()

    switch (activeDimension) {
      case "width":
        // Plane perpendicular to the x-axis
        dragPlane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(position.x, position.y, position.z),
        )
        break
      case "height":
        // Plane perpendicular to the y-axis
        dragPlane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(position.x, position.y, position.z),
        )
        break
      case "depth":
        // Plane perpendicular to the z-axis
        dragPlane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(position.x, position.y, position.z),
        )
        break
    }

    // Calculate intersection with the drag plane
    const intersectionPoint = new THREE.Vector3()
    raycaster.ray.intersectPlane(dragPlane, intersectionPoint)

    if (!intersectionPoint) return

    // Calculate delta based on dimension
    const { value } = startDragRef.current
    let delta = 0

    switch (activeDimension) {
      case "width":
        delta = (intersectionPoint.x - position.x) * 200 // Scale factor
        setWidth(Math.max(300, value + delta))
        break
      case "height":
        delta = (intersectionPoint.y - position.y) * 200 // Scale factor
        setHeight(Math.max(300, value + delta))
        break
      case "depth":
        delta = (intersectionPoint.z - position.z) * 200 // Scale factor
        setDepth(Math.max(200, value + delta))
        break
    }
  }

  // Handle pointer up
  const handlePointerUp = () => {
    if (startDragRef.current) {
      saveToHistory()
      startDragRef.current = null
      setActiveDimension(null)
    }

    // Re-enable orbit controls
    const orbitControls = document.querySelector("canvas")?.parentElement?.querySelector(".r3f-orbit-controls")
    if (orbitControls) {
      const orbitControlsInstance = (orbitControls as any).__r3f?.memoizedProps?.ref?.current
      if (orbitControlsInstance) {
        orbitControlsInstance.enabled = true
      }
    }

    // Remove global event listeners
    window.removeEventListener("pointerup", handlePointerUp)
    window.removeEventListener("pointermove", handlePointerMove)
  }

  if (!visible) return null

  return (
    <group ref={controlsRef}>
      {/* Height control (top arrow) */}
      <group position={[position.x, position.y + size.y / 2 + 0.2, position.z]}>
        <mesh
          onPointerDown={(e) => {
            e.stopPropagation()
            handlePointerDown(e, "height")
            e.target.setPointerCapture(e.pointerId)
          }}
          position={[0, 0, 0]}
        >
          <coneGeometry args={[0.05, 0.1, 16]} />
          <meshStandardMaterial color={activeDimension === "height" ? "#2563eb" : "#ffffff"} />
        </mesh>
        <mesh onPointerDown={(e) => handlePointerDown(e, "height")} position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
          <meshStandardMaterial color={activeDimension === "height" ? "#2563eb" : "#ffffff"} />
        </mesh>
      </group>

      {/* Width control (right arrow) */}
      <group position={[position.x + size.x / 2 + 0.2, position.y, position.z]}>
        <mesh
          onPointerDown={(e) => {
            e.stopPropagation()
            handlePointerDown(e, "width")
            e.target.setPointerCapture(e.pointerId)
          }}
          position={[0, 0, 0]}
          rotation={[0, 0, -Math.PI / 2]}
        >
          <coneGeometry args={[0.05, 0.1, 16]} />
          <meshStandardMaterial color={activeDimension === "width" ? "#2563eb" : "#ffffff"} />
        </mesh>
        <mesh
          onPointerDown={(e) => handlePointerDown(e, "width")}
          position={[-0.1, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
          <meshStandardMaterial color={activeDimension === "width" ? "#2563eb" : "#ffffff"} />
        </mesh>
      </group>

      {/* Depth control (front arrow) */}
      <group position={[position.x, position.y, position.z + size.z / 2 + 0.2]}>
        <mesh
          onPointerDown={(e) => {
            e.stopPropagation()
            handlePointerDown(e, "depth")
            e.target.setPointerCapture(e.pointerId)
          }}
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <coneGeometry args={[0.05, 0.1, 16]} />
          <meshStandardMaterial color={activeDimension === "depth" ? "#2563eb" : "#ffffff"} />
        </mesh>
        <mesh
          onPointerDown={(e) => handlePointerDown(e, "depth")}
          position={[0, 0, -0.1]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
          <meshStandardMaterial color={activeDimension === "depth" ? "#2563eb" : "#ffffff"} />
        </mesh>
      </group>

      {/* Visual guides */}
      <group>
        {/* Height guide */}
        <line>
          <bufferGeometry>
            <float32BufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  position.x,
                  position.y - size.y / 2,
                  position.z,
                  position.x,
                  position.y + size.y / 2 + 0.3,
                  position.z,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineDashedMaterial
            color="#ffffff"
            dashSize={0.05}
            gapSize={0.05}
            opacity={activeDimension === "height" ? 0.9 : 0.4}
            transparent
          />
        </line>

        {/* Width guide */}
        <line>
          <bufferGeometry>
            <float32BufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  position.x - size.x / 2,
                  position.y,
                  position.z,
                  position.x + size.x / 2 + 0.3,
                  position.y,
                  position.z,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineDashedMaterial
            color="#ffffff"
            dashSize={0.05}
            gapSize={0.05}
            opacity={activeDimension === "width" ? 0.9 : 0.4}
            transparent
          />
        </line>

        {/* Depth guide */}
        <line>
          <bufferGeometry>
            <float32BufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  position.x,
                  position.y,
                  position.z - size.z / 2,
                  position.x,
                  position.y,
                  position.z + size.z / 2 + 0.3,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineDashedMaterial
            color="#ffffff"
            dashSize={0.05}
            gapSize={0.05}
            opacity={activeDimension === "depth" ? 0.9 : 0.4}
            transparent
          />
        </line>
      </group>

      {/* Movement control at bottom */}
      <group position={[position.x, position.y - size.y / 2 - 0.2, position.z]}>
        <mesh>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* X-axis arrows */}
        <group>
          <mesh position={[0.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.03, 0.06, 16]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
          <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.03, 0.06, 16]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 0.2, 8]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
        </group>

        {/* Y-axis arrows */}
        <group>
          <mesh position={[0, 0.1, 0]}>
            <coneGeometry args={[0.03, 0.06, 16]} />
            <meshStandardMaterial color="#00ff00" />
          </mesh>
          <mesh position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.03, 0.06, 16]} />
            <meshStandardMaterial color="#00ff00" />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.005, 0.005, 0.2, 8]} />
            <meshStandardMaterial color="#00ff00" />
          </mesh>
        </group>

        {/* Z-axis arrows */}
        <group>
          <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.03, 0.06, 16]} />
            <meshStandardMaterial color="#0000ff" />
          </mesh>
          <mesh position={[0, 0, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.03, 0.06, 16]} />
            <meshStandardMaterial color="#0000ff" />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.2, 8]} />
            <meshStandardMaterial color="#0000ff" />
          </mesh>
        </group>
      </group>
    </group>
  )
}
