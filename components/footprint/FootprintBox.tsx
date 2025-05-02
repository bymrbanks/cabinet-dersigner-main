"use client"

import { useCallback, useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { Footprint, ResizeState } from './types'

// Define the edge types for single-direction resizing
type Edge = 'top' | 'bottom' | 'left' | 'right' | null;

interface FootprintBoxProps {
  footprint: Footprint
  isSelected: boolean
  onSelect: (e: any) => void
  onDelete: (e: any) => void
  onDragStart: (e: any, id: string, isDuplicate: boolean) => void
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
  const opacity = isSelected ? 0.8 : 0.6 // Increased opacity for better visibility
  
  // Log rendering of footprint for debugging
  useEffect(() => {
    console.log(`Rendering footprint ${id} at`, position, `width: ${width}, depth: ${depth}`);
  }, [id, position, width, depth]);
  
  // Track which edge is being hovered
  const [hoveredEdge, setHoveredEdge] = useState<Edge>(null)
  
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
  
  // Handle pointer move to detect edge proximity
  const handlePointerMove = useCallback((e: any) => {
    if (!isSelected || toolMode !== 'select') {
      setHoveredEdge(null)
      return
    }
    
    // Get local position of pointer relative to box center
    const localPoint = new THREE.Vector3(e.point.x, e.point.y, e.point.z)
    const groupPosition = new THREE.Vector3(position[0], position[1], position[2])
    localPoint.sub(groupPosition)
    
    // Proximity threshold
    const threshold = 0.4
    
    // Distance to edges
    const distToTop = Math.abs(localPoint.z - (-depth/2))
    const distToBottom = Math.abs(localPoint.z - depth/2)
    const distToLeft = Math.abs(localPoint.x - (-width/2))
    const distToRight = Math.abs(localPoint.x - width/2)
    
    // Find the closest edge - prioritize in this order
    if (distToTop < threshold && distToTop <= distToBottom && distToTop <= distToLeft && distToTop <= distToRight) {
      setHoveredEdge('top')
      setCursor("ns-resize")
    } else if (distToBottom < threshold && distToBottom <= distToTop && distToBottom <= distToLeft && distToBottom <= distToRight) {
      setHoveredEdge('bottom')
      setCursor("ns-resize")
    } else if (distToLeft < threshold && distToLeft <= distToTop && distToLeft <= distToBottom && distToLeft <= distToRight) {
      setHoveredEdge('left')
      setCursor("ew-resize")
    } else if (distToRight < threshold && distToRight <= distToTop && distToRight <= distToBottom && distToRight <= distToLeft) {
      setHoveredEdge('right')
      setCursor("ew-resize")
    } else {
      setHoveredEdge(null)
      setCursor("grab")
    }
  }, [isSelected, toolMode, setCursor, width, depth, position])
  
  // Handle pointer down to start resize or drag
  const handlePointerDown = useCallback((e: any) => {
    if (!isSelected || toolMode !== 'select') return
    
    if (hoveredEdge) {
      e.stopPropagation()
      console.log(`Starting resize with edge ${hoveredEdge}`)
      
      // Map edge to corner for compatibility with existing resize logic
      let corner: ResizeState['corner'];
      switch(hoveredEdge) {
        case 'top':
          corner = 'topLeft'; // Using topLeft for top edge
          break;
        case 'right':
          corner = 'topRight'; // Using topRight for right edge
          break;
        case 'bottom':
          corner = 'bottomLeft'; // Using bottomLeft for bottom edge
          break;
        case 'left':
          corner = 'bottomRight'; // Using bottomRight for left edge
          break;
        default:
          return;
      }
      
      onResizeStart(e, id, corner)
    } else {
      // Check if Alt/Option key is pressed for duplication
      const isDuplicate = e.altKey || e.metaKey;
      if (isDuplicate) {
        setCursor("copy");
        console.log("Duplicating footprint during drag");
      }
      
      onDragStart(e, id, isDuplicate)
    }
  }, [isSelected, toolMode, hoveredEdge, onResizeStart, onDragStart, id, setCursor])
  
  // Create edge highlights for visual feedback
  const renderEdgeHighlights = useCallback(() => {
    if (!isSelected) return null
    
    const lineWidth = 0.06
    
    return (
      <>
        {/* Top edge */}
        <mesh position={[0, 0.03, -depth/2]}>
          <planeGeometry args={[width, lineWidth]} />
          <meshStandardMaterial 
            color={hoveredEdge === 'top' ? "#FF0000" : "#FF8C00"} 
            transparent 
            opacity={hoveredEdge === 'top' ? 0.8 : 0.5} 
          />
        </mesh>
        
        {/* Bottom edge */}
        <mesh position={[0, 0.03, depth/2]}>
          <planeGeometry args={[width, lineWidth]} />
          <meshStandardMaterial 
            color={hoveredEdge === 'bottom' ? "#FF0000" : "#FF8C00"} 
            transparent 
            opacity={hoveredEdge === 'bottom' ? 0.8 : 0.5} 
          />
        </mesh>
        
        {/* Left edge */}
        <mesh position={[-width/2, 0.03, 0]} rotation={[0, 0, Math.PI/2]}>
          <planeGeometry args={[depth, lineWidth]} />
          <meshStandardMaterial 
            color={hoveredEdge === 'left' ? "#FF0000" : "#FF8C00"} 
            transparent 
            opacity={hoveredEdge === 'left' ? 0.8 : 0.5} 
          />
        </mesh>
        
        {/* Right edge */}
        <mesh position={[width/2, 0.03, 0]} rotation={[0, 0, Math.PI/2]}>
          <planeGeometry args={[depth, lineWidth]} />
          <meshStandardMaterial 
            color={hoveredEdge === 'right' ? "#FF0000" : "#FF8C00"} 
            transparent 
            opacity={hoveredEdge === 'right' ? 0.8 : 0.5} 
          />
        </mesh>
      </>
    )
  }, [isSelected, width, depth, hoveredEdge])
  
  return (
    <group 
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(e)
      }}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerOver={handleBoxHover}
      onPointerOut={handleBoxUnhover}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onDelete(e)
      }}
    >
      {/* Main box */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color={boxColor} transparent opacity={opacity} />
      </mesh>

      {/* Border */}
      <lineSegments position={[0, 0.11, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, 0.1, depth)]} />
        <lineBasicMaterial color={borderColor} linewidth={3} />
      </lineSegments>

      {/* Edge highlights for resize */}
      {isSelected && renderEdgeHighlights()}
    </group>
  )
} 