"use client"

import { useCallback, useMemo, useState } from 'react'
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
  
  // Track which edge is being hovered
  const [hoveredEdge, setHoveredEdge] = useState<ResizeState['corner'] | null>(null)
  
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
  
  // Calculate edge positions for edge detection
  const edges = useMemo(() => {
    return {
      topLeft: new THREE.Vector3(-width/2, 0.025, -depth/2),
      topRight: new THREE.Vector3(width/2, 0.025, -depth/2),
      bottomLeft: new THREE.Vector3(-width/2, 0.025, depth/2),
      bottomRight: new THREE.Vector3(width/2, 0.025, depth/2)
    }
  }, [width, depth])
  
  // Handle pointer move to detect edge proximity
  const handlePointerMove = useCallback((e: any) => {
    if (!isSelected || toolMode !== 'select') {
      setHoveredEdge(null)
      return
    }
    
    // Get local position of pointer relative to box center
    const localPoint = new THREE.Vector3(e.point.x, e.point.y, e.point.z)
    // This is necessary to convert from world to local coordinates
    const worldPoint = new THREE.Vector3(e.point.x, e.point.y, e.point.z)
    const groupPosition = new THREE.Vector3(position[0], position[1], position[2])
    localPoint.sub(groupPosition)
    
    // Proximity threshold
    const threshold = 0.4
    
    // Distance to edges
    const distToTop = Math.abs(localPoint.z - (-depth/2))
    const distToBottom = Math.abs(localPoint.z - depth/2)
    const distToLeft = Math.abs(localPoint.x - (-width/2))
    const distToRight = Math.abs(localPoint.x - width/2)
    
    // Find closest edge
    if (distToTop < threshold && distToLeft < threshold) {
      setHoveredEdge('topLeft')
      setCursor("nwse-resize")
    } else if (distToTop < threshold && distToRight < threshold) {
      setHoveredEdge('topRight')
      setCursor("nesw-resize")
    } else if (distToBottom < threshold && distToLeft < threshold) {
      setHoveredEdge('bottomLeft')
      setCursor("nesw-resize")
    } else if (distToBottom < threshold && distToRight < threshold) {
      setHoveredEdge('bottomRight')
      setCursor("nwse-resize")
    } else if (distToTop < threshold) {
      setHoveredEdge('topRight')
      setCursor("ns-resize")
    } else if (distToBottom < threshold) {
      setHoveredEdge('bottomLeft')
      setCursor("ns-resize")
    } else if (distToLeft < threshold) {
      setHoveredEdge('topLeft')
      setCursor("ew-resize")
    } else if (distToRight < threshold) {
      setHoveredEdge('bottomRight')
      setCursor("ew-resize")
    } else {
      setHoveredEdge(null)
      setCursor("grab")
    }
  }, [isSelected, toolMode, setCursor, width, depth, position])
  
  // Handle pointer down to start resize
  const handlePointerDown = useCallback((e: any) => {
    if (!isSelected || toolMode !== 'select') return
    
    if (hoveredEdge) {
      e.stopPropagation()
      console.log(`Starting resize with edge ${hoveredEdge}`)
      onResizeStart(e, id, hoveredEdge)
    } else {
      onDragStart(e, id)
    }
  }, [isSelected, toolMode, hoveredEdge, onResizeStart, onDragStart, id])
  
  // Create edge highlights for visual feedback
  const renderEdgeHighlights = useCallback(() => {
    if (!isSelected) return null
    
    // Calculate geometry for highlighted edges
    const createEdgeGeometry = (corner: ResizeState['corner']) => {
      const lineWidth = 0.06
      let geometry, position, rotation, size
      
      switch(corner) {
        case 'topLeft':
          // For top-left, highlight both top and left edges
          return (
            <>
              {/* Left edge */}
              <mesh position={[-width/2, 0.03, 0]} rotation={[0, 0, Math.PI/2]}>
                <planeGeometry args={[depth, lineWidth]} />
                <meshStandardMaterial color={hoveredEdge === 'topLeft' ? "#FF0000" : "#FF8C00"} 
                  transparent opacity={hoveredEdge === 'topLeft' ? 0.8 : 0.5} />
              </mesh>
              {/* Top edge */}
              <mesh position={[0, 0.03, -depth/2]}>
                <planeGeometry args={[width, lineWidth]} />
                <meshStandardMaterial color={hoveredEdge === 'topLeft' ? "#FF0000" : "#FF8C00"} 
                  transparent opacity={hoveredEdge === 'topLeft' ? 0.8 : 0.5} />
              </mesh>
            </>
          )
        case 'topRight':
          return (
            <>
              {/* Right edge */}
              <mesh position={[width/2, 0.03, 0]} rotation={[0, 0, Math.PI/2]}>
                <planeGeometry args={[depth, lineWidth]} />
                <meshStandardMaterial color={hoveredEdge === 'topRight' ? "#FF0000" : "#FF8C00"} 
                  transparent opacity={hoveredEdge === 'topRight' ? 0.8 : 0.5} />
              </mesh>
              {/* Top edge - only if not already highlighted by topLeft */}
              {hoveredEdge !== 'topLeft' && (
                <mesh position={[0, 0.03, -depth/2]}>
                  <planeGeometry args={[width, lineWidth]} />
                  <meshStandardMaterial color={hoveredEdge === 'topRight' ? "#FF0000" : "#FF8C00"} 
                    transparent opacity={hoveredEdge === 'topRight' ? 0.8 : 0.5} />
                </mesh>
              )}
            </>
          )
        case 'bottomLeft':
          return (
            <>
              {/* Left edge - only if not already highlighted by topLeft */}
              {hoveredEdge !== 'topLeft' && (
                <mesh position={[-width/2, 0.03, 0]} rotation={[0, 0, Math.PI/2]}>
                  <planeGeometry args={[depth, lineWidth]} />
                  <meshStandardMaterial color={hoveredEdge === 'bottomLeft' ? "#FF0000" : "#FF8C00"} 
                    transparent opacity={hoveredEdge === 'bottomLeft' ? 0.8 : 0.5} />
                </mesh>
              )}
              {/* Bottom edge */}
              <mesh position={[0, 0.03, depth/2]}>
                <planeGeometry args={[width, lineWidth]} />
                <meshStandardMaterial color={hoveredEdge === 'bottomLeft' ? "#FF0000" : "#FF8C00"} 
                  transparent opacity={hoveredEdge === 'bottomLeft' ? 0.8 : 0.5} />
              </mesh>
            </>
          )
        case 'bottomRight':
          return (
            <>
              {/* Right edge - only if not already highlighted by topRight */}
              {hoveredEdge !== 'topRight' && (
                <mesh position={[width/2, 0.03, 0]} rotation={[0, 0, Math.PI/2]}>
                  <planeGeometry args={[depth, lineWidth]} />
                  <meshStandardMaterial color={hoveredEdge === 'bottomRight' ? "#FF0000" : "#FF8C00"} 
                    transparent opacity={hoveredEdge === 'bottomRight' ? 0.8 : 0.5} />
                </mesh>
              )}
              {/* Bottom edge - only if not already highlighted by bottomLeft */}
              {hoveredEdge !== 'bottomLeft' && (
                <mesh position={[0, 0.03, depth/2]}>
                  <planeGeometry args={[width, lineWidth]} />
                  <meshStandardMaterial color={hoveredEdge === 'bottomRight' ? "#FF0000" : "#FF8C00"} 
                    transparent opacity={hoveredEdge === 'bottomRight' ? 0.8 : 0.5} />
                </mesh>
              )}
            </>
          )
      }
    }
    
    return (
      <>
        {createEdgeGeometry('topLeft')}
        {createEdgeGeometry('topRight')}
        {createEdgeGeometry('bottomLeft')}
        {createEdgeGeometry('bottomRight')}
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
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[width, 0.02, depth]} />
        <meshStandardMaterial color={boxColor} transparent opacity={opacity} />
      </mesh>

      {/* Border */}
      <lineSegments position={[0, 0.025, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, 0.02, depth)]} />
        <lineBasicMaterial color={borderColor} linewidth={2} />
      </lineSegments>

      {/* Edge highlights for resize */}
      {isSelected && renderEdgeHighlights()}
    </group>
  )
} 