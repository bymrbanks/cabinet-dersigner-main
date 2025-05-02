import { MutableRefObject } from 'react'

export interface Footprint {
  id: string
  position: [number, number, number]  // World position (for Three.js)
  gridPosition?: [number, number, number]  // Grid position (where 0,0 is the edge)
  width: number
  depth: number
  height: number  // Height of the footprint
  color?: string
  selected?: boolean
  visible?: boolean  // Whether the footprint is visible
  compartmentWidthThreshold?: number // The width threshold for creating new compartments
}

export type DragState = {
  isDragging: boolean;
  startPosition: [number, number, number] | null;
  currentFootprint: string | null;
  isDuplicate: boolean;
}

export type ResizeState = {
  isResizing: boolean;
  corner: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "top" | null;
  startPosition: [number, number, number] | null;
  startDimensions: { width: number; depth: number; height: number } | null;
  startBoxPosition: [number, number, number] | null;
  currentFootprint: string | null;
}

export type FootprintState = {
  footprints: Footprint[];
  selectedFootprint: string | null;
  dragState: DragState;
  resizeState: ResizeState;
}

export type FootprintActions = {
  addFootprint: (position: [number, number, number], template?: Partial<Footprint>) => string;
  deleteFootprint: (id: string) => void;
  selectFootprint: (id: string | null) => void;
  updateFootprint: (id: string, updates: Partial<Footprint>) => void;
  startDrag: (e: any, id: string, isDuplicate?: boolean) => void;
  startResize: (e: any, id: string, corner: ResizeState['corner']) => void;
  handlePointerMove: (e: any) => void;
  handlePointerUp: (e: any) => void;
}

export type FootprintManagerProps = {
  orbitControlsRef: MutableRefObject<any>;
  toolMode: string;
  setCursor: (cursor: string) => void;
  footprints: Footprint[];
  selectedFootprint: string | null;
  onFootprintsChange: (footprints: Footprint[]) => void;
  onSelectFootprint: (id: string | null) => void;
  defaultHeight?: number;
} 