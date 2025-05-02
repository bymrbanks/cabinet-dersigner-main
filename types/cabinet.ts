export type UnitType = "mm" | "inches"
export type HingePosition = "left" | "right"
export type HandleStyle = "bar" | "knob" | "cup" | "edge" | "none"
export type HandleOrientation = "horizontal" | "vertical"

export interface HandleConfig {
  style: HandleStyle
  orientation: HandleOrientation
  size: number // Size in mm
  position: number // Position as percentage (0-100) from top/left
  color: string
}

export interface CabinetSection {
  type: "door" | "drawer"
  height: number
  hingePosition?: HingePosition
  handle?: HandleConfig
}

export interface CabinetCompartment {
  sections: CabinetSection[]
  shelves: number[] // Heights (percentage) where shelves are positioned
}

export interface Cabinet {
  id: string
  position: [number, number, number]
  width: number
  height: number
  depth: number
  type: "base" | "wall"
  rotation?: number // Rotation in degrees for L-shaped layouts
  compartments: CabinetCompartment[]
  materialColor: string
  defaultHandleConfig: HandleConfig
}

export interface CabinetStoreState {
  // Unit settings
  units: UnitType
  setUnits: (units: UnitType) => void
  convertToCurrentUnit: (value: number) => number
  convertFromCurrentUnit: (value: number) => number

  // Cabinet state
  cabinets: Cabinet[]
  activeCabinetId: string | null
  selectedPart: string | null

  // Open/close state for doors and drawers
  openParts: Record<string, boolean>
  isPartOpen: (partId: string) => boolean
  toggleOpenState: (partId: string) => void
  toggleAllOpenState: (isOpen: boolean) => void

  // Cabinet operations
  addCabinet: (
    position?: [number, number, number], 
    width?: number, 
    depth?: number, 
    type?: "base" | "wall",
    rotationDegrees?: number
  ) => void
  removeCabinet: (id: string) => void
  duplicateCabinet: (id: string) => void
  moveCabinet: (id: string, position: [number, number, number]) => void
  setActiveCabinet: (id: string | null) => void
  setSelectedPart: (id: string | null) => void

  // Active cabinet getters
  getWidth: () => number
  getHeight: () => number
  getDepth: () => number
  getType: () => "base" | "wall"
  getCompartments: () => CabinetCompartment[]
  getMaterialColor: () => string
  getDefaultHandleConfig: () => HandleConfig

  // Active cabinet setters
  setWidth: (width: number) => void
  setHeight: (height: number) => void
  setDepth: (depth: number) => void
  setType: (type: "base" | "wall") => void
  setColumns: (columns: number) => void
  setSections: (sections: CabinetSection[]) => void
  setMaterialColor: (color: string) => void
  setDefaultHandleConfig: (config: Partial<HandleConfig>) => void

  // Section operations
  addSection: (section: CabinetSection) => void
  addSectionAfter: (sectionIndex: number) => void
  addSectionToCompartment: (compartmentIndex: number) => void
  removeSectionFromCompartment: (compartmentIndex: number, sectionIndex: number) => void
  updateSectionHeight: (compartmentIndex: number, sectionIndex: number, height: number) => void
  updateSectionType: (compartmentIndex: number, sectionIndex: number, type: "door" | "drawer") => void
  updateSectionHingePosition: (compartmentIndex: number, sectionIndex: number, hingePosition: HingePosition) => void
  updateSectionHandle: (compartmentIndex: number, sectionIndex: number, handleConfig: Partial<HandleConfig>) => void
  getSectionIndexFromId: (id: string) => { compartmentIndex: number; sectionIndex: number } | null
  getSectionHingePosition: (compartmentIndex: number, sectionIndex: number) => HingePosition
  getSectionHandle: (compartmentIndex: number, sectionIndex: number) => HandleConfig
  resetSectionHandleToDefault: (compartmentIndex: number, sectionIndex: number) => void
  applyDefaultHandleToAll: () => void

  // Shelf operations
  addShelf: (compartmentIndex: number, position?: number) => void
  removeShelf: (compartmentIndex: number, shelfIndex: number) => void
  updateShelfPosition: (compartmentIndex: number, shelfIndex: number, position: number) => void
  
  // Handle operations
  getHandleById: (id: string) => HandleConfig | null
  updateHandleById: (id: string, handleConfig: Partial<HandleConfig>) => void

  // Display settings
  showDimensionLines: boolean
  gridVisible: boolean
  gridSize: number
  gridColor: string
  snapToGrid: boolean
  setShowDimensionLines: (show: boolean) => void
  setGridVisible: (visible: boolean) => void
  setGridSize: (size: number) => void
  setGridColor: (color: string) => void
  setSnapToGrid: (snap: boolean) => void

  // Constraints
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
  minDepth: number
  maxDepth: number
  minSectionHeight: number
  compartmentWidthThreshold: number
  setMinWidth: (width: number) => void
  setMaxWidth: (width: number) => void
  setMinHeight: (height: number) => void
  setMaxHeight: (height: number) => void
  setMinDepth: (depth: number) => void
  setMaxDepth: (depth: number) => void
  setMinSectionHeight: (height: number) => void
  setCompartmentWidthThreshold: (width: number) => void

  // History
  history: any[]
  currentHistoryIndex: number
  saveToHistory: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
} 