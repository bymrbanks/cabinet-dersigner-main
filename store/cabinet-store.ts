import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"

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
}

export interface Cabinet {
  id: string
  position: [number, number, number]
  width: number
  height: number
  depth: number
  type: "base" | "wall"
  compartments: CabinetCompartment[]
  materialColor: string
  defaultHandleConfig: HandleConfig
}

interface CabinetStoreState {
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
  addCabinet: (position?: [number, number, number]) => void
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

// Default handle configuration
const defaultHandleConfig: HandleConfig = {
  style: "bar",
  orientation: "vertical",
  size: 100, // 100mm
  position: 50, // Centered (50%)
  color: "#888888",
}

export const useCabinetStore = create<CabinetStoreState>()((set, get) => ({
  // Unit settings
  units: "mm",
  setUnits: (units) => set({ units }),
  convertToCurrentUnit: (value) => {
    if (get().units === "mm") return value
    return value / 25.4 // Convert mm to inches
  },
  convertFromCurrentUnit: (value) => {
    if (get().units === "mm") return value
    return value * 25.4 // Convert inches to mm
  },

  // Cabinet state
  cabinets: [
    {
      id: `cabinet-${uuidv4()}`,
      position: [0, 0, 0],
      width: 600,
      height: 720,
      depth: 580,
      type: "base",
      compartments: [
        {
          sections: [],
        },
      ],
      materialColor: "#D1D5DB",
      defaultHandleConfig: { ...defaultHandleConfig },
    },
  ],
  activeCabinetId: null,
  selectedPart: null,

  // Open/close state for doors and drawers
  openParts: {},
  isPartOpen: (partId) => !!get().openParts[partId],
  toggleOpenState: (partId) => {
    set((state) => ({
      openParts: {
        ...state.openParts,
        [partId]: !state.openParts[partId],
      },
    }))
    get().saveToHistory()
  },
  toggleAllOpenState: (isOpen) => {
    const openParts: Record<string, boolean> = {}

    // Find all door and drawer parts
    get().cabinets.forEach((cabinet) => {
      cabinet.compartments.forEach((compartment, compartmentIndex) => {
        compartment.sections.forEach((section, sectionIndex) => {
          const partId = `${cabinet.id}-compartment-${compartmentIndex}-${section.type}-${sectionIndex}`
          openParts[partId] = isOpen
        })
      })
    })

    set({ openParts })
    get().saveToHistory()
  },

  // Cabinet operations
  addCabinet: (position = [0, 0, 0]) => {
    const newCabinet: Cabinet = {
      id: `cabinet-${uuidv4()}`,
      position,
      width: 600,
      height: 720,
      depth: 580,
      type: "base",
      compartments: [
        {
          sections: [],
        },
      ],
      materialColor: "#D1D5DB",
      defaultHandleConfig: { ...defaultHandleConfig },
    }

    set((state) => ({
      cabinets: [...state.cabinets, newCabinet],
      activeCabinetId: newCabinet.id,
      selectedPart: newCabinet.id,
    }))

    get().saveToHistory()
  },
  removeCabinet: (id) => {
    const cabinets = get().cabinets.filter((cabinet) => cabinet.id !== id)

    // Ensure there's always at least one cabinet
    if (cabinets.length === 0) {
      cabinets.push({
        id: `cabinet-${uuidv4()}`,
        position: [0, 0, 0],
        width: 600,
        height: 720,
        depth: 580,
        type: "base",
        compartments: [
          {
            sections: [],
          },
        ],
        materialColor: "#D1D5DB",
        defaultHandleConfig: { ...defaultHandleConfig },
      })
    }

    set({
      cabinets,
      activeCabinetId: cabinets[0].id,
      selectedPart: cabinets[0].id,
    })

    get().saveToHistory()
  },
  duplicateCabinet: (id) => {
    const cabinet = get().cabinets.find((c) => c.id === id)
    if (!cabinet) return

    const newCabinet: Cabinet = {
      ...JSON.parse(JSON.stringify(cabinet)),
      id: `cabinet-${uuidv4()}`,
      position: [cabinet.position[0] + 1, cabinet.position[1], cabinet.position[2]],
    }

    set((state) => ({
      cabinets: [...state.cabinets, newCabinet],
      activeCabinetId: newCabinet.id,
      selectedPart: newCabinet.id,
    }))

    get().saveToHistory()
  },
  moveCabinet: (id, position) => {
    set((state) => ({
      cabinets: state.cabinets.map((c) => (c.id === id ? { ...c, position } : c)),
    }))

    // We don't save to history here as this is called during dragging
  },
  setActiveCabinet: (id) => set({ activeCabinetId: id }),
  setSelectedPart: (id) => set({ selectedPart: id }),

  // Active cabinet getters
  getWidth: () => {
    const { cabinets, activeCabinetId } = get()
    const cabinet = cabinets.find((c) => c.id === activeCabinetId)
    return cabinet?.width || 600
  },
  getHeight: () => {
    const { cabinets, activeCabinetId } = get()
    const cabinet = cabinets.find((c) => c.id === activeCabinetId)
    return cabinet?.height || 720
  },
  getDepth: () => {
    const { cabinets, activeCabinetId } = get()
    const cabinet = cabinets.find((c) => c.id === activeCabinetId)
    return cabinet?.depth || 580
  },
  getType: () => {
    const { cabinets, activeCabinetId } = get()
    const cabinet = cabinets.find((c) => c.id === activeCabinetId)
    return cabinet?.type || "base"
  },
  getCompartments: () => {
    const { cabinets, activeCabinetId } = get()
    const cabinet = cabinets.find((c) => c.id === activeCabinetId)
    return cabinet?.compartments || []
  },
  getMaterialColor: () => {
    const { cabinets, activeCabinetId } = get()
    const cabinet = cabinets.find((c) => c.id === activeCabinetId)
    return cabinet?.materialColor || "#D1D5DB"
  },
  getDefaultHandleConfig: () => {
    const { cabinets, activeCabinetId } = get()
    const cabinet = cabinets.find((c) => c.id === activeCabinetId)
    return cabinet?.defaultHandleConfig || { ...defaultHandleConfig }
  },

  // Active cabinet setters
  setWidth: (width) => {
    const { cabinets, activeCabinetId, compartmentWidthThreshold } = get()

    // Apply constraints
    width = Math.max(get().minWidth, Math.min(get().maxWidth, width))

    set({
      cabinets: cabinets.map((c) => {
        if (c.id === activeCabinetId) {
          // Calculate how many compartments based on width
          const compartmentCount = Math.max(1, Math.floor(width / compartmentWidthThreshold))

          // Create compartments if needed
          let compartments = [...c.compartments]

          if (compartmentCount > compartments.length) {
            // Add new compartments
            for (let i = compartments.length; i < compartmentCount; i++) {
              compartments.push({ sections: [] })
            }
          } else if (compartmentCount < compartments.length) {
            // Remove excess compartments
            compartments = compartments.slice(0, compartmentCount)
          }

          return { ...c, width, compartments }
        }
        return c
      }),
    })

    get().saveToHistory()
  },
  setHeight: (height) => {
    const { cabinets, activeCabinetId } = get()

    // Apply constraints
    height = Math.max(get().minHeight, Math.min(get().maxHeight, height))

    set({
      cabinets: cabinets.map((c) => (c.id === activeCabinetId ? { ...c, height } : c)),
    })

    get().saveToHistory()
  },
  setDepth: (depth) => {
    const { cabinets, activeCabinetId } = get()

    // Apply constraints
    depth = Math.max(get().minDepth, Math.min(get().maxDepth, depth))

    set({
      cabinets: cabinets.map((c) => (c.id === activeCabinetId ? { ...c, depth } : c)),
    })

    get().saveToHistory()
  },
  setType: (type) => {
    const { cabinets, activeCabinetId } = get()
    set({
      cabinets: cabinets.map((c) => (c.id === activeCabinetId ? { ...c, type } : c)),
    })

    get().saveToHistory()
  },
  setColumns: (columns) => {
    const { cabinets, activeCabinetId } = get()

    // Ensure columns is at least 1
    columns = Math.max(1, columns)

    set({
      cabinets: cabinets.map((c) => {
        if (c.id === activeCabinetId) {
          // Create compartments array based on columns
          const compartments = []
          for (let i = 0; i < columns; i++) {
            // Copy existing compartment if available, otherwise create new
            compartments.push(c.compartments[i] || { sections: [] })
          }
          return { ...c, compartments }
        }
        return c
      }),
    })

    get().saveToHistory()
  },
  setSections: (sections) => {
    const { cabinets, activeCabinetId } = get()
    set({
      cabinets: cabinets.map((c) => {
        if (c.id === activeCabinetId && c.compartments.length > 0) {
          const updatedCompartments = [...c.compartments]
          updatedCompartments[0] = { sections }
          return { ...c, compartments: updatedCompartments }
        }
        return c
      }),
    })

    get().saveToHistory()
  },
  setMaterialColor: (color) => {
    const { cabinets, activeCabinetId } = get()
    set({
      cabinets: cabinets.map((c) => (c.id === activeCabinetId ? { ...c, materialColor: color } : c)),
    })

    get().saveToHistory()
  },
  setDefaultHandleConfig: (config) => {
    const { cabinets, activeCabinetId } = get()
    set({
      cabinets: cabinets.map((c) => {
        if (c.id === activeCabinetId) {
          return {
            ...c,
            defaultHandleConfig: {
              ...c.defaultHandleConfig,
              ...config,
            },
          }
        }
        return c
      }),
    })

    get().saveToHistory()
  },

  // Section operations
  addSection: (section) => {
    const { cabinets, activeCabinetId } = get()
    const defaultHandle = get().getDefaultHandleConfig()

    // Add default handle to the section if it's not specified
    const sectionWithHandle = {
      ...section,
      handle: section.handle || { ...defaultHandle },
    }

    set({
      cabinets: cabinets.map((c) => {
        if (c.id === activeCabinetId && c.compartments.length > 0) {
          const updatedCompartments = [...c.compartments]
          updatedCompartments[0] = {
            sections: [...updatedCompartments[0].sections, sectionWithHandle],
          }
          return { ...c, compartments: updatedCompartments }
        }
        return c
      }),
    })

    get().saveToHistory()
  },
  addSectionAfter: (sectionIndex) => {
    const { cabinets, activeCabinetId } = get()
    const defaultHandle = get().getDefaultHandleConfig()

    set({
      cabinets: cabinets.map((c) => {
        if (c.id === activeCabinetId && c.compartments.length > 0) {
          const updatedCompartments = [...c.compartments]
          const newSections = [...updatedCompartments[0].sections]
          newSections.splice(sectionIndex + 1, 0, {
            type: "door",
            height: 200,
            hingePosition: "left", // Default hinge position
            handle: { ...defaultHandle }, // Default handle
          })
          updatedCompartments[0] = { sections: newSections }
          return { ...c, compartments: updatedCompartments }
        }
        return c
      }),
    })

    get().saveToHistory()
  },
  addSectionToCompartment: (compartmentIndex) => {
    const { cabinets, activeCabinetId } = get()
    const defaultHandle = get().getDefaultHandleConfig()

    set({
      cabinets: cabinets.map((c) => {
        if (c.id === activeCabinetId) {
          const updatedCompartments = [...c.compartments]
          if (updatedCompartments[compartmentIndex]) {
            updatedCompartments[compartmentIndex] = {
              sections: [
                ...updatedCompartments[compartmentIndex].sections,
                {
                  type: "door",
                  height: 200,
                  hingePosition: "left", // Default hinge position
                  handle: { ...defaultHandle }, // Default handle
                },
              ],
            }
          }
          return { ...c, compartments: updatedCompartments }
        }
        return c
      }),
    })

    get().saveToHistory()
  },
  removeSectionFromCompartment: (compartmentIndex, sectionIndex) => {
    const { cabinets, activeCabinetId } = get()
    set({
      cabinets: cabinets.map((c) => {
        if (c.id === activeCabinetId) {
          const updatedCompartments = [...c.compartments]
          if (updatedCompartments[compartmentIndex]) {
            const newSections = [...updatedCompartments[compartmentIndex].sections]
            newSections.splice(sectionIndex, 1)
            updatedCompartments[compartmentIndex] = { sections: newSections }
          }
          return { ...c, compartments: updatedCompartments }
        }
        return c
      }),
    })

    get().saveToHistory()
  },
  updateSectionHeight: (compartmentIndex, sectionIndex, height) => {
    // Convert from display unit if needed
    height = get().convertFromCurrentUnit(height)

    // Apply constraints
    height = Math.max(get().minSectionHeight, height)

    const { cabinets, activeCabinetId } = get()
    set({
      cabinets: cabinets.map((c) => {
        if (c.id === activeCabinetId) {
          const updatedCompartments = [...c.compartments]
          if (updatedCompartments[compartmentIndex] && updatedCompartments[compartmentIndex].sections[sectionIndex]) {
            const newSections = [...updatedCompartments[compartmentIndex].sections]
            newSections[sectionIndex] = {
              ...newSections[sectionIndex],
              height,
            }
            updatedCompartments[compartmentIndex] = { sections: newSections }
          }
          return { ...c, compartments: updatedCompartments }
        }
        return c
      }),
    })

    get().saveToHistory()
  },
  updateSectionType: (compartmentIndex, sectionIndex, type) => {
    const { cabinets, activeCabinetId } = get()
    set({
      cabinets: cabinets.map((c) => {
        if (c.id === activeCabinetId) {
          const updatedCompartments = [...c.compartments]
          if (updatedCompartments[compartmentIndex] && updatedCompartments[compartmentIndex].sections[sectionIndex]) {
            const newSections = [...updatedCompartments[compartmentIndex].sections]
            // Keep hingePosition if it's a door, remove if it's a drawer
            if (type === "door") {
              newSections[sectionIndex] = {
                ...newSections[sectionIndex],
                type,
                hingePosition: newSections[sectionIndex].hingePosition || "left",
              }
            } else {
              // For drawer, remove hingePosition but keep handle
              const { hingePosition, ...rest } = newSections[sectionIndex]
              newSections[sectionIndex] = {
                ...rest,
                type,
              }

              // Update handle orientation for drawer if it's vertical
              if (newSections[sectionIndex].handle?.orientation === "vertical") {
                newSections[sectionIndex].handle = {
                  ...newSections[sectionIndex].handle,
                  orientation: "horizontal",
                }
              }
            }
            updatedCompartments[compartmentIndex] = { sections: newSections }
          }
          return { ...c, compartments: updatedCompartments }
        }
        return c
      }),
    })

    get().saveToHistory()
  },
  updateSectionHingePosition: (compartmentIndex, sectionIndex, hingePosition) => {
    const { cabinets, activeCabinetId } = get()
    set({
      cabinets: cabinets.map((c) => {
        if (c.id === activeCabinetId) {
          const updatedCompartments = [...c.compartments]
          if (updatedCompartments[compartmentIndex] && updatedCompartments[compartmentIndex].sections[sectionIndex]) {
            const newSections = [...updatedCompartments[compartmentIndex].sections]
            // Only update if it's a door
            if (newSections[sectionIndex].type === "door") {
              newSections[sectionIndex] = {
                ...newSections[sectionIndex],
                hingePosition,
              }
              updatedCompartments[compartmentIndex] = { sections: newSections }
            }
          }
          return { ...c, compartments: updatedCompartments }
        }
        return c
      }),
    })

    get().saveToHistory()
  },
  updateSectionHandle: (compartmentIndex, sectionIndex, handleConfig) => {
    const { cabinets, activeCabinetId } = get()
    set({
      cabinets: cabinets.map((c) => {
        if (c.id === activeCabinetId) {
          const updatedCompartments = [...c.compartments]
          if (updatedCompartments[compartmentIndex] && updatedCompartments[compartmentIndex].sections[sectionIndex]) {
            const newSections = [...updatedCompartments[compartmentIndex].sections]
            const currentHandle = newSections[sectionIndex].handle || { ...defaultHandleConfig }

            newSections[sectionIndex] = {
              ...newSections[sectionIndex],
              handle: {
                ...currentHandle,
                ...handleConfig,
              },
            }
            updatedCompartments[compartmentIndex] = { sections: newSections }
          }
          return { ...c, compartments: updatedCompartments }
        }
        return c
      }),
    })

    get().saveToHistory()
  },
  getSectionIndexFromId: (id) => {
    // Expected format: cabinet-UUID-compartment-0-door/drawer-0
    const parts = id.split("-")
    const type = parts.includes("door") ? "door" : parts.includes("drawer") ? "drawer" : null

    if (!type) return null

    const typeIndex = parts.indexOf(type)
    if (typeIndex < 0) return null

    const compartmentKeyword = "compartment"
    const compartmentIndex = parts.indexOf(compartmentKeyword)

    if (compartmentIndex < 0 || compartmentIndex + 1 >= parts.length) return null

    try {
      return {
        compartmentIndex: Number.parseInt(parts[compartmentIndex + 1]),
        sectionIndex: Number.parseInt(parts[typeIndex + 1]),
      }
    } catch (error) {
      console.error("Error parsing section index from ID:", error)
      return null
    }
  },
  getSectionHingePosition: (compartmentIndex, sectionIndex) => {
    const { cabinets, activeCabinetId } = get()
    const cabinet = cabinets.find((c) => c.id === activeCabinetId)
    if (!cabinet) return "left" // Default

    const compartment = cabinet.compartments[compartmentIndex]
    if (!compartment) return "left" // Default

    const section = compartment.sections[sectionIndex]
    if (!section || section.type !== "door") return "left" // Default

    return section.hingePosition || "left"
  },
  getSectionHandle: (compartmentIndex, sectionIndex) => {
    const { cabinets, activeCabinetId } = get()
    const cabinet = cabinets.find((c) => c.id === activeCabinetId)
    if (!cabinet) return { ...defaultHandleConfig } // Default

    const compartment = cabinet.compartments[compartmentIndex]
    if (!compartment) return { ...defaultHandleConfig } // Default

    const section = compartment.sections[sectionIndex]
    if (!section) return { ...defaultHandleConfig } // Default

    return section.handle || { ...defaultHandleConfig }
  },
  resetSectionHandleToDefault: (compartmentIndex, sectionIndex) => {
    const { cabinets, activeCabinetId } = get()
    const defaultHandle = get().getDefaultHandleConfig()

    set({
      cabinets: cabinets.map((c) => {
        if (c.id === activeCabinetId) {
          const updatedCompartments = [...c.compartments]
          if (updatedCompartments[compartmentIndex] && updatedCompartments[compartmentIndex].sections[sectionIndex]) {
            const newSections = [...updatedCompartments[compartmentIndex].sections]
            newSections[sectionIndex] = {
              ...newSections[sectionIndex],
              handle: { ...defaultHandle },
            }
            updatedCompartments[compartmentIndex] = { sections: newSections }
          }
          return { ...c, compartments: updatedCompartments }
        }
        return c
      }),
    })

    get().saveToHistory()
  },
  applyDefaultHandleToAll: () => {
    const { cabinets, activeCabinetId } = get()
    const defaultHandle = get().getDefaultHandleConfig()

    set({
      cabinets: cabinets.map((c) => {
        if (c.id === activeCabinetId) {
          const updatedCompartments = c.compartments.map((compartment) => {
            const updatedSections = compartment.sections.map((section) => ({
              ...section,
              handle: { ...defaultHandle },
            }))
            return { ...compartment, sections: updatedSections }
          })
          return { ...c, compartments: updatedCompartments }
        }
        return c
      }),
    })

    get().saveToHistory()
  },

  // Handle operations
  getHandleById: (id) => {
    const indices = get().getSectionIndexFromId(id)
    if (!indices) return null

    const { compartmentIndex, sectionIndex } = indices
    return get().getSectionHandle(compartmentIndex, sectionIndex)
  },
  updateHandleById: (id, handleConfig) => {
    const indices = get().getSectionIndexFromId(id)
    if (!indices) return

    const { compartmentIndex, sectionIndex } = indices
    get().updateSectionHandle(compartmentIndex, sectionIndex, handleConfig)
  },

  // Display settings
  showDimensionLines: true,
  gridVisible: true,
  gridSize: 1,
  gridColor: "#CCCCCC",
  snapToGrid: true,
  setShowDimensionLines: (show) => set({ showDimensionLines: show }),
  setGridVisible: (visible) => set({ gridVisible: visible }),
  setGridSize: (size) => set({ gridSize: size }),
  setGridColor: (color) => set({ gridColor: color }),
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),

  // Constraints
  minWidth: 300, // 300mm
  maxWidth: 1200, // 1200mm
  minHeight: 300, // 300mm
  maxHeight: 2400, // 2400mm
  minDepth: 200, // 200mm
  maxDepth: 800, // 800mm
  minSectionHeight: 100, // 100mm
  compartmentWidthThreshold: 600, // 600mm
  setMinWidth: (width) => set({ minWidth: width }),
  setMaxWidth: (width) => set({ maxWidth: width }),
  setMinHeight: (height) => set({ minHeight: height }),
  setMaxHeight: (height) => set({ maxHeight: height }),
  setMinDepth: (depth) => set({ minDepth: depth }),
  setMaxDepth: (depth) => set({ maxDepth: depth }),
  setMinSectionHeight: (height) => set({ minSectionHeight: height }),
  setCompartmentWidthThreshold: (width) => set({ compartmentWidthThreshold: width }),

  // History
  history: [],
  currentHistoryIndex: -1,
  saveToHistory: () => {
    const currentState = {
      cabinets: JSON.parse(JSON.stringify(get().cabinets)),
      units: get().units,
      openParts: JSON.parse(JSON.stringify(get().openParts)),
    }

    // Truncate future history if we're not at the end
    const newHistory = [...get().history.slice(0, get().currentHistoryIndex + 1), currentState]

    // Limit history length to prevent memory issues
    const maxHistoryLength = 50
    if (newHistory.length > maxHistoryLength) {
      newHistory.shift()
    }

    set({
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1,
    })
  },
  undo: () => {
    const { history, currentHistoryIndex } = get()
    if (currentHistoryIndex > 0) {
      const previousState = history[currentHistoryIndex - 1]
      set({
        cabinets: JSON.parse(JSON.stringify(previousState.cabinets)),
        units: previousState.units,
        openParts: JSON.parse(JSON.stringify(previousState.openParts)),
        currentHistoryIndex: currentHistoryIndex - 1,
      })
    }
  },
  redo: () => {
    const { history, currentHistoryIndex } = get()
    if (currentHistoryIndex < history.length - 1) {
      const nextState = history[currentHistoryIndex + 1]
      set({
        cabinets: JSON.parse(JSON.stringify(nextState.cabinets)),
        units: nextState.units,
        openParts: JSON.parse(JSON.stringify(nextState.openParts)),
        currentHistoryIndex: currentHistoryIndex + 1,
      })
    }
  },
  canUndo: () => get().currentHistoryIndex > 0,
  canRedo: () => get().currentHistoryIndex < get().history.length - 1,
}))
