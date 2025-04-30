import type { CabinetSection, UnitType } from "./cabinet-store"

export interface CabinetPreset {
  id: string
  name: string
  category: "base" | "wall" | "tall" | "special"
  thumbnail: string
  description: string
  config: {
    width: number
    height: number
    depth: number
    type: "base" | "wall"
    columns: number
    sections: CabinetSection[]
    materialColor: string
  }
}

// Helper function to create a preset
const createPreset = (
  id: string,
  name: string,
  category: "base" | "wall" | "tall" | "special",
  description: string,
  config: {
    width: number
    height: number
    depth: number
    type: "base" | "wall"
    columns: number
    sections: CabinetSection[]
    materialColor: string
  },
): CabinetPreset => ({
  id,
  name,
  category,
  thumbnail: `/placeholder.svg?height=100&width=100&text=${encodeURIComponent(name)}`,
  description,
  config,
})

// Define cabinet presets
export const cabinetPresets: CabinetPreset[] = [
  // Base Cabinets
  createPreset("base-standard", "Standard Base Cabinet", "base", "Standard base cabinet with a single door", {
    width: 600,
    height: 720,
    depth: 580,
    type: "base",
    columns: 1,
    sections: [],
    materialColor: "#D1D5DB",
  }),
  createPreset("base-double", "Double Door Base Cabinet", "base", "Base cabinet with double doors", {
    width: 800,
    height: 720,
    depth: 580,
    type: "base",
    columns: 2,
    sections: [],
    materialColor: "#D1D5DB",
  }),
  createPreset("base-drawer", "Single Drawer Base Cabinet", "base", "Base cabinet with a drawer and door", {
    width: 600,
    height: 720,
    depth: 580,
    type: "base",
    columns: 1,
    sections: [
      { type: "drawer", height: 150 },
      { type: "door", height: 570 },
    ],
    materialColor: "#D1D5DB",
  }),
  createPreset("base-drawers", "Three Drawer Base Cabinet", "base", "Base cabinet with three drawers", {
    width: 600,
    height: 720,
    depth: 580,
    type: "base",
    columns: 1,
    sections: [
      { type: "drawer", height: 150 },
      { type: "drawer", height: 200 },
      { type: "drawer", height: 370 },
    ],
    materialColor: "#D1D5DB",
  }),
  createPreset("base-sink", "Sink Base Cabinet", "base", "Base cabinet designed for a sink", {
    width: 800,
    height: 720,
    depth: 580,
    type: "base",
    columns: 2,
    sections: [],
    materialColor: "#D1D5DB",
  }),
  createPreset("base-corner", "Corner Base Cabinet", "base", "L-shaped corner base cabinet", {
    width: 900,
    height: 720,
    depth: 580,
    type: "base",
    columns: 1,
    sections: [],
    materialColor: "#D1D5DB",
  }),

  // Wall Cabinets
  createPreset("wall-standard", "Standard Wall Cabinet", "wall", "Standard wall cabinet with a single door", {
    width: 600,
    height: 720,
    depth: 300,
    type: "wall",
    columns: 1,
    sections: [],
    materialColor: "#D1D5DB",
  }),
  createPreset("wall-double", "Double Door Wall Cabinet", "wall", "Wall cabinet with double doors", {
    width: 800,
    height: 720,
    depth: 300,
    type: "wall",
    columns: 2,
    sections: [],
    materialColor: "#D1D5DB",
  }),
  createPreset("wall-tall", "Tall Wall Cabinet", "wall", "Tall wall cabinet for maximum storage", {
    width: 600,
    height: 900,
    depth: 300,
    type: "wall",
    columns: 1,
    sections: [],
    materialColor: "#D1D5DB",
  }),
  createPreset("wall-corner", "Corner Wall Cabinet", "wall", "L-shaped corner wall cabinet", {
    width: 600,
    height: 720,
    depth: 300,
    type: "wall",
    columns: 1,
    sections: [],
    materialColor: "#D1D5DB",
  }),

  // Tall Cabinets
  createPreset("tall-pantry", "Pantry Cabinet", "tall", "Full-height pantry cabinet", {
    width: 600,
    height: 2100,
    depth: 580,
    type: "base",
    columns: 1,
    sections: [
      { type: "door", height: 900 },
      { type: "door", height: 1200 },
    ],
    materialColor: "#D1D5DB",
  }),
  createPreset("tall-utility", "Utility Cabinet", "tall", "Full-height utility cabinet with multiple sections", {
    width: 600,
    height: 2100,
    depth: 580,
    type: "base",
    columns: 1,
    sections: [
      { type: "drawer", height: 150 },
      { type: "drawer", height: 150 },
      { type: "door", height: 900 },
      { type: "door", height: 900 },
    ],
    materialColor: "#D1D5DB",
  }),
  createPreset("tall-oven", "Oven Housing", "tall", "Cabinet designed for built-in oven", {
    width: 600,
    height: 2100,
    depth: 580,
    type: "base",
    columns: 1,
    sections: [
      { type: "drawer", height: 150 },
      { type: "door", height: 720 }, // Oven space
      { type: "door", height: 1230 },
    ],
    materialColor: "#D1D5DB",
  }),

  // Special Cabinets
  createPreset("special-island", "Kitchen Island Cabinet", "special", "Island cabinet with drawers on both sides", {
    width: 1200,
    height: 900,
    depth: 650,
    type: "base",
    columns: 1,
    sections: [
      { type: "drawer", height: 150 },
      { type: "drawer", height: 200 },
      { type: "drawer", height: 550 },
    ],
    materialColor: "#D1D5DB",
  }),
  createPreset("special-appliance", "Appliance Housing", "special", "Cabinet for housing integrated appliances", {
    width: 600,
    height: 720,
    depth: 580,
    type: "base",
    columns: 1,
    sections: [],
    materialColor: "#D1D5DB",
  }),
]

// Function to convert dimensions based on unit type
export const convertPresetDimensions = (preset: CabinetPreset, targetUnit: UnitType): CabinetPreset => {
  if (targetUnit === "mm") {
    return preset
  }

  // Convert mm to inches
  const mmToInches = (mm: number) => mm / 25.4

  const convertedConfig = {
    ...preset.config,
    width: mmToInches(preset.config.width),
    height: mmToInches(preset.config.height),
    depth: mmToInches(preset.config.depth),
    sections: preset.config.sections.map((section) => ({
      ...section,
      height: mmToInches(section.height),
    })),
  }

  return {
    ...preset,
    config: convertedConfig,
  }
}

// Get presets by category
export const getPresetsByCategory = (category: "base" | "wall" | "tall" | "special"): CabinetPreset[] => {
  return cabinetPresets.filter((preset) => preset.category === category)
}

// Get all categories
export const getAllCategories = (): ("base" | "wall" | "tall" | "special")[] => {
  return ["base", "wall", "tall", "special"]
}

// Get preset by ID
export const getPresetById = (id: string): CabinetPreset | undefined => {
  return cabinetPresets.find((preset) => preset.id === id)
}
