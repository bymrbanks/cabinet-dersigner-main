import { MutableRefObject } from 'react'

export interface Footprint {
  id: string
  position: [number, number, number]
  width: number
  depth: number
  color?: string
  selected?: boolean
}

export type DragState = {
  isDragging: boolean;
  startPosition: [number, number, number] | null;
  currentFootprint: string | null;
  isDuplicate: boolean;
}

export type ResizeState = {
  isResizing: boolean;
  corner: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | null;
  startPosition: [number, number, number] | null;
  startDimensions: { width: number; depth: number } | null;
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
} 