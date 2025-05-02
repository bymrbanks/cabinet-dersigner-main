"use client"

import { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Footprint, DragState, ResizeState, FootprintState, FootprintActions, FootprintManagerProps } from './types'
import FootprintBox from './FootprintBox'

export const useFootprintManager = ({
  orbitControlsRef,
  toolMode,
  setCursor,
  footprints,
  selectedFootprint,
  onFootprintsChange,
  onSelectFootprint
}: FootprintManagerProps): [FootprintState, FootprintActions] => {
  // States for dragging and resizing
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startPosition: null,
    currentFootprint: null,
    isDuplicate: false
  })
  
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    corner: null,
    startPosition: null,
    startDimensions: null,
    startBoxPosition: null,
    currentFootprint: null
  })
  
  // Use external footprints state now instead of internal state
  const getFootprintById = useCallback((id: string) => {
    return footprints.find(fp => fp.id === id)
  }, [footprints])

  // Update a footprint
  const updateFootprint = useCallback((id: string, updates: Partial<Footprint>) => {
    const updatedFootprints = footprints.map(fp => 
      fp.id === id ? { ...fp, ...updates } : fp
    )
    onFootprintsChange(updatedFootprints)
  }, [footprints, onFootprintsChange])
  
  // Add a new footprint
  const addFootprint = useCallback((position: [number, number, number], template?: Partial<Footprint>) => {
    // Ensure Y position is slightly above the floor for visibility
    const newPosition: [number, number, number] = [
      position[0],
      0.05, // Slightly elevated above floor (was 0.01)
      position[2]
    ];
    
    const newFootprint: Footprint = {
      id: `footprint-${Date.now()}`,
      position: newPosition,
      width: template?.width || 2,
      depth: template?.depth || 2,
      color: template?.color || "#6495ED",
      selected: false
    }
    
    console.log("Creating new footprint:", newFootprint);
    console.log("Current footprints count before adding:", footprints.length);
    
    // Create a new array with the new footprint to avoid mutation issues
    const updatedFootprints = [...footprints, newFootprint];
    console.log("Updated footprints count:", updatedFootprints.length);
    
    // Directly apply the state update
    onFootprintsChange(updatedFootprints);
    
    return newFootprint.id;
  }, [footprints, onFootprintsChange])
  
  // Delete a footprint
  const deleteFootprint = useCallback((id: string) => {
    const updatedFootprints = footprints.filter(fp => fp.id !== id)
    onFootprintsChange(updatedFootprints)
    if (selectedFootprint === id) {
      onSelectFootprint(null)
    }
  }, [footprints, selectedFootprint, onFootprintsChange, onSelectFootprint])
  
  // Select a footprint
  const selectFootprint = useCallback((id: string | null) => {
    onSelectFootprint(id)
    // Update the selected state of footprints
    const updatedFootprints = footprints.map(fp => ({
      ...fp,
      selected: fp.id === id
    }))
    onFootprintsChange(updatedFootprints)
  }, [footprints, onFootprintsChange, onSelectFootprint])
  
  // Start dragging a footprint
  const startDrag = useCallback((e: any, id: string, isDuplicate: boolean = false) => {
    e.stopPropagation()
    
    // Don't start dragging if we're in layout mode
    if (toolMode !== 'select') {
      return
    }
    
    console.log("Starting drag for footprint:", id, "Duplicate:", isDuplicate)
    
    let currentId = id;
    
    // If we're duplicating, create a new footprint based on the current one
    if (isDuplicate) {
      const sourceFootprint = getFootprintById(id);
      if (sourceFootprint) {
        // Create a duplicate with slight offset
        const newPosition: [number, number, number] = [
          sourceFootprint.position[0] + 0.5, 
          sourceFootprint.position[1], 
          sourceFootprint.position[2] + 0.5
        ];
        
        // Create duplicate
        currentId = addFootprint(newPosition, {
          width: sourceFootprint.width,
          depth: sourceFootprint.depth,
          color: sourceFootprint.color
        });
        
        console.log("Created duplicate footprint:", currentId);
      }
    }
    
    // Select the footprint we're now dragging (original or duplicate)
    onSelectFootprint(currentId)
    
    setDragState({
      isDragging: true,
      startPosition: [e.point.x, e.point.y, e.point.z],
      currentFootprint: currentId,
      isDuplicate: isDuplicate
    })
    
    setCursor(isDuplicate ? "copy" : "grabbing")
    
    // Disable orbit controls during drag
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = false
    }
  }, [toolMode, setCursor, orbitControlsRef, getFootprintById, addFootprint, onSelectFootprint])
  
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
    onSelectFootprint(id)
    
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
  }, [toolMode, getFootprintById, setCursor, orbitControlsRef, onSelectFootprint])
  
  // Handle pointer move for dragging and resizing
  const handlePointerMove = useCallback((e: any) => {
    
    // Handle dragging
    if (dragState.isDragging && dragState.startPosition && dragState.currentFootprint) {
      const footprint = getFootprintById(dragState.currentFootprint)
      if (!footprint) return
      
      // Calculate the delta
      const deltaX = e.point.x - dragState.startPosition[0]
      const deltaZ = e.point.z - dragState.startPosition[2]
      
      // Calculate new position
      let newX = footprint.position[0] + deltaX
      let newZ = footprint.position[2] + deltaZ
      
      // Apply grid constraints (centered grid from -10 to 10 in both dimensions)
      const gridHalfSize = 10
      const halfWidth = footprint.width / 2
      const halfDepth = footprint.depth / 2
      
      // Constrain x position to keep the box within the grid boundaries
      newX = Math.max(-gridHalfSize + halfWidth, Math.min(gridHalfSize - halfWidth, newX))
      
      // Constrain z position to keep the box within the grid boundaries
      newZ = Math.max(-gridHalfSize + halfDepth, Math.min(gridHalfSize - halfDepth, newZ))
      
      // Update the footprint position
      const newPosition: [number, number, number] = [
        newX,
        footprint.position[1],
        newZ
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
      
      // Grid constraints - grid is centered at origin, -10 to 10 in both x and z
      const gridHalfSize = 10
      const minSize = 0.5 // Minimum box size
      
      // Single directional resizing based on the corner
      // We're using the corner field for edge compatibility
      switch(resizeState.corner) {
        case 'topLeft': // Top edge resize
          // Only change depth, not width
          newDepth = Math.max(minSize, resizeState.startDimensions.depth - deltaZ * 2)
          
          // Update position to keep the bottom edge fixed
          newPosition = [
            resizeState.startBoxPosition[0],
            resizeState.startBoxPosition[1],
            resizeState.startBoxPosition[2] + (resizeState.startDimensions.depth - newDepth) / 2
          ]
          
          // Check grid constraints for top edge
          if (newPosition[2] - newDepth/2 < -gridHalfSize) {
            newDepth = newDepth - ((-gridHalfSize) - (newPosition[2] - newDepth/2))
            newPosition[2] = newPosition[2] + (resizeState.startDimensions.depth - newDepth) / 2
          }
          break
          
        case 'topRight': // Right edge resize
          // Only change width, not depth  
          newWidth = Math.max(minSize, resizeState.startDimensions.width + deltaX * 2)
          
          // Update position to keep the left edge fixed
          newPosition = [
            resizeState.startBoxPosition[0] + (newWidth - resizeState.startDimensions.width) / 2,
            resizeState.startBoxPosition[1],
            resizeState.startBoxPosition[2]
          ]
          
          // Check grid constraints for right edge
          if (newPosition[0] + newWidth/2 > gridHalfSize) {
            newWidth = (gridHalfSize - (newPosition[0] - newWidth/2)) * 2
            newPosition[0] = newPosition[0] - ((resizeState.startDimensions.width - newWidth) / 2)
          }
          break
          
        case 'bottomLeft': // Bottom edge resize
          // Only change depth, not width
          newDepth = Math.max(minSize, resizeState.startDimensions.depth + deltaZ * 2)
          
          // Update position to keep the top edge fixed
          newPosition = [
            resizeState.startBoxPosition[0],
            resizeState.startBoxPosition[1],
            resizeState.startBoxPosition[2] + (newDepth - resizeState.startDimensions.depth) / 2
          ]
          
          // Check grid constraints for bottom edge
          if (newPosition[2] + newDepth/2 > gridHalfSize) {
            newDepth = (gridHalfSize - (newPosition[2] - newDepth/2)) * 2
            newPosition[2] = newPosition[2] - ((newDepth - resizeState.startDimensions.depth) / 2)
          }
          break
          
        case 'bottomRight': // Left edge resize
          // Only change width, not depth
          newWidth = Math.max(minSize, resizeState.startDimensions.width - deltaX * 2)
          
          // Update position to keep the right edge fixed
          newPosition = [
            resizeState.startBoxPosition[0] + (resizeState.startDimensions.width - newWidth) / 2,
            resizeState.startBoxPosition[1],
            resizeState.startBoxPosition[2]
          ]
          
          // Check grid constraints for left edge
          if (newPosition[0] - newWidth/2 < -gridHalfSize) {
            newWidth = newWidth - ((-gridHalfSize) - (newPosition[0] - newWidth/2))
            newPosition[0] = newPosition[0] - ((resizeState.startDimensions.width - newWidth) / 2)
          }
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
        currentFootprint: null,
        isDuplicate: false
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
      currentFootprint: null,
      isDuplicate: false
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
    onSelectFootprint(null)
  }, [toolMode, onSelectFootprint])
  
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
            currentFootprint: null,
            isDuplicate: false
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
  setCursor,
  footprints,
  selectedFootprint,
  onFootprintsChange,
  onSelectFootprint
}: FootprintManagerProps) {
  const [state, actions] = useFootprintManager({
    orbitControlsRef,
    toolMode,
    setCursor,
    footprints,
    selectedFootprint,
    onFootprintsChange,
    onSelectFootprint
  })
  
  const { footprints: managerFootprints } = state
  
  // Handle background plane click
  const handlePlaneClick = (e: any) => {
    e.stopPropagation()
    
    // Don't create new boxes if we're dragging or resizing
    if (state.dragState.isDragging || state.resizeState.isResizing) {
      console.log("Ignoring plane click during drag/resize operation")
      return
    }
    
    console.log("Background plane clicked in mode:", toolMode)
    console.log("Click position:", e.point)
    
    if (toolMode === 'layout') {
      // Grid size (from grid.tsx, which is 20x20 centered at origin, so -10 to +10 in both directions)
      const gridHalfSize = 10;
      
      // Make sure the footprint will fit in the grid
      const footprintWidth = 3;
      const footprintDepth = 3;
      
      // Constrain position to ensure footprint stays fully in the grid
      // Limit x and z to ensure the footprint edges stay within the grid
      const constrainedX = Math.max(-gridHalfSize + footprintWidth/2, 
                            Math.min(gridHalfSize - footprintWidth/2, e.point.x));
      const constrainedZ = Math.max(-gridHalfSize + footprintDepth/2, 
                            Math.min(gridHalfSize - footprintDepth/2, e.point.z));
      
      // Create valid position
      const clickPosition: [number, number, number] = [constrainedX, 0, constrainedZ];
      
      console.log("Creating new footprint at", clickPosition)
      
      // Directly create the new footprint to ensure state is updated
      const newFootprint: Footprint = {
        id: `footprint-${Date.now()}`,
        position: [clickPosition[0], 0.05, clickPosition[2]],
        width: footprintWidth,
        depth: footprintDepth,
        color: "#FF5733",
        selected: true
      }
      
      console.log("Created new footprint:", newFootprint)
      
      // Directly update footprints in parent component
      const updatedFootprints = [...footprints, newFootprint]
      console.log("Directly updating footprints array:", updatedFootprints.length)
      onFootprintsChange(updatedFootprints)
      
      // Then select it
      onSelectFootprint(newFootprint.id)
    } else {
      console.log("Not in layout mode, deselecting footprint")
      // In select mode, deselect the current footprint
      actions.selectFootprint(null)
    }
  }
  
  return (
    <group
      onPointerMove={actions.handlePointerMove}
      onPointerUp={actions.handlePointerUp}
    >
      {/* Background plane for mouse interaction - centered at origin to match main grid */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]} 
        receiveShadow
        name="background-plane"
        onClick={handlePlaneClick}
      >
        <planeGeometry args={[20, 20]} /> {/* Match the grid size: 20x20 */}
        <meshStandardMaterial color="#f0f0f0" transparent opacity={0.2} />
      </mesh>
      
      {/* Render all footprints */}
      {managerFootprints.map(footprint => (
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