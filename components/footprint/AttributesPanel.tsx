"use client"

import { useState, useEffect } from 'react'
import { Footprint } from './types'
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { 
  Accordion,
  AccordionContent,
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group"
import { Separator } from "@/components/ui/separator"
import { Eye, Pipette, Plus, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AttributesPanelProps {
  footprint: Footprint | null
  updateFootprint: (id: string, updates: Partial<Footprint>) => void
}

export default function AttributesPanel({ footprint, updateFootprint }: AttributesPanelProps) {
  const [colorValue, setColorValue] = useState("#6495ED")
  const [opacity, setOpacity] = useState(100)

  useEffect(() => {
    if (footprint) {
      setColorValue(footprint.color || "#6495ED")
      setOpacity(100) // Footprints don't have opacity yet, default to 100%
    }
  }, [footprint])

  if (!footprint) {
    return (
      <div className="w-72 bg-background border-l border-border">
        <div className="p-4 text-center text-muted-foreground">
          Select a footprint to view attributes
        </div>
      </div>
    )
  }

  const handlePositionChange = (axis: 'x' | 'z', value: number) => {
    if (!footprint) return
    
    // Create a new grid position based on the current one
    // If gridPosition isn't available, calculate it from the world position
    const currentGridPos = footprint.gridPosition || 
      [footprint.position[0] + 10 - footprint.width/2, footprint.position[1], footprint.position[2] + 10 - footprint.depth/2];
    
    const newGridPosition: [number, number, number] = [...currentGridPos] as [number, number, number];
    if (axis === 'x') {
      newGridPosition[0] = value;
    } else if (axis === 'z') {
      newGridPosition[2] = value;
    }
    
    // Calculate the new world position (from corner to center)
    const newWorldPosition: [number, number, number] = [
      newGridPosition[0] - 10 + footprint.width/2, // Convert from grid to world
      newGridPosition[1],
      newGridPosition[2] - 10 + footprint.depth/2
    ];
    
    updateFootprint(footprint.id, { 
      position: newWorldPosition,
      gridPosition: newGridPosition
    });
  }

  const handleDimensionChange = (dimension: 'width' | 'depth' | 'height', value: number) => {
    if (!footprint) return
    updateFootprint(footprint.id, { [dimension]: value })
  }

  const handleColorChange = (value: string) => {
    if (!footprint) return
    setColorValue(value)
    updateFootprint(footprint.id, { color: value })
  }

  const handleOpacityChange = (value: number[]) => {
    if (!footprint) return
    setOpacity(value[0])
    // If we add opacity to the Footprint type, we would update it here
  }

  return (
    <div className="w-72 bg-background border-l border-border h-full overflow-y-auto">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">Footprint</h2>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["position", "layout", "appearance", "fill"]}>
        {/* Position Section */}
        <AccordionItem value="position" className="border-b">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <span className="text-base font-semibold">Position</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 px-4">
            {/* Alignment controls */}
            <div className="mb-4">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Alignment
              </Label>
              <ToggleGroup type="single" className="justify-between border rounded-md bg-muted/40 p-1">
                <ToggleGroupItem value="left" aria-label="Align left" className="data-[state=on]:bg-background h-8 w-8">
                  <span className="i-lucide-align-left-simple h-4 w-4">≡</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="center" aria-label="Align center" className="data-[state=on]:bg-background h-8 w-8">
                  <span className="i-lucide-align-center-simple h-4 w-4">⋮</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="right" aria-label="Align right" className="data-[state=on]:bg-background h-8 w-8">
                  <span className="i-lucide-align-right-simple h-4 w-4">≡</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Position X/Z */}
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground block">
                Position
              </Label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <Label htmlFor="position-x" className="text-xs mb-1.5 block">
                    X
                  </Label>
                  <Input
                    id="position-x"
                    className="bg-muted/40 h-9"
                    type="number"
                    value={footprint.gridPosition 
                      ? footprint.gridPosition[0].toFixed(2) 
                      : (footprint.position[0] + 10 - footprint.width/2).toFixed(2)}
                    onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="position-z" className="text-xs mb-1.5 block">
                    Z
                  </Label>
                  <Input
                    id="position-z"
                    className="bg-muted/40 h-9"
                    type="number"
                    value={footprint.gridPosition 
                      ? footprint.gridPosition[2].toFixed(2) 
                      : (footprint.position[2] + 10 - footprint.depth/2).toFixed(2)}
                    onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              {/* Rotation */}
              <div>
                <Label htmlFor="rotation" className="text-xs text-muted-foreground block mb-2">
                  Rotation
                </Label>
                <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                  <Input
                    id="rotation"
                    className="bg-muted/40 h-9"
                    type="text"
                    value="0°"
                    readOnly
                  />
                  <Button variant="outline" size="icon" className="h-9 w-9 bg-muted/40">
                    <span className="rotate-0">⟳</span>
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 bg-muted/40">
                    <span className="rotate-180">⥁</span>
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Layout Section */}
        <AccordionItem value="layout" className="border-b">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <span className="text-base font-semibold">Layout</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 px-4">
            <div className="mb-3">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Dimensions
              </Label>
              <div className="grid grid-cols-3 gap-2 items-center">
                <div>
                  <Label htmlFor="width" className="text-xs mb-1.5 block">
                    W
                  </Label>
                  <Input
                    id="width"
                    className="bg-muted/40 h-9"
                    type="number"
                    value={footprint.width.toFixed(2)}
                    onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="depth" className="text-xs mb-1.5 block">
                    D
                  </Label>
                  <Input
                    id="depth"
                    className="bg-muted/40 h-9"
                    type="number"
                    value={footprint.depth.toFixed(2)}
                    onChange={(e) => handleDimensionChange('depth', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-xs mb-1.5 block">
                    H
                  </Label>
                  <Input
                    id="height"
                    className="bg-muted/40 h-9"
                    type="number"
                    value={(footprint.height || 1).toFixed(2)}
                    onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Appearance Section */}
        <AccordionItem value="appearance" className="border-b">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <span className="text-base font-semibold">Appearance</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 px-4">
            <div className="mb-3">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Opacity
              </Label>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                <Slider
                  value={[opacity]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleOpacityChange}
                  className="col-span-1"
                />
                <div className="flex items-center border rounded bg-muted/40 h-9 px-2 w-20">
                  <Input
                    type="number"
                    value={opacity}
                    onChange={(e) => handleOpacityChange([parseInt(e.target.value)])}
                    className="border-0 bg-transparent p-0 text-right h-auto"
                  />
                  <span className="text-xs ml-1">%</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Fill Section */}
        <AccordionItem value="fill" className="border-b">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <span className="text-base font-semibold">Fill</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 px-4">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-8 h-8 rounded border cursor-pointer" 
                style={{ backgroundColor: colorValue }}
                onClick={() => {/* Open color picker */}}
              />
              <Input
                type="text"
                value={colorValue.toUpperCase()}
                onChange={(e) => handleColorChange(e.target.value)}
                className="h-9 bg-muted/40 font-mono"
              />
              <div className="flex items-center gap-2 border rounded bg-muted/40 h-9 px-2">
                <span className="text-xs">100</span>
                <span className="text-xs">%</span>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
} 