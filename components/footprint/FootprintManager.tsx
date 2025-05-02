"use client"

import { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Footprint, DragState, ResizeState, FootprintState, FootprintActions, FootprintManagerProps } from './types'
import FootprintBox from './FootprintBox'

export const useFootprintManager = ({
  orbitControlsRef,
  toolMode,
  setCursor
}: FootprintManagerProps): [FootprintState, FootprintActions] => {
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [selectedFootprint, setSelectedFootprint] = useState<string | null>(null)
  
  // States for dragging and resizing
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startPosition: null,
    currentFootprint: null
  })
  
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    corner: null,
    startPosition: null,
    startDimensions: null,
    startBoxPosition: null,
    currentFootprint: null
  })
  
  // Find footprint by ID
  const getFootprintById = useCallback((id: string) => {
    return footprints.find(fp => fp.id === id)
  }, [footprints])

  // Update a footprint
  const updateFootprint = useCallback((id: string, updates: Partial<Footprint>) => {
    setFootprints(prevFootprints => 
      prevFootprints.map(fp => 
        fp.id === id ? { ...fp, ...updates } : fp
      )
    )
  }, [])
  
  // Add a new footprint
  const addFootprint = useCallback((position: [number, number, number]) => {
    const newFootprint: Footprint = {
      id: `footprint-${Date.now()}`,
      position,
      width: 2,
      depth: 2,
      color: "#6495ED",
      selected: false
    }
    
    console.log("Creating new footprint:", newFootprint)
    
    setFootprints(prevFootprints => [...prevFootprints, newFootprint])
    setSelectedFootprint(newFootprint.id)
  }, [])
  
  // Delete a footprint
  const deleteFootprint = useCallback((id: string) => {
    setFootprints(current => current.filter(fp => fp.id !== id))
    if (selectedFootprint === id) {
      setSelectedFootprint(null)
    }
  }, [selectedFootprint])
  
  // Select a footprint
  const selectFootprint = useCallback((id: string | null) => {
    setSelectedFootprint(id)
  }, [])
  
  // Start dragging a footprint
  const startDrag = useCallback((e: any, id: string) => {
    e.stopPropagation()
    
    // Don't start dragging if we're in layout mode
    if (toolMode !== 'select') {
      return
    }
    
    console.log("Starting drag for footprint:", id)
    setSelectedFootprint(id)
    
    setDragState({
      isDragging: true,
      startPosition: [e.point.x, e.point.y, e.point.z],
      currentFootprint: id
    })
    
    setCursor("grabbing")
    
    // Disable orbit controls during drag
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = false
    }
  }, [toolMode, setCursor, orbitControlsRef])
  
  // Start resizing a footprint from a corner
  const startResize = useCallback((e: any, id: string, corner: ResizeState['corner']) => {
    e.stopPropagation()
    
    // Don't start resizing if we're in layout mode
    if (toolMode !== 'select') {
      console.log("Not starting resize - not in select mode");
      return
    }
    
    console.log("Starting resize for footprint:", id, "corner:", corner)
    console.log("Corner click position:", e.point)
    console.log("Current tool mode:", toolMode)
    
    const footprint = getFootprintById(id)
    if (!footprint) {
      console.error("Footprint not found:", id);
      return;
    }
    
    // Be sure to set currentFootprint to track what we're resizing
    setSelectedFootprint(id)
    
    // Initialize resize state
    setResizeState({
      isResizing: true,
      corner: corner,
      startPosition: [e.point.x, e.point.y, e.point.z],
      startDimensions: { 
        width: footprint.width, 
        depth: footprint.depth 
      },
      startBoxPosition: [...footprint.position] as [number, number, number],
      currentFootprint: id
    })
    
    setCursor(corner === 'topLeft' || corner === 'bottomRight' ? "nwse-resize" : "nesw-resize")
    
    // Disable orbit controls during resize
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = false
    }
  }, [toolMode, getFootprintById, setCursor, orbitControlsRef, setSelectedFootprint])
  
  // Handle pointer move for dragging and resizing
  const handlePointerMove = useCallback((e: any) => {
    console.log("Pointer move fired!", e.point);
    
    // Handle dragging
    if (dragState.isDragging && dragState.startPosition && dragState.currentFootprint) {
      const footprint = getFootprintById(dragState.currentFootprint)
      if (!footprint) return
      
      // Calculate the delta
      const deltaX = e.point.x - dragState.startPosition[0]
      const deltaZ = e.point.z - dragState.startPosition[2]
      
      // Update the footprint position
      const newPosition: [number, number, number] = [
        footprint.position[0] + deltaX,
        footprint.position[1],
        footprint.position[2] + deltaZ
      ]
      
      updateFootprint(dragState.currentFootprint, { position: newPosition })
      
      // Update the start position for the next move
      setDragState(prev => ({
        ...prev,
        startPosition: [e.point.x, e.point.y, e.point.z]
      }))
    }
    
    // Handle resizing
    if (resizeState.isResizing && 
        resizeState.startPosition && 
        resizeState.corner && 
        resizeState.currentFootprint && 
        resizeState.startDimensions &&
        resizeState.startBoxPosition) {
      
      const footprint = getFootprintById(resizeState.currentFootprint)
      if (!footprint) return
      
      console.log("Resizing...", e.point)
      
      // Calculate the delta from the start position
      const deltaX = e.point.x - resizeState.startPosition[0]
      const deltaZ = e.point.z - resizeState.startPosition[2]
      
      // Initial values
      let newWidth = resizeState.startDimensions.width
      let newDepth = resizeState.startDimensions.depth
      let newPosition = [...resizeState.startBoxPosition] as [number, number, number]
      
      // Apply different resize logic based on which corner is being dragged
      switch(resizeState.corner) {
        case 'topLeft':
          // Width: decrease when dragging left, increase when dragging right
          // Depth: decrease when dragging up, increase when dragging down
          newWidth = Math.max(0.5, resizeState.startDimensions.width - deltaX * 2)
          newDepth = Math.max(0.5, resizeState.startDimensions.depth - deltaZ * 2)
          
          // Update position to keep the opposite corner fixed
          newPosition = [
            resizeState.startBoxPosition[0] + (resizeState.startDimensions.width - newWidth) / 2,
            resizeState.startBoxPosition[1],
            resizeState.startBoxPosition[2] + (resizeState.startDimensions.depth - newDepth) / 2
          ]
          break
          
        case 'topRight':
          // Width: increase when dragging right, decrease when dragging left
          // Depth: decrease when dragging up, increase when dragging down
          newWidth = Math.max(0.5, resizeState.startDimensions.width + deltaX * 2)
          newDepth = Math.max(0.5, resizeState.startDimensions.depth - deltaZ * 2)
          
          // Update position to keep the opposite corner fixed
          newPosition = [
            resizeState.startBoxPosition[0] + (newWidth - resizeState.startDimensions.width) / 2,
            resizeState.startBoxPosition[1],
            resizeState.startBoxPosition[2] + (resizeState.startDimensions.depth - newDepth) / 2
          ]
          break
          
        case 'bottomLeft':
          // Width: decrease when dragging left, increase when dragging right
          // Depth: increase when dragging down, decrease when dragging up
          newWidth = Math.max(0.5, resizeState.startDimensions.width - deltaX * 2)
          newDepth = Math.max(0.5, resizeState.startDimensions.depth + deltaZ * 2)
          
          // Update position to keep the opposite corner fixed
          newPosition = [
            resizeState.startBoxPosition[0] + (resizeState.startDimensions.width - newWidth) / 2,
            resizeState.startBoxPosition[1],
            resizeState.startBoxPosition[2] + (newDepth - resizeState.startDimensions.depth) / 2
          ]
          break
          
        case 'bottomRight':
          // Width: increase when dragging right, decrease when dragging left
          // Depth: increase when dragging down, decrease when dragging up
          newWidth = Math.max(0.5, resizeState.startDimensions.width + deltaX * 2)
          newDepth = Math.max(0.5, resizeState.startDimensions.depth + deltaZ * 2)
          
          // Update position to keep the opposite corner fixed
          newPosition = [
            resizeState.startBoxPosition[0] + (newWidth - resizeState.startDimensions.width) / 2,
            resizeState.startBoxPosition[1],
            resizeState.startBoxPosition[2] + (newDepth - resizeState.startDimensions.depth) / 2
          ]
          break
      }
      
      console.log("New dimensions:", { width: newWidth, depth: newDepth, position: newPosition })
      
      // Update the footprint
      updateFootprint(resizeState.currentFootprint, {
        width: newWidth,
        depth: newDepth,
        position: newPosition
      })
    }
  }, [dragState, resizeState, getFootprintById, updateFootprint])
  
  // End dragging or resizing
  const handlePointerUp = useCallback((e: any) => {
    // End dragging
    if (dragState.isDragging) {
      console.log("Ending drag")
      setDragState({
        isDragging: false,
        startPosition: null,
        currentFootprint: null
      })
      setCursor("grab")
    }
    
    // End resizing
    if (resizeState.isResizing) {
      console.log("Ending resize")
      setResizeState({
        isResizing: false,
        corner: null,
        startPosition: null,
        startDimensions: null,
        startBoxPosition: null,
        currentFootprint: null
      })
      setCursor("auto")
    }
    
    // Re-enable orbit controls if we're in select mode
    if (orbitControlsRef.current && toolMode === 'select') {
      orbitControlsRef.current.enabled = true
    }
  }, [dragState.isDragging, resizeState.isResizing, setCursor, orbitControlsRef, toolMode])
  
  // Reset state when tool mode changes
  useEffect(() => {
    setDragState({
      isDragging: false,
      startPosition: null,
      currentFootprint: null
    })
    
    setResizeState({
      isResizing: false,
      corner: null,
      startPosition: null,
      startDimensions: null,
      startBoxPosition: null,
      currentFootprint: null
    })
    
    // Deselect any selected footprint when changing modes
    setSelectedFootprint(null)
  }, [toolMode])
  
  // Add window event listeners for resize and drag operations
  useEffect(() => {
    if ((dragState.isDragging || resizeState.isResizing) && 
        (dragState.currentFootprint || resizeState.currentFootprint)) {
      // Disable orbit controls during drag or resize
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = false
      }
      
      // Add window-level event listeners to capture all pointer events
      const handleGlobalPointerMove = (e: PointerEvent) => {
        // We need to let the Three.js event system handle it
        // This is just a backup to ensure events don't stop if pointer leaves canvas
      }
      
      const handleGlobalPointerUp = (e: PointerEvent) => {
        // End dragging
        if (dragState.isDragging) {
          console.log("Global pointer up ending drag")
          setDragState({
            isDragging: false,
            startPosition: null,
            currentFootprint: null
          })
          setCursor("grab")
        }
        
        // End resizing
        if (resizeState.isResizing) {
          console.log("Global pointer up ending resize")
          setResizeState({
            isResizing: false,
            corner: null,
            startPosition: null,
            startDimensions: null,
            startBoxPosition: null,
            currentFootprint: null
          })
          setCursor("auto")
        }
        
        // Re-enable orbit controls
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = true
        }
      }
      
      window.addEventListener('pointermove', handleGlobalPointerMove)
      window.addEventListener('pointerup', handleGlobalPointerUp)
      
      return () => {
        window.removeEventListener('pointermove', handleGlobalPointerMove)
        window.removeEventListener('pointerup', handleGlobalPointerUp)
      }
    }
  }, [dragState, resizeState, setCursor, orbitControlsRef])
  
  const state: FootprintState = {
    footprints,
    selectedFootprint,
    dragState,
    resizeState
  }
  
  const actions: FootprintActions = {
    addFootprint,
    deleteFootprint,
    selectFootprint,
    updateFootprint,
    startDrag,
    startResize,
    handlePointerMove,
    handlePointerUp
  }
  
  return [state, actions]
}

export default function FootprintManager({
  orbitControlsRef,
  toolMode,
  setCursor
}: FootprintManagerProps) {
  const [state, actions] = useFootprintManager({
    orbitControlsRef,
    toolMode,
    setCursor
  })
  
  const { footprints, selectedFootprint } = state
  
  // Handle background plane click
  const handlePlaneClick = (e: any) => {
    e.stopPropagation()
    
    // Don't create new boxes if we're dragging or resizing
    if (state.dragState.isDragging || state.resizeState.isResizing) {
      console.log("Ignoring plane click during drag/resize operation")
      return
    }
    
    console.log("Background plane clicked in mode:", toolMode)
    
    if (toolMode === 'layout') {
      // Add a new box at the click position
      actions.addFootprint([e.point.x, 0.01, e.point.z])
    } else {
      // In select mode, deselect the current footprint
      actions.selectFootprint(null)
    }
  }
  
  return (
    <group
      onPointerMove={actions.handlePointerMove}
      onPointerUp={actions.handlePointerUp}
    >
      {/* Background plane for mouse interaction */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        name="background-plane"
        onClick={handlePlaneClick}
        pointerEvents="all"
      >
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
      
      {/* Render all footprints */}
      {footprints.map(footprint => (
        <FootprintBox
          key={footprint.id}
          footprint={footprint}
          isSelected={selectedFootprint === footprint.id}
          onSelect={(e) => actions.selectFootprint(footprint.id)}
          onDelete={(e) => actions.deleteFootprint(footprint.id)}
          onDragStart={actions.startDrag}
          onResizeStart={actions.startResize}
          toolMode={toolMode}
          setCursor={setCursor}
        />
      ))}
    </group>
  )
} 