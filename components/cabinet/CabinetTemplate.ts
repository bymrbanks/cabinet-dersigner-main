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
  compartmentWidthThreshold: 50, // 24 inches threshold for creating a new compartment
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
  // If cabinet width is less than threshold, create a single compartment
  if (cabinetWidth <= threshold) {
    return [{
      index: 0,
      xOffset: 0,
      width: cabinetWidth,
    }];
  }
  
  // If cabinet width exceeds threshold, make first compartment larger
  const numCompartments = Math.max(2, Math.floor(cabinetWidth / threshold));
  const compartments = [];
  
  // First compartment gets the threshold width (or slightly less if needed)
  const firstCompartmentWidth = Math.min(threshold, cabinetWidth * 0.6);
  
  // Remaining width is divided among additional compartments
  const remainingWidth = cabinetWidth - firstCompartmentWidth;
  const additionalCompartmentWidth = remainingWidth / (numCompartments - 1);
  
  // Add first compartment
  compartments.push({
    index: 0,
    xOffset: -cabinetWidth/2 + firstCompartmentWidth/2,
    width: firstCompartmentWidth,
  });
  
  // Add additional compartments
  for (let i = 1; i < numCompartments; i++) {
    compartments.push({
      index: i,
      xOffset: -cabinetWidth/2 + firstCompartmentWidth + additionalCompartmentWidth * (i - 0.5),
      width: additionalCompartmentWidth,
    });
  }
  
  return compartments;
}

// Additional cabinet templates can be added here
export const cabinetTemplates = {
  baseCabinet: cabinetCarcassTemplate,
  // Add more templates as needed
}; 