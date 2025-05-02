import React, { useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const HANDLE_SIZE = 10;

// Initial cabinet zones to be drawn on the grid
const initialZones = [
  { id: 'bottom-1', x: -150, y: 0, width: 300, depth: 200 },
  { id: 'bottom-2', x: 200, y: 0, width: 300, depth: 200 },
  { id: 'top-1', x: -150, y: 300, width: 300, depth: 150 },
  { id: 'top-2', x: 200, y: 300, width: 300, depth: 150 },
];

export type CabinetZone = {
  id: string;
  x: number;
  y: number;
  width: number;
  depth: number;
};

interface CabinetFootprintEditorProps {
  onSave?: (zones: CabinetZone[]) => void;
  initialZonesData?: CabinetZone[];
}

export default function CabinetFootprintEditor({ onSave, initialZonesData }: CabinetFootprintEditorProps) {
  const [zones, setZones] = useState<CabinetZone[]>(initialZonesData || initialZones);

  const updateZone = (id: string, newZone: Partial<CabinetZone>) => {
    setZones((zones) =>
      zones.map((z) => (z.id === id ? { ...z, ...newZone } : z))
    );
  };

  const addZone = () => {
    const newId = `cabinet-${Date.now()}`;
    const newZone = {
      id: newId,
      x: 0,
      y: 0,
      width: 300,
      depth: 200,
    };
    setZones([...zones, newZone]);
    return newId;
  };

  const removeZone = (id: string) => {
    setZones((zones) => zones.filter(z => z.id !== id));
  };

  return (
    <>
      <color attach="background" args={['#f0f0f0']} />
      <gridHelper args={[1000, 20]} rotation={[Math.PI / 2, 0, 0]} />
      <OrbitControls enableRotate={false} />
      {zones.map((zone) => (
        <Zone 
          key={zone.id} 
          {...zone} 
          onUpdate={(data) => updateZone(zone.id, data)} 
          onRemove={() => removeZone(zone.id)}
        />
      ))}
      
      {/* Add cabinet button */}
      <AddZoneButton onAdd={addZone} />
      
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
}

function Zone({ id, x, y, width, depth, onUpdate, onRemove }: ZoneProps) {
  const handleDrag = (corner: string, dx: number, dy: number) => {
    const updates: Partial<CabinetZone> = { };

    switch (corner) {
      case 'top-left':
        updates.x = x + dx;
        updates.y = y + dy;
        updates.width = width - dx;
        updates.depth = depth - dy;
        break;
      case 'top-right':
        updates.y = y + dy;
        updates.width = width + dx;
        updates.depth = depth - dy;
        break;
      case 'bottom-left':
        updates.x = x + dx;
        updates.width = width - dx;
        updates.depth = depth + dy;
        break;
      case 'bottom-right':
        updates.width = width + dx;
        updates.depth = depth + dy;
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
    <group position={[x + width / 2, y + depth / 2, 0]}>
      {/* Cabinet Plane */}
      <mesh position={[0, 0, 0]} onDoubleClick={() => onRemove()}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color="#add8e6" transparent opacity={0.5} />
      </mesh>

      {/* Border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(width, depth)]} />
        <lineBasicMaterial color="#00bfff" />
      </lineSegments>

      {/* Move handle (centered) */}
      <Handle
        position={[0, 0, 1]}
        color="#4a90e2"
        onDrag={(dx, dy) => handleDrag('move', dx, dy)}
      />

      {/* Resize handles */}
      {[
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

      {/* Label for the cabinet zone */}
      <Label position={[0, 0, 5]} text={id} />
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

function Label({ position, text }: { position: [number, number, number], text: string }) {
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[100, 30]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.2} />
      </mesh>
      <Sprite scale={[80, 20, 1]} position={[0, 0, 2]}>
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

function AddZoneButton({ onAdd }: { onAdd: () => string }) {
  const { camera, viewport } = useThree();
  
  return (
    <group position={[viewport.width / 2 - 100, -viewport.height / 2 + 100, 10]}>
      <mesh onClick={() => onAdd()}>
        <planeGeometry args={[80, 40]} />
        <meshBasicMaterial color="#4CAF50" />
      </mesh>
      <Sprite scale={[60, 30, 1]} position={[0, 0, 1]}>
        <spriteMaterial attach="material" transparent>
          <CanvasTexture text="+ Add Cabinet" />
        </spriteMaterial>
      </Sprite>
    </group>
  );
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