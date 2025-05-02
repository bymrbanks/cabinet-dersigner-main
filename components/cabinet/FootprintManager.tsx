"use client"

import { useState, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { Text, Html } from "@react-three/drei"
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
  const [isAddingMode, setIsAddingMode] = useState(false)
  const { gl, camera, scene } = useThree()

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
    
    if (isAddingMode) {
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
      setIsAddingMode(false)
    } else {
      // Deselect when clicking on background
      setSelectedFootprint(null)
    }
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
  }, [scene, isAddingMode, footprints])

  return (
    <>
      {/* Instructions */}
      <Html position={[0, 5, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="bg-white bg-opacity-80 p-3 rounded shadow-md w-[300px] text-sm">
          <h3 className="font-bold mb-1">Layout Mode</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Click the <b>Add Box</b> button, then click on floor to place a box</li>
            <li>Click and drag <b>red handles</b> to resize boxes</li>
            <li>Click and drag the <b>box center</b> to move it</li>
            <li>Double-click a box to <b>delete</b> it</li>
          </ul>
        </div>
      </Html>

      {/* UI Controls - Add at a fixed position relative to camera */}
      <group position={[-9.5, 0.1, -9.5]}>
        <mesh 
          position={[0, 0, 0]} 
          onClick={() => setIsAddingMode(true)}
        >
          <boxGeometry args={[1.5, 0.1, 0.5]} />
          <meshStandardMaterial color={isAddingMode ? "#32CD32" : "#4CAF50"} />
        </mesh>
        <Text
          position={[0, 0.15, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Add Box
        </Text>
      </group>

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