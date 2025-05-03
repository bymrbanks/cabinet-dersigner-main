"use client"

import { useState, useEffect } from 'react'
import { Footprint } from './types'
import { ChevronRight, ChevronDown, Eye, EyeOff, Layers } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useCabinetStore } from "@/store/cabinet-store"

// Define the outliner item type
interface OutlinerItem {
  id: string;
  name: string;
  type: string;
  isSelected: boolean;
  children?: OutlinerItem[];
  visible?: boolean;
}

interface OutlinerProps {
  footprints: Footprint[]
  selectedFootprintId: string | null
  onSelectFootprint: (id: string | null) => void
  onUpdateFootprint: (id: string, updates: Partial<Footprint>) => void
}

export default function Outliner({ 
  footprints, 
  selectedFootprintId, 
  onSelectFootprint,
  onUpdateFootprint
}: OutlinerProps) {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({
    'footprints': true, // Footprints group is expanded by default
  })
  
  // Get cabinet data from store
  const { 
    cabinets, 
    selectedPart, 
    setSelectedPart, 
    setActiveCabinet,
    isPartOpen,
    toggleOpenState 
  } = useCabinetStore();
  
  // Toggle expanded state of a group
  const toggleExpand = (key: string) => {
    setExpanded(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }
  
  // Toggle visibility of a footprint
  const toggleVisibility = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const footprint = footprints.find(fp => fp.id === id)
    if (footprint) {
      onUpdateFootprint(id, { 
        visible: footprint.visible === false ? true : false 
      })
    }
  }

  // Helper function to get a compartment name
  const getCompartmentName = (index: number) => `Compartment ${index + 1}`;
  
  // Helper function to get section name
  const getSectionName = (type: string, index: number) => 
    `${type === "door" ? "Door" : "Drawer"} ${index + 1}`;
  
  // Build a hierarchical structure for the outliner
  const buildOutlinerData = () => {
    const result: OutlinerItem[] = [];
    
    // Create footprint items
    footprints.forEach(footprint => {
      const footprintItem: OutlinerItem = {
        id: footprint.id,
        name: `Footprint ${footprint.width.toFixed(0)}×${footprint.depth.toFixed(0)}`,
        type: 'footprint',
        isSelected: selectedFootprintId === footprint.id,
        visible: footprint.visible !== false,
        children: []
      };
      
      // Find the cabinet that belongs to this footprint
      const cabinetForFootprint = cabinets.find(c => c.id === footprint.id);
      
      if (cabinetForFootprint) {
        // Create cabinet children
        const cabinetItem: OutlinerItem = {
          id: cabinetForFootprint.id,
          name: `Cabinet`,
          type: 'cabinet',
          isSelected: selectedPart === cabinetForFootprint.id,
          children: []
        };
        
        // Add compartments
        if (cabinetForFootprint.compartments && Array.isArray(cabinetForFootprint.compartments)) {
          cabinetForFootprint.compartments.forEach((compartment, compIndex) => {
            const compartmentId = `${cabinetForFootprint.id}-compartment-${compIndex}`;
            const compartmentItem: OutlinerItem = {
              id: compartmentId,
              name: getCompartmentName(compIndex),
              type: 'compartment',
              isSelected: selectedPart === compartmentId,
              children: []
            };
            
            // Add sections (doors, drawers)
            if (compartment.sections && Array.isArray(compartment.sections)) {
              compartment.sections.forEach((section, sectionIndex) => {
                if (!section || !section.type) return;
                
                const sectionId = `${cabinetForFootprint.id}-compartment-${compIndex}-${section.type}-${sectionIndex}`;
                const sectionItem: OutlinerItem = {
                  id: sectionId,
                  name: getSectionName(section.type, sectionIndex),
                  type: section.type,
                  isSelected: selectedPart === sectionId
                };
                
                compartmentItem.children?.push(sectionItem);
              });
            }
            
            // Add shelves
            if (compartment.shelves && Array.isArray(compartment.shelves)) {
              compartment.shelves.forEach((shelf, shelfIndex) => {
                const shelfId = `${cabinetForFootprint.id}-compartment-${compIndex}-shelf-${shelfIndex}`;
                const shelfItem: OutlinerItem = {
                  id: shelfId,
                  name: `Shelf ${shelfIndex + 1}`,
                  type: 'shelf',
                  isSelected: selectedPart === shelfId
                };
                
                compartmentItem.children?.push(shelfItem);
              });
            }
            
            cabinetItem.children?.push(compartmentItem);
          });
        }
        
        footprintItem.children?.push(cabinetItem);
      }
      
      result.push(footprintItem);
    });
    
    return result;
  };
  
  const outlinerData = buildOutlinerData();
  
  // Function to handle selection of any item (footprint or cabinet part)
  const handleSelect = (id: string) => {
    // Determine if it's a footprint or cabinet part
    const isFootprint = footprints.some(fp => fp.id === id);
    
    if (isFootprint) {
      onSelectFootprint(id);
      // Also select the cabinet if it exists
      setSelectedPart(id);
      setActiveCabinet(id);
    } else {
      setSelectedPart(id);
      // Extract the cabinet ID from the part ID
      const cabinetId = id.split('-')[0] + '-' + id.split('-')[1];
      setActiveCabinet(cabinetId);
      
      // Also select the footprint if the ID matches
      const matchingFootprint = footprints.find(fp => fp.id === cabinetId);
      if (matchingFootprint) {
        onSelectFootprint(cabinetId);
      }
    }
  };
  
  return (
    <div className="w-72 bg-background border-r border-border h-full overflow-y-auto">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">Outliner</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Layers className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-2">
        {/* Footprints Group */}
        <div className="mb-1">
          <div 
            className="flex items-center py-1 px-2 hover:bg-muted/40 rounded cursor-pointer"
            onClick={() => toggleExpand('footprints')}
          >
            {expanded['footprints'] ? 
              <ChevronDown className="h-4 w-4 mr-1" /> : 
              <ChevronRight className="h-4 w-4 mr-1" />
            }
            <span className="text-sm font-medium">Footprints</span>
          </div>
          
          {expanded['footprints'] && (
            <div className="pl-4">
              {outlinerData.length === 0 ? (
                <div className="py-1 px-2 text-xs text-muted-foreground">
                  No footprints created yet
                </div>
              ) : (
                outlinerData.map(footprintItem => (
                  <RecursiveOutlinerItem
                    key={footprintItem.id}
                    item={footprintItem}
                    onSelect={handleSelect}
                    onToggle={toggleOpenState}
                    onToggleVisibility={toggleVisibility}
                    depth={0}
                  />
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Walls Group */}
        <div className="mb-1">
          <div 
            className="flex items-center py-1 px-2 hover:bg-muted/40 rounded cursor-pointer"
            onClick={() => toggleExpand('walls')}
          >
            {expanded['walls'] ? 
              <ChevronDown className="h-4 w-4 mr-1" /> : 
              <ChevronRight className="h-4 w-4 mr-1" />
            }
            <span className="text-sm font-medium">Walls</span>
          </div>
          
          {expanded['walls'] && (
            <div className="pl-4">
              <div className="flex items-center py-1 px-2 hover:bg-muted/40 rounded cursor-pointer">
                <div className="mr-2 w-4 h-4">
                  <div className="w-3 h-3 rounded-sm bg-gray-300" />
                </div>
                <span className="text-xs flex-1 truncate">Floor</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-50 hover:opacity-100"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center py-1 px-2 hover:bg-muted/40 rounded cursor-pointer">
                <div className="mr-2 w-4 h-4">
                  <div className="w-3 h-3 rounded-sm bg-gray-300" />
                </div>
                <span className="text-xs flex-1 truncate">Back Wall</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-50 hover:opacity-100"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center py-1 px-2 hover:bg-muted/40 rounded cursor-pointer">
                <div className="mr-2 w-4 h-4">
                  <div className="w-3 h-3 rounded-sm bg-gray-300" />
                </div>
                <span className="text-xs flex-1 truncate">Side Wall</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-50 hover:opacity-100"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Recursive component for rendering outliner items with children
function RecursiveOutlinerItem({
  item,
  onSelect,
  onToggle,
  onToggleVisibility,
  depth = 0
}: {
  item: OutlinerItem;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onToggleVisibility: (e: React.MouseEvent, id: string) => void;
  depth: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  
  return (
    <div className="select-none">
      <div
        className={`flex items-center py-1 px-2 hover:bg-muted/40 rounded cursor-pointer 
                    ${item.isSelected ? 'bg-blue-100/30 hover:bg-blue-100/40' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => onSelect(item.id)}
      >
        {hasChildren ? (
          <button
            className="mr-1 w-4 h-4 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <span className="mr-1 w-4" />
        )}
        
        <span className="text-xs flex-1 truncate">{item.name}</span>
        
        {/* Show visibility toggle for footprints */}
        {item.type === 'footprint' && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-50 hover:opacity-100"
            onClick={(e) => onToggleVisibility(e, item.id)}
          >
            {item.visible === false ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </Button>
        )}
        
        {/* Show open/close toggle for doors and drawers */}
        {(item.type === 'door' || item.type === 'drawer') && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-50 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(item.id);
            }}
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* Render children if there are any and the item is expanded */}
      {hasChildren && isExpanded && (
        <div>
          {item.children!.map(child => (
            <RecursiveOutlinerItem
              key={child.id}
              item={child}
              onSelect={onSelect}
              onToggle={onToggle}
              onToggleVisibility={onToggleVisibility}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
} 