import { Footprint } from "../footprint/types";

export interface CabinetTemplate {
  name: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultDepth: number;
  color: string;
}

// Basic cabinet carcass template
export const cabinetCarcassTemplate: CabinetTemplate = {
  name: "Base Cabinet",
  description: "Standard base cabinet with sides, bottom, and top supports",
  defaultWidth: 24,
  defaultHeight: 30,
  defaultDepth: 24,
  color: "#E0C9A6", // Light wood color
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

// Additional cabinet templates can be added here
export const cabinetTemplates = {
  baseCabinet: cabinetCarcassTemplate,
  // Add more templates as needed
}; 