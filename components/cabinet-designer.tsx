"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Suspense, useEffect, useRef, useState, useCallback } from "react"
import Grid from "./grids/grid"
import SideWallGrid from "./grids/side-wall-grid"
import BackWallGrid from "./grids/back-wall-grid"
import { toolbarState, ToolMode, getCurrentToolMode } from "./ToolbarFloating"
import ToolbarFloating, { useToolbarState } from "./ToolbarFloating"
import { useBlankStore } from "@/store/blank-store"
import * as THREE from "three"

// Define the Footprint type directly here
interface Footprint {
  id: string
  position: [number, number, number]
  width: number
  depth: number
  color?: string
  selected?: boolean
}

function Scene() {
  const orbitControlsRef = useRef<any>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const pointerRef = useRef<THREE.Vector2>(new THREE.Vector2());
  
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [selectedFootprint, setSelectedFootprint] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<{id: string, handle: string} | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{x: number, y: number} | null>(null);
  
  const { setSelectedPart } = useBlankStore()
  
  // Handle toolbar mode changes
  const handleToolModeChange = useCallback((mode: ToolMode) => {
    console.log("Tool mode changed to:", mode);
    setToolMode(mode)
    
    // When switching to layout mode, disable orbit controls
    if (orbitControlsRef.current) {
      if (mode === 'layout') {
        orbitControlsRef.current.enabled = false;
        console.log("Orbit controls disabled for layout mode");
      } else {
        orbitControlsRef.current.enabled = true;
        console.log("Orbit controls enabled");
      }
    }
    
    // Deselect any selected footprint when changing modes
    setSelectedFootprint(null);
  }, []);
  
  // Subscribe to toolbar state changes
  useToolbarState(handleToolModeChange);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toolMode === 'layout') {
        // Exit layout mode when Escape is pressed
        handleToolModeChange('select');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete selected footprint
        if (selectedFootprint) {
          setFootprints(current => current.filter(fp => fp.id !== selectedFootprint));
          setSelectedFootprint(null);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toolMode, handleToolModeChange, selectedFootprint]);

  // Initialize three.js renderer refs when canvas is available
  const handleCreated = useCallback(({ gl, scene, camera }: any) => {
    rendererRef.current = gl;
    sceneRef.current = scene;
    cameraRef.current = camera;
    canvasRef.current = gl.domElement;
    
    console.log("THREE.js renderer initialized");
    
    if (canvasRef.current) {
      console.log("Canvas element found and initialized");
    }
  }, []);
  
  // Handle canvas click
  const handleCanvasClick = useCallback((e: MouseEvent) => {
    if (!canvasRef.current || !sceneRef.current || !cameraRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    pointerRef.current.set(x, y);
    raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);
    
    // Find the background plane
    const backgroundPlane = sceneRef.current.getObjectByName("background-plane");
    if (!backgroundPlane) {
      console.warn("Background plane not found!");
      return;
    }
    
    const intersects = raycasterRef.current.intersectObject(backgroundPlane, false);
    console.log("Intersection count:", intersects.length);
    
    if (intersects.length > 0 && toolMode === 'layout' && !isDragging) {
      const point = intersects[0].point;
      console.log("Adding footprint at:", point);
      
      // Add a new footprint at intersection point
      const newFootprint: Footprint = {
        id: `footprint-${Date.now()}`,
        position: [point.x, 0.01, point.z],
        width: 2,
        depth: 2,
        color: "#6495ED",
        selected: false
      };
      
      setFootprints(current => [...current, newFootprint]);
      setSelectedFootprint(newFootprint.id);
    } else if (toolMode === 'select' || toolMode === 'layout') {
      // Find if we clicked on any existing footprint
      const allFootprintObjects: THREE.Object3D[] = [];
      sceneRef.current.traverse(obj => {
        if (obj.userData?.footprintId) {
          allFootprintObjects.push(obj);
        }
      });
      
      const footprintIntersects = raycasterRef.current.intersectObjects(allFootprintObjects, true);
      if (footprintIntersects.length > 0) {
        const obj = footprintIntersects[0].object;
        let current = obj;
        
        // Traverse up to find parent with footprintId
        while (current && !current.userData?.footprintId) {
          current = current.parent as THREE.Object3D;
        }
        
        if (current && current.userData?.footprintId) {
          // Select this footprint
          setSelectedFootprint(current.userData.footprintId);
        }
      } else if (intersects.length > 0) {
        // If we clicked the background plane, deselect
        setSelectedFootprint(null);
      }
    }
  }, [canvasRef, sceneRef, cameraRef, toolMode, isDragging]);
  
  // Simple footprint component
  const FootprintBox = useCallback(({ 
    id, 
    position, 
    width, 
    depth, 
    color = "#6495ED", 
    selected = false 
  }: Footprint) => {
    const boxRef = useRef<THREE.Group>(null);
    const isSelected = selected || selectedFootprint === id;
    const boxColor = color || "#6495ED";
    const borderColor = isSelected ? "#FF4500" : "#4682B4";
    const opacity = isSelected ? 0.6 : 0.4;
    const handleSize = 0.3;
    
    useEffect(() => {
      if (boxRef.current) {
        boxRef.current.userData = { footprintId: id };
      }
    }, [id]);
    
    return (
      <group ref={boxRef} position={position} userData={{ footprintId: id }}>
        {/* Main box */}
        <mesh position={[0, 0.02, 0]} userData={{ footprintId: id, part: 'main' }}>
          <boxGeometry args={[width, 0.02, depth]} />
          <meshStandardMaterial color={boxColor} transparent opacity={opacity} />
        </mesh>

        {/* Border */}
        <lineSegments position={[0, 0.025, 0]} userData={{ footprintId: id, part: 'border' }}>
          <edgesGeometry args={[new THREE.BoxGeometry(width, 0.02, depth)]} />
          <lineBasicMaterial color={borderColor} linewidth={2} />
        </lineSegments>

        {/* Resize handles */}
        {isSelected && (
          <>
            {/* Top-left handle */}
            <mesh position={[-width/2, 0.05, -depth/2]} userData={{ footprintId: id, handle: 'top-left' }}>
              <boxGeometry args={[handleSize, handleSize, handleSize]} />
              <meshStandardMaterial color="#FF0000" />
            </mesh>

            {/* Top-right handle */}
            <mesh position={[width/2, 0.05, -depth/2]} userData={{ footprintId: id, handle: 'top-right' }}>
              <boxGeometry args={[handleSize, handleSize, handleSize]} />
              <meshStandardMaterial color="#FF0000" />
            </mesh>

            {/* Bottom-left handle */}
            <mesh position={[-width/2, 0.05, depth/2]} userData={{ footprintId: id, handle: 'bottom-left' }}>
              <boxGeometry args={[handleSize, handleSize, handleSize]} />
              <meshStandardMaterial color="#FF0000" />
            </mesh>

            {/* Bottom-right handle */}
            <mesh position={[width/2, 0.05, depth/2]} userData={{ footprintId: id, handle: 'bottom-right' }}>
              <boxGeometry args={[handleSize, handleSize, handleSize]} />
              <meshStandardMaterial color="#FF0000" />
            </mesh>
          </>
        )}
      </group>
    );
  }, [selectedFootprint]);
  
  // Set up event listeners for the canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    const handleClick = (e: MouseEvent) => handleCanvasClick(e);
    
    const handleDoubleClick = (e: MouseEvent) => {
      if (toolMode === 'layout' && selectedFootprint) {
        // Delete on double click
        setFootprints(current => current.filter(fp => fp.id !== selectedFootprint));
        setSelectedFootprint(null);
      }
    };
    
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('dblclick', handleDoubleClick);
    
    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [canvasRef, handleCanvasClick, toolMode, selectedFootprint]);

  return (
    <>
      <color attach="background" args={["#f5f5f5"]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
      />
      <Environment preset="apartment" />

      {/* Floor Grid */}
      <Grid />
      
      {/* Wall Grids */}
      <SideWallGrid />
      <BackWallGrid />

      {/* Background plane for mouse interaction */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        name="background-plane"
      >
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
      
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
        />
      ))}

      <OrbitControls
        ref={orbitControlsRef}
        className="r3f-orbit-controls"
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        minDistance={2}
        maxDistance={100}
        makeDefault
      />
    </>
  )
}

export default function CabinetDesigner() {
  const { setSelectedPart } = useBlankStore()

  // Initialize history on first render
  useEffect(() => {
    try {
      // Reset selected part on initial load
      setSelectedPart(null)
    } catch (error) {
      console.error("Error initializing:", error)
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* Floating toolbar */}
      <ToolbarFloating />

      <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }} onCreated={({ gl, scene, camera }) => {
        // Store references when canvas is created
        const state = { gl, scene, camera };
        (window as any).threeState = state;
      }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
