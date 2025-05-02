"use client"

import { useState } from 'react'
import { Footprint } from './types'
import { ChevronRight, ChevronDown, Eye, EyeOff, Layers } from 'lucide-react'
import { Button } from "@/components/ui/button"

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
              {footprints.length === 0 ? (
                <div className="py-1 px-2 text-xs text-muted-foreground">
                  No footprints created yet
                </div>
              ) : (
                footprints.map(footprint => (
                  <div 
                    key={footprint.id}
                    className={`flex items-center py-1 px-2 hover:bg-muted/40 rounded cursor-pointer ${
                      selectedFootprintId === footprint.id ? 'bg-blue-100/20' : ''
                    }`}
                    onClick={() => onSelectFootprint(footprint.id)}
                  >
                    <div className="mr-2 w-4 h-4">
                      <div 
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: footprint.color }}
                      />
                    </div>
                    <span className="text-xs flex-1 truncate">
                      Footprint {footprint.width.toFixed(0)}×{footprint.depth.toFixed(0)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-50 hover:opacity-100"
                      onClick={(e) => toggleVisibility(e, footprint.id)}
                    >
                      {footprint.visible === false ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
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