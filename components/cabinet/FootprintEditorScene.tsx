import React from 'react';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import CabinetFootprintEditor, { CabinetZone } from './CabinetFootprintEditor';
import { useCabinetStore } from '@/store/cabinet-store';
import { useToast } from '@/hooks/use-toast';

interface FootprintEditorSceneProps {
  onExit: () => void;
}

export default function FootprintEditorScene({ onExit }: FootprintEditorSceneProps) {
  const { toast } = useToast();
  const { addCabinet } = useCabinetStore();

  const handleSave = (zones: CabinetZone[]) => {
    // Convert 2D zones to 3D cabinets
    zones.forEach(zone => {
      // Calculate position based on rotation
      const rotation = zone.rotation || 0;
      
      // Convert footprint coordinates to 3D position
      // Assuming Y is up in 3D space and Z is depth
      const position: [number, number, number] = [
        zone.x + zone.width / 2, // Center X
        0, // Ground level (base cabinets) or higher (wall cabinets)
        zone.y + zone.depth / 2, // Center Z
      ];
      
      // For wall cabinets, set a higher Y position
      if (zone.type === 'wall') {
        position[1] = 720; // Typical base cabinet height
      }
      
      // Add a new cabinet at the position with the given dimensions
      // and set the type (base or wall)
      addCabinet(
        position, 
        zone.width, 
        zone.depth, 
        zone.type,
        Math.round(rotation * 180 / Math.PI) // Convert rotation to degrees
      );
    });
    
    toast({
      title: "Footprints converted",
      description: `${zones.length} cabinet footprints added to the scene`,
    });
    
    onExit();
  };

  return (
    <div className="w-full h-full">
      <div className="absolute top-4 left-4 z-20 flex gap-2 bg-white p-2 rounded-md shadow-md">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={onExit}
        >
          Exit 2D Mode
        </button>
        <div className="text-sm my-auto">Double-click a cabinet to remove it</div>
      </div>
      
      <div className="absolute top-4 right-4 z-20 bg-white p-2 rounded-md shadow-md">
        <div className="text-sm">
          <p className="font-bold">Controls:</p>
          <p>• Click the "Add..." button to create a cabinet</p>
          <p>• Toggle Rotation mode to rotate cabinets</p>
          <p>• Drag blue handles to resize</p>
          <p>• Drag center handle to move</p>
          <p>• Blue cabinets = Wall cabinets</p>
          <p>• Light blue cabinets = Base cabinets</p>
        </div>
      </div>
      
      <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 100] }}>
        <Suspense fallback={null}>
          <CabinetFootprintEditor onSave={handleSave} />
        </Suspense>
      </Canvas>
    </div>
  );
} 