"use client"
import { useCabinetStore } from "@/store/cabinet-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import CutList from "./cut-list"
import PresetLibrary from "./preset-library"
import {
  Download,
  Plus,
  Trash2,
  Settings,
  Undo,
  Redo,
  BookOpen,
  DoorOpen,
  DoorClosed,
  AlignLeft,
  AlignRight,
  Grip,
  CircleDot,
  Square,
  Minus,
  X,
  RefreshCw,
  Layers,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { HandleStyle } from "@/store/cabinet-store"

interface ControlPanelProps {
  showCutList: boolean
  setShowCutList: (show: boolean) => void
}

export default function ControlPanel({ showCutList, setShowCutList }: ControlPanelProps) {
  const {
    cabinets,
    activeCabinetId,
    selectedPart,
    setActiveCabinet,
    removeCabinet,
    duplicateCabinet,
    getWidth,
    getHeight,
    getDepth,
    getType,
    getCompartments,
    getMaterialColor,
    getDefaultHandleConfig,
    units,
    showDimensionLines,
    gridVisible,
    gridSize,
    gridColor,
    snapToGrid,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    minDepth,
    maxDepth,
    minSectionHeight,
    compartmentWidthThreshold,
    setWidth,
    setHeight,
    setDepth,
    setType,
    setMaterialColor,
    setDefaultHandleConfig,
    setUnits,
    setShowDimensionLines,
    setGridVisible,
    setGridSize,
    setGridColor,
    setSnapToGrid,
    setMinWidth,
    setMaxWidth,
    setMinHeight,
    setMaxHeight,
    setMinDepth,
    setMaxDepth,
    setMinSectionHeight,
    setCompartmentWidthThreshold,
    addSectionToCompartment,
    removeSectionFromCompartment,
    updateSectionHeight,
    updateSectionType,
    updateSectionHingePosition,
    updateSectionHandle,
    getSectionIndexFromId,
    getSectionHingePosition,
    getSectionHandle,
    resetSectionHandleToDefault,
    applyDefaultHandleToAll,
    getHandleById,
    updateHandleById,
    convertToCurrentUnit,
    convertFromCurrentUnit,
    undo,
    redo,
    canUndo,
    canRedo,
    toggleOpenState,
    toggleAllOpenState,
    openParts,
    addShelf,
    removeShelf,
    updateShelfPosition,
  } = useCabinetStore()

  const { toast } = useToast()
  const [showSettings, setShowSettings] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [activeCompartmentIndex, setActiveCompartmentIndex] = useState(0)
  const [showHandleSettings, setShowHandleSettings] = useState(false)

  const exportJSON = () => {
    const cabinetData = {
      cabinets,
      units,
    }

    const blob = new Blob([JSON.stringify(cabinetData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "cabinet-design.json"
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "JSON exported",
      description: "Your cabinet design has been exported as JSON",
    })
  }

  // Get active cabinet data
  const width = getWidth()
  const height = getHeight()
  const depth = getDepth()
  const type = getType()
  const compartments = getCompartments()
  const materialColor = getMaterialColor()
  const defaultHandleConfig = getDefaultHandleConfig()

  // Get active compartment
  const activeCompartment = compartments[activeCompartmentIndex] || { sections: [] }
  const sections = activeCompartment?.sections || []

  // Convert dimensions for display
  const displayWidth = convertToCurrentUnit(width)
  const displayHeight = convertToCurrentUnit(height)
  const displayDepth = convertToCurrentUnit(depth)
  const displayCompartmentThreshold = convertToCurrentUnit(compartmentWidthThreshold)

  // Convert constraints for display
  const displayMinWidth = convertToCurrentUnit(minWidth)
  const displayMaxWidth = convertToCurrentUnit(maxWidth)
  const displayMinHeight = convertToCurrentUnit(minHeight)
  const displayMaxHeight = convertToCurrentUnit(maxHeight)
  const displayMinDepth = convertToCurrentUnit(minDepth)
  const displayMaxDepth = convertToCurrentUnit(maxDepth)
  const displayMinSectionHeight = convertToCurrentUnit(minSectionHeight)

  // Check if a handle is selected
  const isHandleSelected = selectedPart?.includes("-handle") || false

  // Get selected handle config if a handle is selected
  const selectedHandleConfig = isHandleSelected ? getHandleById(selectedPart?.replace("-handle", "") || "") : null

  // Handle style icons
  const getHandleStyleIcon = (style: HandleStyle) => {
    switch (style) {
      case "bar":
        return <Grip className="h-4 w-4" />
      case "knob":
        return <CircleDot className="h-4 w-4" />
      case "cup":
        return <Square className="h-4 w-4" />
      case "edge":
        return <Minus className="h-4 w-4" />
      case "none":
        return <X className="h-4 w-4" />
      default:
        return <Grip className="h-4 w-4" />
    }
  }

  // Handle style names
  const getHandleStyleName = (style: HandleStyle) => {
    switch (style) {
      case "bar":
        return "Bar Handle"
      case "knob":
        return "Knob"
      case "cup":
        return "Cup Handle"
      case "edge":
        return "Edge Pull"
      case "none":
        return "No Handle"
      default:
        return "Bar Handle"
    }
  }

  // Update selected handle
  const updateSelectedHandle = (config: Partial<typeof selectedHandleConfig>) => {
    if (isHandleSelected && selectedPart) {
      updateHandleById(selectedPart.replace("-handle", ""), config)
    }
  }

  // Check if a section is selected
  const isSectionSelected = (compartmentIndex: number, sectionIndex: number) => {
    const sectionId = `${activeCabinetId}-compartment-${compartmentIndex}-${sections[sectionIndex]?.type || "door"}-${sectionIndex}`
    return selectedPart === sectionId
  }

  return showCutList ? (
    <CutList />
  ) : showPresets ? (
    <PresetLibrary onClose={() => setShowPresets(false)} />
  ) : (
    <div className="h-full overflow-auto space-y-4">
      <h2 className="text-2xl font-bold">Cabinet Designer</h2>

      <Tabs defaultValue="dimensions">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="shelves">Shelves</TabsTrigger>
          <TabsTrigger value="handles">Handles</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="dimensions" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="width">Width ({units})</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="width-slider"
                min={displayMinWidth}
                max={displayMaxWidth}
                step={units === "mm" ? 10 : 0.5}
                value={[displayWidth]}
                onValueChange={(value) => setWidth(convertFromCurrentUnit(value[0]))}
              />
              <Input
                id="width"
                type="number"
                value={displayWidth.toFixed(units === "mm" ? 0 : 1)}
                onChange={(e) => setWidth(convertFromCurrentUnit(Number(e.target.value)))}
                min={displayMinWidth}
                max={displayMaxWidth}
                step={units === "mm" ? 1 : 0.1}
                className="w-20"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Compartments: {compartments.length} (1 per {displayCompartmentThreshold.toFixed(units === "mm" ? 0 : 1)}{" "}
              {units})
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Height ({units})</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="height-slider"
                min={displayMinHeight}
                max={displayMaxHeight}
                step={units === "mm" ? 10 : 0.5}
                value={[displayHeight]}
                onValueChange={(value) => setHeight(convertFromCurrentUnit(value[0]))}
              />
              <Input
                id="height"
                type="number"
                value={displayHeight.toFixed(units === "mm" ? 0 : 1)}
                onChange={(e) => setHeight(convertFromCurrentUnit(Number(e.target.value)))}
                min={displayMinHeight}
                max={displayMaxHeight}
                step={units === "mm" ? 1 : 0.1}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="depth">Depth ({units})</Label>
            <div className="flex items-center space-x-2">
              <Slider
                id="depth-slider"
                min={displayMinDepth}
                max={displayMaxDepth}
                step={units === "mm" ? 10 : 0.5}
                value={[displayDepth]}
                onValueChange={(value) => setDepth(convertFromCurrentUnit(value[0]))}
              />
              <Input
                id="depth"
                type="number"
                value={displayDepth.toFixed(units === "mm" ? 0 : 1)}
                onChange={(e) => setDepth(convertFromCurrentUnit(Number(e.target.value)))}
                min={displayMinDepth}
                max={displayMaxDepth}
                step={units === "mm" ? 1 : 0.1}
                className="w-20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cabinet Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as "base" | "wall")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="base" id="base" />
                <Label htmlFor="base">Base Cabinet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wall" id="wall" />
                <Label htmlFor="wall">Wall Cabinet</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="material-color">Material Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {["#F9FAFB", "#D1D5DB", "#A1A1AA", "#FBBF24", "#34D399", "#60A5FA"].map((color) => (
                <div
                  key={color}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                    materialColor === color ? "border-blue-500" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setMaterialColor(color)}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Sections in Compartment {activeCompartmentIndex + 1}</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSectionToCompartment(activeCompartmentIndex)}
                disabled={sections.length >= 5}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Section
              </Button>
            </div>

            {sections.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No sections defined. Add a section or a single door will be used.
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className={`p-2 border rounded-md ${
                      isSectionSelected(activeCompartmentIndex, index) ? "border-blue-500 bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Select
                        value={section.type}
                        onValueChange={(value) =>
                          updateSectionType(activeCompartmentIndex, index, value as "door" | "drawer")
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="door">Door</SelectItem>
                          <SelectItem value="drawer">Drawer</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex-1">
                        <Slider
                          min={displayMinSectionHeight}
                          max={500 / (units === "mm" ? 1 : 25.4)}
                          step={units === "mm" ? 10 : 0.5}
                          value={[convertToCurrentUnit(section.height)]}
                          onValueChange={(value) => updateSectionHeight(activeCompartmentIndex, index, value[0])}
                        />
                      </div>

                      <Input
                        type="number"
                        value={convertToCurrentUnit(section.height).toFixed(units === "mm" ? 0 : 1)}
                        onChange={(e) => updateSectionHeight(activeCompartmentIndex, index, Number(e.target.value))}
                        className="w-16"
                        min={displayMinSectionHeight}
                        max={500 / (units === "mm" ? 1 : 25.4)}
                        step={units === "mm" ? 1 : 0.1}
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSectionFromCompartment(activeCompartmentIndex, index)}
                        disabled={sections.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Door hinge position controls */}
                    {section.type === "door" && (
                      <div className="flex items-center space-x-2 mt-2 border-t pt-2">
                        <Label className="text-sm">Hinge Position:</Label>
                        <div className="flex space-x-2">
                          <Button
                            variant={(section.hingePosition || "left") === "left" ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateSectionHingePosition(activeCompartmentIndex, index, "left")}
                          >
                            <AlignLeft className="h-4 w-4 mr-1" />
                            Left
                          </Button>
                          <Button
                            variant={(section.hingePosition || "left") === "right" ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateSectionHingePosition(activeCompartmentIndex, index, "right")}
                          >
                            <AlignRight className="h-4 w-4 mr-1" />
                            Right
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <Label>Open/Close Doors & Drawers</Label>
            </div>

            <div className="text-sm text-muted-foreground mb-2">
              Double-click on any door or drawer in the 3D view to open or close it.
            </div>

            <div className="grid grid-cols-1 gap-2">
              {Object.keys(openParts).length > 0 ? (
                Object.entries(openParts).map(([partId, isOpen]) => {
                  // Extract compartment and section info from part ID
                  const parts = partId.split("-")
                  const type = parts.includes("door") ? "Door" : "Drawer"
                  const compartmentIndex =
                    parts.indexOf("compartment") > -1 ? Number.parseInt(parts[parts.indexOf("compartment") + 1]) + 1 : 0
                  const sectionIndex = Number.parseInt(parts[parts.length - 1]) + 1

                  return (
                    <div key={partId} className="flex justify-between items-center p-2 border rounded-md">
                      <span>
                        {type} {compartmentIndex}.{sectionIndex}
                      </span>
                      <Button
                        variant={isOpen ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleOpenState(partId)}
                      >
                        {isOpen ? "Close" : "Open"}
                      </Button>
                    </div>
                  )
                })
              ) : (
                <div className="text-center p-4 border rounded-md border-dashed">
                  No doors or drawers have been opened yet.
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shelves" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Shelves in Compartment {activeCompartmentIndex + 1}</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addShelf(activeCompartmentIndex)}
              >
                <Layers className="h-4 w-4 mr-1" />
                Add Shelf
              </Button>
            </div>

            {!compartments[activeCompartmentIndex]?.shelves || 
             compartments[activeCompartmentIndex]?.shelves.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No shelves defined. Add a shelf to provide internal storage.
              </div>
            ) : (
              <div className="space-y-3">
                {compartments[activeCompartmentIndex]?.shelves.map((position, index) => (
                  <div
                    key={index}
                    className="p-2 border rounded-md"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Label className="w-24 whitespace-nowrap">Shelf {index + 1}</Label>

                      <div className="flex-1">
                        <Slider
                          min={0}
                          max={100}
                          step={5}
                          value={[position]}
                          onValueChange={(value) => updateShelfPosition(activeCompartmentIndex, index, value[0])}
                        />
                      </div>

                      <Input
                        type="number"
                        value={position}
                        onChange={(e) => updateShelfPosition(activeCompartmentIndex, index, Number(e.target.value))}
                        className="w-16"
                        min={0}
                        max={100}
                        step={5}
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeShelf(activeCompartmentIndex, index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Position: {position}% from bottom
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 text-sm text-muted-foreground border-t pt-4">
              <p>Shelves are positioned as a percentage (0-100) of the compartment's internal height.</p>
              <p>Shelves will automatically adjust to fit when you change the cabinet's dimensions.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="handles" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Handle Configuration</Label>
              <Button variant="outline" size="sm" onClick={() => setShowHandleSettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Default Handle Settings
              </Button>
            </div>

            <div className="text-sm text-muted-foreground mb-4">
              Click on any handle in the 3D view to select and customize it. You can also set default handle styles for
              all new components.
            </div>

            {isHandleSelected && selectedHandleConfig ? (
              <div className="space-y-4 border p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Selected Handle</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const parentId = selectedPart?.replace("-handle", "") || ""
                      const indices = getSectionIndexFromId(parentId)
                      if (indices) {
                        resetSectionHandleToDefault(indices.compartmentIndex, indices.sectionIndex)
                      }
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Handle Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["bar", "knob", "cup", "edge", "none"] as HandleStyle[]).map((style) => (
                      <Button
                        key={style}
                        variant={selectedHandleConfig.style === style ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSelectedHandle({ style })}
                        className="flex items-center justify-center"
                      >
                        {getHandleStyleIcon(style)}
                        <span className="ml-2">{getHandleStyleName(style)}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedHandleConfig.style !== "none" && (
                  <>
                    <div className="space-y-2">
                      <Label>Handle Orientation</Label>
                      <div className="flex space-x-2">
                        <Button
                          variant={selectedHandleConfig.orientation === "horizontal" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSelectedHandle({ orientation: "horizontal" })}
                          disabled={selectedHandleConfig.style === "knob"}
                        >
                          <Minus className="h-4 w-4 mr-2" />
                          Horizontal
                        </Button>
                        <Button
                          variant={selectedHandleConfig.orientation === "vertical" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSelectedHandle({ orientation: "vertical" })}
                          disabled={selectedHandleConfig.style === "knob"}
                        >
                          <AlignLeft className="h-4 w-4 mr-2" />
                          Vertical
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selected-handle-size">Handle Size ({units})</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="selected-handle-size-slider"
                          min={20}
                          max={200}
                          step={10}
                          value={[selectedHandleConfig.size]}
                          onValueChange={(value) => updateSelectedHandle({ size: value[0] })}
                        />
                        <Input
                          id="selected-handle-size"
                          type="number"
                          value={selectedHandleConfig.size}
                          onChange={(e) => updateSelectedHandle({ size: Number(e.target.value) })}
                          min={20}
                          max={200}
                          step={10}
                          className="w-20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selected-handle-position">Handle Position (%)</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="selected-handle-position-slider"
                          min={10}
                          max={90}
                          step={5}
                          value={[selectedHandleConfig.position]}
                          onValueChange={(value) => updateSelectedHandle({ position: value[0] })}
                        />
                        <Input
                          id="selected-handle-position"
                          type="number"
                          value={selectedHandleConfig.position}
                          onChange={(e) => updateSelectedHandle({ position: Number(e.target.value) })}
                          min={10}
                          max={90}
                          step={5}
                          className="w-20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selected-handle-color">Handle Color</Label>
                      <div className="grid grid-cols-6 gap-2">
                        {["#888888", "#555555", "#DDDDDD", "#C0C0C0", "#A67D3D", "#000000"].map((color) => (
                          <div
                            key={color}
                            className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                              selectedHandleConfig.color === color ? "border-blue-500" : "border-transparent"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => updateSelectedHandle({ color })}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center p-8 border rounded-md border-dashed">
                <p className="mb-4">No handle selected</p>
                <p className="text-sm text-muted-foreground">Click on a handle in the 3D view to customize it</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => setShowCutList(true)}>View Cut List</Button>

            <Button onClick={exportJSON}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>

          <div className="text-sm text-muted-foreground mt-4">
            <p>You can also use the buttons in the top-right corner of the 3D view to:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Toggle grid visibility and snapping</li>
              <li>Toggle dimension lines on/off</li>
              <li>Undo or redo changes to your design</li>
              <li>Take a screenshot of your cabinet design</li>
            </ul>
          </div>

          <div className="text-sm text-muted-foreground mt-4">
            <p>To work with multiple cabinets:</p>
            <ol className="list-decimal pl-5 mt-2">
              <li>Click on a cabinet to select it</li>
              <li>Click the blue + button that appears to add a new cabinet</li>
              <li>Use the cabinet selector at the top to switch between cabinets</li>
              <li>Use the transform controls to position and resize cabinets</li>
            </ol>
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={showCutList} onOpenChange={setShowCutList}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Cut List</SheetTitle>
            <SheetDescription>Material list with dimensions for manufacturing</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <CutList />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showPresets} onOpenChange={setShowPresets}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Cabinet Presets</SheetTitle>
            <SheetDescription>Choose from common cabinet configurations</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <PresetLibrary />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
