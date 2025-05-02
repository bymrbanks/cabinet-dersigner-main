"use client"

import { useState, useEffect, useRef } from "react"
import { useThree } from "@react-three/fiber"
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
  backgroundPlane?: THREE.Mesh | null
}

export default function FootprintManager({ onFootprintsChange, backgroundPlane }: FootprintManagerProps) {
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [selectedFootprint, setSelectedFootprint] = useState<string | null>(null)
  const { scene } = useThree()
  const isSetupRef = useRef(false)

  // When footprints change, notify parent
  useEffect(() => {
    if (onFootprintsChange) {
      onFootprintsChange(footprints)
    }
  }, [footprints, onFootprintsChange])

  // Handle background click to add new footprint or deselect
  const handleBackgroundClick = (event: any) => {
    console.log("Background click detected", event);
    
    // Add a new footprint at the click position
    const point = event.point;
    console.log("Adding footprint at position:", point);
    
    const newFootprint: Footprint = {
      id: `footprint-${Date.now()}`,
      position: [point.x, 0.01, point.z],
      width: 2,
      depth: 2,
      color: "#6495ED",
      type: "cabinet"
    }
    
    setFootprints(prevFootprints => {
      console.log("Updating footprints array, current count:", prevFootprints.length);
      return [...prevFootprints, newFootprint];
    });
    setSelectedFootprint(newFootprint.id)
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

  // Use the provided backgroundPlane ref if available, otherwise find it in the scene
  useEffect(() => {
    if (isSetupRef.current) return; // Only set up once
    
    console.log("Setting up background plane click handler");
    
    // Determine which background plane to use
    const plane = backgroundPlane || scene.getObjectByName("background-plane") as THREE.Mesh | undefined;
    console.log("Background plane found:", plane);
    
    if (plane) {
      // Direct event handler
      const directClickHandler = (event: any) => {
        console.log("Direct click handler called");
        handleBackgroundClick(event);
      };
      
      // First, remove any existing event listener to prevent duplicates
      plane.removeEventListener("click", directClickHandler);
      
      // Add the event listener
      plane.addEventListener("click", directClickHandler);
      console.log("Click handler attached to background plane");
      
      // Set flag to prevent multiple setups
      isSetupRef.current = true;
      
      return () => {
        console.log("Removing click handler from background plane");
        plane.removeEventListener("click", directClickHandler);
      }
    } else {
      console.warn("Background plane not found!");
    }
  }, [scene, backgroundPlane]);

  return (
    <>
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