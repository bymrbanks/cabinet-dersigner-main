import React, { useState, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const HANDLE_SIZE = 10;

// Initial cabinet zones to be drawn on the grid
const initialZones = [
  { id: 'base-1', x: -150, y: 0, width: 300, depth: 200, type: 'base' },
  { id: 'base-2', x: 200, y: 0, width: 300, depth: 200, type: 'base' },
  { id: 'wall-1', x: -150, y: 300, width: 300, depth: 150, type: 'wall' },
  { id: 'wall-2', x: 200, y: 300, width: 300, depth: 150, type: 'wall' },
];

export type CabinetZone = {
  id: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  type: 'base' | 'wall';
  rotation?: number; // For right-angle placement
};

interface CabinetFootprintEditorProps {
  onSave?: (zones: CabinetZone[]) => void;
  initialZonesData?: CabinetZone[];
}

export default function CabinetFootprintEditor({ onSave, initialZonesData }: CabinetFootprintEditorProps) {
  const [zones, setZones] = useState<CabinetZone[]>(initialZonesData || initialZones);
  const [selectedCabinetType, setSelectedCabinetType] = useState<'base' | 'wall'>('base');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [rotationMode, setRotationMode] = useState(false);
  const { viewport } = useThree();

  const updateZone = (id: string, newZone: Partial<CabinetZone>) => {
    setZones((zones) =>
      zones.map((z) => (z.id === id ? { ...z, ...newZone } : z))
    );
  };

  const addZone = (type: 'base' | 'wall' = selectedCabinetType) => {
    const newId = `${type}-${Date.now()}`;
    const newZone = {
      id: newId,
      x: 0,
      y: type === 'wall' ? 300 : 0, // Position wall cabinets higher up
      width: 300,
      depth: type === 'wall' ? 150 : 200, // Wall cabinets are typically less deep
      type,
      rotation: 0,
    };
    setZones([...zones, newZone]);
    return newId;
  };

  const removeZone = (id: string) => {
    setZones((zones) => zones.filter(z => z.id !== id));
  };

  const toggleRotationMode = () => {
    setRotationMode(!rotationMode);
  };

  const rotateZone = (id: string) => {
    if (!rotationMode) return;
    
    setZones((zones) =>
      zones.map((z) => {
        if (z.id === id) {
          // Rotate in 90-degree increments
          const newRotation = ((z.rotation || 0) + Math.PI/2) % (Math.PI * 2);
          return { ...z, rotation: newRotation };
        }
        return z;
      })
    );
  };

  return (
    <>
      <color attach="background" args={['#f0f0f0']} />
      <gridHelper args={[1000, 20]} rotation={[Math.PI / 2, 0, 0]} />
      <OrbitControls enableRotate={false} />
      
      {/* Wall marker line */}
      <line>
        <bufferGeometry attach="geometry" args={[new Float32Array([-500, 250, 0, 500, 250, 0]), 3]} />
        <lineBasicMaterial attach="material" color="#808080" linewidth={2} />
      </line>
      <Sprite position={[0, 260, 1]} scale={[160, 30, 1]}>
        <spriteMaterial attach="material" transparent>
          <CanvasTexture text="Wall" />
        </spriteMaterial>
      </Sprite>
      
      {/* Base area marker */}
      <line>
        <bufferGeometry attach="geometry" args={[new Float32Array([-500, -100, 0, 500, -100, 0]), 3]} />
        <lineBasicMaterial attach="material" color="#808080" linewidth={2} />
      </line>
      <Sprite position={[0, -110, 1]} scale={[160, 30, 1]}>
        <spriteMaterial attach="material" transparent>
          <CanvasTexture text="Floor" />
        </spriteMaterial>
      </Sprite>
      
      {/* Render cabinet zones */}
      {zones.map((zone) => (
        <Zone 
          key={zone.id} 
          {...zone} 
          onUpdate={(data) => updateZone(zone.id, data)} 
          onRemove={() => removeZone(zone.id)}
          rotationMode={rotationMode}
          onRotate={() => rotateZone(zone.id)}
        />
      ))}
      
      {/* Add cabinet button with dropdown */}
      <group position={[-viewport.width / 2 + 100, -viewport.height / 2 + 100, 10]}>
        <mesh 
          onClick={() => setShowTypeDropdown(!showTypeDropdown)}
          position={[0, 0, 0]}
        >
          <planeGeometry args={[140, 40]} />
          <meshBasicMaterial color="#4CAF50" />
        </mesh>
        <Sprite scale={[120, 30, 1]} position={[0, 0, 1]}>
          <spriteMaterial attach="material" transparent>
            <CanvasTexture text={`+ Add ${selectedCabinetType.charAt(0).toUpperCase() + selectedCabinetType.slice(1)} Cabinet`} />
          </spriteMaterial>
        </Sprite>
        
        {/* Type selection dropdown */}
        {showTypeDropdown && (
          <group position={[0, 45, 1]}>
            <mesh 
              onClick={() => {
                setSelectedCabinetType('base');
                setShowTypeDropdown(false);
                addZone('base');
              }}
              position={[0, 20, 0]}
            >
              <planeGeometry args={[140, 30]} />
              <meshBasicMaterial color={selectedCabinetType === 'base' ? "#81C784" : "#A5D6A7"} />
            </mesh>
            <Sprite scale={[120, 20, 1]} position={[0, 20, 1]}>
              <spriteMaterial attach="material" transparent>
                <CanvasTexture text="Base Cabinet" />
              </spriteMaterial>
            </Sprite>
            
            <mesh 
              onClick={() => {
                setSelectedCabinetType('wall');
                setShowTypeDropdown(false);
                addZone('wall');
              }}
              position={[0, -20, 0]}
            >
              <planeGeometry args={[140, 30]} />
              <meshBasicMaterial color={selectedCabinetType === 'wall' ? "#81C784" : "#A5D6A7"} />
            </mesh>
            <Sprite scale={[120, 20, 1]} position={[0, -20, 1]}>
              <spriteMaterial attach="material" transparent>
                <CanvasTexture text="Wall Cabinet" />
              </spriteMaterial>
            </Sprite>
          </group>
        )}
      </group>
      
      {/* Rotation toggle button */}
      <group position={[-viewport.width / 2 + 100, -viewport.height / 2 + 150, 10]}>
        <mesh onClick={toggleRotationMode}>
          <planeGeometry args={[140, 40]} />
          <meshBasicMaterial color={rotationMode ? "#5C6BC0" : "#7986CB"} />
        </mesh>
        <Sprite scale={[120, 30, 1]} position={[0, 0, 1]}>
          <spriteMaterial attach="material" transparent>
            <CanvasTexture text={rotationMode ? "Rotation: ON" : "Rotation: OFF"} />
          </spriteMaterial>
        </Sprite>
      </group>
      
      {/* Save button */}
      {onSave && (
        <SaveButton onSave={() => onSave(zones)} />
      )}
    </>
  );
}

interface ZoneProps extends CabinetZone {
  onUpdate: (data: Partial<CabinetZone>) => void;
  onRemove: () => void;
  rotationMode: boolean;
  onRotate: () => void;
}

function Zone({ id, x, y, width, depth, type, rotation = 0, onUpdate, onRemove, rotationMode, onRotate }: ZoneProps) {
  const handleDrag = (corner: string, dx: number, dy: number) => {
    const updates: Partial<CabinetZone> = { };

    // Apply transformations based on cabinet rotation
    const rotatedDx = dx * Math.cos(rotation) - dy * Math.sin(rotation);
    const rotatedDy = dx * Math.sin(rotation) + dy * Math.cos(rotation);

    switch (corner) {
      case 'top-left':
        updates.x = x + rotatedDx;
        updates.y = y + rotatedDy;
        updates.width = width - rotatedDx;
        updates.depth = depth - rotatedDy;
        break;
      case 'top-right':
        updates.y = y + rotatedDy;
        updates.width = width + rotatedDx;
        updates.depth = depth - rotatedDy;
        break;
      case 'bottom-left':
        updates.x = x + rotatedDx;
        updates.width = width - rotatedDx;
        updates.depth = depth + rotatedDy;
        break;
      case 'bottom-right':
        updates.width = width + rotatedDx;
        updates.depth = depth + rotatedDy;
        break;
      case 'move':
        updates.x = x + dx;
        updates.y = y + dy;
        break;
      default:
        break;
    }

    // Ensure minimum size
    if (updates.width && updates.width < 50) updates.width = 50;
    if (updates.depth && updates.depth < 50) updates.depth = 50;

    onUpdate(updates);
  };

  return (
    <group position={[x + width / 2, y + depth / 2, 0]} rotation={[0, 0, rotation]}>
      {/* Cabinet Plane */}
      <mesh 
        position={[0, 0, 0]} 
        onDoubleClick={() => onRemove()}
        onClick={() => rotationMode && onRotate()}
      >
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial 
          color={type === 'wall' ? "#90CAF9" : "#add8e6"} 
          transparent 
          opacity={0.6}
        />
      </mesh>

      {/* Border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(width, depth)]} />
        <lineBasicMaterial color={type === 'wall' ? "#1976D2" : "#00bfff"} />
      </lineSegments>

      {/* Move handle (centered) */}
      <Handle
        position={[0, 0, 1]}
        color="#4a90e2"
        onDrag={(dx, dy) => handleDrag('move', dx, dy)}
      />

      {/* Resize handles - only show if not in rotation mode */}
      {!rotationMode && [
        { corner: 'top-left', px: -width / 2, py: -depth / 2 },
        { corner: 'top-right', px: width / 2, py: -depth / 2 },
        { corner: 'bottom-left', px: -width / 2, py: depth / 2 },
        { corner: 'bottom-right', px: width / 2, py: depth / 2 },
      ].map(({ corner, px, py }) => (
        <Handle
          key={corner}
          position={[px, py, 1]}
          onDrag={(dx, dy) => handleDrag(corner, dx, dy)}
        />
      ))}

      {/* Show rotation indicator when in rotation mode */}
      {rotationMode && (
        <mesh position={[0, 0, 2]}>
          <ringGeometry args={[width/4, width/4 + 5, 32]} />
          <meshBasicMaterial color="#FFB74D" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Cabinet direction indicator (front edge) */}
      <lineSegments position={[0, depth/2, 2]}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            array={new Float32Array([-width/2, 0, 0, width/2, 0, 0])} 
            count={2} 
            itemSize={3} 
          />
        </bufferGeometry>
        <lineBasicMaterial color="#FF5722" linewidth={3} />
      </lineSegments>

      {/* Label for the cabinet zone */}
      <Label 
        position={[0, 0, 5]} 
        text={`${type.charAt(0).toUpperCase() + type.slice(1)} - ${id.split('-')[1]}`} 
        bgColor={type === 'wall' ? "#1565C0" : "#0277BD"}
      />
    </group>
  );
}

interface HandleProps {
  position: [number, number, number];
  onDrag: (dx: number, dy: number) => void;
  color?: string;
}

function Handle({ position, onDrag, color = "#007fff" }: HandleProps) {
  const [dragging, setDragging] = useState(false);
  const { camera } = useThree();

  return (
    <mesh
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation();
        setDragging(true);
        document.body.style.cursor = 'grabbing';
      }}
      onPointerUp={() => {
        setDragging(false);
        document.body.style.cursor = 'auto';
      }}
      onPointerOut={() => {
        if (dragging) {
          setDragging(false);
          document.body.style.cursor = 'auto';
        }
      }}
      onPointerMove={(e) => {
        if (dragging) {
          e.stopPropagation();
          // Scale movement based on camera zoom for consistent feel
          const scale = 5 / (camera as THREE.OrthographicCamera).zoom;
          onDrag(e.movementX * scale, -e.movementY * scale);
        }
      }}
      onPointerEnter={() => {
        document.body.style.cursor = 'grab';
      }}
      onPointerLeave={() => {
        if (!dragging) document.body.style.cursor = 'auto';
      }}
    >
      <boxGeometry args={[HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Label({ position, text, bgColor = "#000000" }: { 
  position: [number, number, number], 
  text: string,
  bgColor?: string
}) {
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[120, 30]} />
        <meshBasicMaterial color={bgColor} transparent opacity={0.7} />
      </mesh>
      <Sprite scale={[100, 20, 1]} position={[0, 0, 2]}>
        <spriteMaterial attach="material" transparent>
          <CanvasTexture text={text} />
        </spriteMaterial>
      </Sprite>
    </group>
  );
}

function Sprite({ children, ...props }: any) {
  return <sprite {...props}>{children}</sprite>;
}

// Canvas texture for text rendering
function CanvasTexture({ text }: { text: string }) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#ffffff';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 128, 32);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  return <canvasTexture attach="map" args={[canvas]} />;
}

function SaveButton({ onSave }: { onSave: () => void }) {
  const { viewport } = useThree();
  
  return (
    <group position={[viewport.width / 2 - 100, -viewport.height / 2 + 50, 10]}>
      <mesh onClick={onSave}>
        <planeGeometry args={[80, 40]} />
        <meshBasicMaterial color="#2196F3" />
      </mesh>
      <Sprite scale={[60, 30, 1]} position={[0, 0, 1]}>
        <spriteMaterial attach="material" transparent>
          <CanvasTexture text="Save" />
        </spriteMaterial>
      </Sprite>
    </group>
  );
} 