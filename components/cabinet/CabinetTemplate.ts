import { Footprint } from "../footprint/types";

export interface CompartmentConfig {
  sections: SectionConfig[];
}

export interface SectionConfig {
  type: "drawer" | "door";
  height: number;
  offsetY?: number;
}

export interface CabinetTemplate {
  name: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultDepth: number;
  color: string;
  compartmentWidthThreshold: number;
}

// Basic cabinet carcass template
export const cabinetCarcassTemplate: CabinetTemplate = {
  name: "Base Cabinet",
  description: "Standard base cabinet with sides, bottom, and top supports",
  defaultWidth: 24,
  defaultHeight: 30,
  defaultDepth: 24,
  color: "#E0C9A6", // Light wood color
  compartmentWidthThreshold: 24, // 24 inches threshold for creating a new compartment
};

// Function to create a footprint from cabinet template
export function createCabinetFootprint(
  position: [number, number, number] = [0, 0, 0],
  template: CabinetTemplate = cabinetCarcassTemplate
): Partial<Footprint> {
  return {
    position,
    width: template.defaultWidth,
    depth: template.defaultDepth,
    height: template.defaultHeight,
    color: template.color,
  };
}

// Function to generate compartments based on cabinet width
export function generateCompartments(cabinetWidth: number, threshold: number = 24) {
  const numCompartments = Math.max(1, Math.floor(cabinetWidth / threshold));
  const compartmentWidth = cabinetWidth / numCompartments;

  return Array.from({ length: numCompartments }).map((_, i) => ({
    index: i,
    xOffset: i * compartmentWidth - (cabinetWidth / 2) + (compartmentWidth / 2), // Center in the cabinet
    width: compartmentWidth,
  }));
}

// Additional cabinet templates can be added here
export const cabinetTemplates = {
  baseCabinet: cabinetCarcassTemplate,
  // Add more templates as needed
}; 