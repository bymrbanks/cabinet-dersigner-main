"use client"

import { useCallback } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { Footprint, ResizeState } from './types'

interface FootprintBoxProps {
  footprint: Footprint
  isSelected: boolean
  onSelect: (e: any) => void
  onDelete: (e: any) => void
  onDragStart: (e: any, id: string) => void
  onResizeStart: (e: any, id: string, corner: ResizeState['corner']) => void
  toolMode: string
  setCursor: (cursor: string) => void
}

export default function FootprintBox({
  footprint,
  isSelected,
  onSelect,
  onDelete,
  onDragStart,
  onResizeStart,
  toolMode,
  setCursor
}: FootprintBoxProps) {
  const { id, position, width, depth, color = "#6495ED" } = footprint
  const boxColor = color
  const borderColor = isSelected ? "#FF4500" : "#4682B4"
  const opacity = isSelected ? 0.6 : 0.4
  
  // Handle box hover
  const handleBoxHover = useCallback(() => {
    if (toolMode === 'select') {
      setCursor("grab")
    }
  }, [toolMode, setCursor])
  
  // Handle box unhover
  const handleBoxUnhover = useCallback(() => {
    if (toolMode === 'select') {
      setCursor("auto")
    }
  }, [toolMode, setCursor])
  
  // Handle corner hover
  const handleCornerHover = useCallback((corner: ResizeState['corner']) => {
    if (toolMode === 'select') {
      switch (corner) {
        case 'topLeft':
        case 'bottomRight': 
          setCursor("nwse-resize")
          break
        case 'topRight':
        case 'bottomLeft':
          setCursor("nesw-resize")
          break
      }
    }
  }, [toolMode, setCursor])
  
  // Handle corner unhover
  const handleCornerUnhover = useCallback(() => {
    if (toolMode === 'select') {
      setCursor("auto")
    }
  }, [toolMode, setCursor])
  
  // Create a corner trigger for resizing
  const createCornerTrigger = useCallback((corner: ResizeState['corner']) => {
    const handleSize = 0.6
    
    // Position the handle at the appropriate corner
    let cornerPosition: [number, number, number] = [0, 0, 0]
    
    switch(corner) {
      case 'topLeft':
        cornerPosition = [-width/2, 0.05, -depth/2]
        break
      case 'topRight':
        cornerPosition = [width/2, 0.05, -depth/2]
        break
      case 'bottomLeft':
        cornerPosition = [-width/2, 0.05, depth/2]
        break
      case 'bottomRight':
        cornerPosition = [width/2, 0.05, depth/2]
        break
    }
    
    return (
      <mesh 
        key={`${id}-${corner}`}
        position={cornerPosition}
        onPointerDown={(e) => {
          e.stopPropagation()
          onResizeStart(e, id, corner)
        }}
        onPointerOver={() => handleCornerHover(corner)}
        onPointerOut={handleCornerUnhover}
      >
        <sphereGeometry args={[handleSize/2, 16, 16]} />
        <meshStandardMaterial color="#FF0000" transparent opacity={0.7} />
      </mesh>
    )
  }, [id, width, depth, onResizeStart, handleCornerHover, handleCornerUnhover])
  
  return (
    <group 
      position={position} 
      onClick={(e) => {
        e.stopPropagation()
        onSelect(e)
      }}
      onPointerDown={(e) => onDragStart(e, id)}
      onPointerOver={handleBoxHover}
      onPointerOut={handleBoxUnhover}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onDelete(e)
      }}
    >
      {/* Main box */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[width, 0.02, depth]} />
        <meshStandardMaterial color={boxColor} transparent opacity={opacity} />
      </mesh>

      {/* Border */}
      <lineSegments position={[0, 0.025, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, 0.02, depth)]} />
        <lineBasicMaterial color={borderColor} linewidth={2} />
      </lineSegments>

      {/* Resize corner handles - only show when selected */}
      {isSelected && (
        <>
          {createCornerTrigger('topLeft')}
          {createCornerTrigger('topRight')}
          {createCornerTrigger('bottomLeft')}
          {createCornerTrigger('bottomRight')}
        </>
      )}
    </group>
  )
} 