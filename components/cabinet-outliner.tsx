"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, X, Eye, EyeOff } from "lucide-react"
import { useCabinetStore } from "@/store/cabinet-store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Define types for the outliner
type OutlinerItemType = {
  id: string
  name: string
  type: string
  isSelected: boolean
  isActive?: boolean
  isOpen?: boolean
  children?: OutlinerItemType[]
}

type OutlinerItemProps = {
  item: OutlinerItemType
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  depth?: number
}

export default function CabinetOutliner() {
  const [isOpen, setIsOpen] = useState(true)
  const {
    cabinets,
    selectedPart,
    setSelectedPart,
    activeCabinetId,
    setActiveCabinet,
    isPartOpen,
    toggleOpenState,
  } = useCabinetStore()

  // Function to get the part type from an ID
  const getPartType = (id: string): string => {
    if (!id) return "Unknown";
    if (id.includes("drawer")) return "Drawer"
    if (id.includes("door")) return "Door"
    if (id.includes("shelf")) return "Shelf"
    if (id.includes("cabinet")) return "Cabinet"
    return "Part"
  }

  // Function to get a human-readable name from an ID
  const getPartName = (id: string): string => {
    if (!id) return "Unknown";
    
    const parts = id.split("-")
    
    // Extract cabinet number (use the UUID's first few characters)
    const cabinetId = parts.find(p => p.includes("cabinet"))
    const cabinetNumber = cabinetId ? cabinetId.split("cabinet-")[1]?.substring(0, 4) : ""
    
    if (id.includes("drawer")) {
      const compartmentIndex = parts[parts.indexOf("compartment") + 1]
      const drawerIndex = parts[parts.indexOf("drawer") + 1]
      return `Drawer ${compartmentIndex}-${drawerIndex}`
    }
    
    if (id.includes("door")) {
      const compartmentIndex = parts[parts.indexOf("compartment") + 1]
      const doorIndex = parts[parts.indexOf("door") + 1]
      return `Door ${compartmentIndex}-${doorIndex}`
    }
    
    if (id.includes("shelf")) {
      const compartmentIndex = parts[parts.indexOf("compartment") + 1]
      const shelfIndex = parts[parts.indexOf("shelf") + 1]
      return `Shelf ${compartmentIndex}-${shelfIndex}`
    }
    
    if (id.includes("cabinet")) {
      return `Cabinet ${cabinetNumber}`
    }
    
    return id
  }

  // Generate hierarchical structure for the outliner
  const generateOutlinerData = () => {
    if (!cabinets || !Array.isArray(cabinets)) {
      return []
    }
    
    return cabinets.map(cabinet => {
      if (!cabinet || !cabinet.id) {
        return null;
      }
      
      const cabinetItem = {
        id: cabinet.id,
        name: getPartName(cabinet.id),
        type: "Cabinet",
        isSelected: selectedPart === cabinet.id,
        isActive: activeCabinetId === cabinet.id,
        children: [] as OutlinerItemType[]
      }
      
      // Add compartments
      if (cabinet.compartments && Array.isArray(cabinet.compartments)) {
        cabinet.compartments.forEach((compartment, compartmentIndex) => {
          if (!compartment) return;
          
          const compartmentId = `${cabinet.id}-compartment-${compartmentIndex}`
          const compartmentItem = {
            id: compartmentId,
            name: `Compartment ${compartmentIndex + 1}`,
            type: "Compartment",
            isSelected: selectedPart === compartmentId,
            children: [] as OutlinerItemType[]
          }
          
          // Add sections (doors, drawers)
          if (compartment.sections && Array.isArray(compartment.sections)) {
            compartment.sections.forEach((section, sectionIndex) => {
              if (!section || !section.type) return;
              
              const sectionId = `${cabinet.id}-compartment-${compartmentIndex}-${section.type}-${sectionIndex}`
              const sectionItem = {
                id: sectionId,
                name: `${section.type === "door" ? "Door" : "Drawer"} ${sectionIndex + 1}`,
                type: section.type === "door" ? "Door" : "Drawer",
                isSelected: selectedPart === sectionId,
                isOpen: isPartOpen(sectionId)
              }
              compartmentItem.children.push(sectionItem)
            });
          }
          
          // Add shelves
          if (compartment.shelves && Array.isArray(compartment.shelves)) {
            compartment.shelves.forEach((shelf, shelfIndex) => {
              const shelfId = `${cabinet.id}-compartment-${compartmentIndex}-shelf-${shelfIndex}`
              const shelfItem = {
                id: shelfId,
                name: `Shelf ${shelfIndex + 1}`,
                type: "Shelf",
                isSelected: selectedPart === shelfId
              }
              compartmentItem.children.push(shelfItem)
            });
          }
          
          cabinetItem.children.push(compartmentItem)
        });
      }
      
      return cabinetItem
    }).filter(Boolean) as OutlinerItemType[];
  }

  const outlineData = generateOutlinerData()

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full z-40 transition-all duration-300 bg-white shadow-lg border-r border-gray-200",
        isOpen ? "w-64" : "w-6"
      )}
    >
      {/* Toggle button */}
      <button
        className="absolute top-4 right-2 z-50 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close outliner" : "Open outliner"}
      >
        {isOpen ? <X size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Outliner content - only shown when panel is open */}
      {isOpen && (
        <div className="p-2 h-full overflow-auto">
          <h3 className="font-medium py-2 px-1 text-sm">Cabinet Outliner</h3>
          
          <div className="mt-2">
            {outlineData && outlineData.length > 0 ? (
              outlineData.map((cabinet) => (
                <OutlinerItem
                  key={cabinet.id}
                  item={cabinet}
                  onSelect={(id) => {
                    setSelectedPart(id)
                    const cabinetId = id.split("-")[0] + "-" + id.split("-")[1]
                    setActiveCabinet(cabinetId)
                  }}
                  onToggle={(id) => toggleOpenState(id)}
                />
              ))
            ) : (
              <div className="text-xs text-gray-500 p-2">No cabinets found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Recursive component for outliner items
function OutlinerItem({ item, onSelect, onToggle, depth = 0 }: OutlinerItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0
  
  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center py-1 px-1 text-xs rounded-sm hover:bg-gray-100 cursor-pointer",
          item.isSelected && "bg-blue-100 hover:bg-blue-100",
          item.isActive && !item.isSelected && "bg-gray-50"
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => onSelect(item.id)}
      >
        {hasChildren && (
          <button
            className="mr-1 p-1"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
        
        {!hasChildren && <span className="w-6"></span>}
        
        <span className="flex-grow">{item.name}</span>
        
        {/* Toggle visibility button for doors and drawers */}
        {(item.type === "Door" || item.type === "Drawer") && (
          <button
            className="p-1 text-gray-500 hover:text-gray-800"
            onClick={(e) => {
              e.stopPropagation()
              onToggle(item.id)
            }}
            title={item.isOpen ? "Close" : "Open"}
          >
            {item.isOpen ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      
      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child) => (
            <OutlinerItem
              key={child.id}
              item={child}
              onSelect={onSelect}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
} 