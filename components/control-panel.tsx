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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">Cabinet Designer</div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => undo()} disabled={!canUndo()} title="Undo">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => redo()} disabled={!canRedo()} title="Redo">
            <Redo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowPresets(true)} title="Presets">
            <BookOpen className="h-4 w-4" />
          </Button>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cabinet Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Grid Settings</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="grid-visible" checked={gridVisible} onCheckedChange={setGridVisible} />
                      <Label htmlFor="grid-visible">Show Grid</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="snap-to-grid" checked={snapToGrid} onCheckedChange={setSnapToGrid} />
                      <Label htmlFor="snap-to-grid">Snap to Grid</Label>
                    </div>
                  </div>
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="grid-size">Grid Size</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="grid-size-slider"
                        min={0.5}
                        max={5}
                        step={0.5}
                        value={[gridSize]}
                        onValueChange={(value) => setGridSize(value[0])}
                      />
                      <Input
                        id="grid-size"
                        type="number"
                        value={gridSize}
                        onChange={(e) => setGridSize(Number(e.target.value))}
                        min={0.5}
                        max={5}
                        step={0.5}
                        className="w-20"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Grid size in meters. Smaller values create a finer grid.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dimension Constraints ({units})</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-width">Min Width</Label>
                      <Input
                        id="min-width"
                        type="number"
                        value={displayMinWidth.toFixed(units === "mm" ? 0 : 1)}
                        onChange={(e) => setMinWidth(convertFromCurrentUnit(Number(e.target.value)))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-width">Max Width</Label>
                      <Input
                        id="max-width"
                        type="number"
                        value={displayMaxWidth.toFixed(units === "mm" ? 0 : 1)}
                        onChange={(e) => setMaxWidth(convertFromCurrentUnit(Number(e.target.value)))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="min-height">Min Height</Label>
                      <Input
                        id="min-height"
                        type="number"
                        value={displayMinHeight.toFixed(units === "mm" ? 0 : 1)}
                        onChange={(e) => setMinHeight(convertFromCurrentUnit(Number(e.target.value)))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-height">Max Height</Label>
                      <Input
                        id="max-height"
                        type="number"
                        value={displayMaxHeight.toFixed(units === "mm" ? 0 : 1)}
                        onChange={(e) => setMaxHeight(convertFromCurrentUnit(Number(e.target.value)))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="min-depth">Min Depth</Label>
                      <Input
                        id="min-depth"
                        type="number"
                        value={displayMinDepth.toFixed(units === "mm" ? 0 : 1)}
                        onChange={(e) => setMinDepth(convertFromCurrentUnit(Number(e.target.value)))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-depth">Max Depth</Label>
                      <Input
                        id="max-depth"
                        type="number"
                        value={displayMaxDepth.toFixed(units === "mm" ? 0 : 1)}
                        onChange={(e) => setMaxDepth(convertFromCurrentUnit(Number(e.target.value)))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-section-height">Min Section Height ({units})</Label>
                  <Input
                    id="min-section-height"
                    type="number"
                    value={displayMinSectionHeight.toFixed(units === "mm" ? 0 : 1)}
                    onChange={(e) => setMinSectionHeight(convertFromCurrentUnit(Number(e.target.value)))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compartment-threshold">Compartment Width Threshold ({units})</Label>
                  <Input
                    id="compartment-threshold"
                    type="number"
                    value={displayCompartmentThreshold.toFixed(units === "mm" ? 0 : 1)}
                    onChange={(e) => setCompartmentWidthThreshold(convertFromCurrentUnit(Number(e.target.value)))}
                  />
                  <p className="text-xs text-muted-foreground">
                    A new compartment will be added for every{" "}
                    {displayCompartmentThreshold.toFixed(units === "mm" ? 0 : 1)} {units} of cabinet width
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label htmlFor="units">Units:</Label>
          <RadioGroup
            value={units}
            onValueChange={(value) => setUnits(value as "mm" | "inches")}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mm" id="mm" />
              <Label htmlFor="mm">Millimeters</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inches" id="inches" />
              <Label htmlFor="inches">Inches</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="show-dimensions">Dimensions:</Label>
            <Switch id="show-dimensions" checked={showDimensionLines} onCheckedChange={setShowDimensionLines} />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="snap-grid">Snap to Grid:</Label>
            <Switch id="snap-grid" checked={snapToGrid} onCheckedChange={setSnapToGrid} />
          </div>
        </div>
      </div>

      {/* Open/Close All buttons */}
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => toggleAllOpenState(true)}>
          <DoorOpen className="h-4 w-4 mr-2" />
          Open All Doors & Drawers
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => toggleAllOpenState(false)}>
          <DoorClosed className="h-4 w-4 mr-2" />
          Close All Doors & Drawers
        </Button>
      </div>

      {/* Cabinet selector */}
      {cabinets.length > 1 && (
        <div className="space-y-2">
          <Label>Select Cabinet</Label>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {cabinets.map((cabinet) => (
              <Button
                key={cabinet.id}
                variant={activeCabinetId === cabinet.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCabinet(cabinet.id)}
                className="flex-shrink-0"
              >
                Cabinet {cabinet.id.split("-")[1]}
              </Button>
            ))}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => duplicateCabinet(activeCabinetId!)}
              disabled={!activeCabinetId}
            >
              Duplicate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeCabinet(activeCabinetId!)}
              disabled={!activeCabinetId || cabinets.length <= 1}
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Compartment selector */}
      {compartments.length > 1 && (
        <div className="space-y-2">
          <Label>Select Compartment</Label>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {compartments.map((_, index) => (
              <Button
                key={`compartment-${index}`}
                variant={activeCompartmentIndex === index ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCompartmentIndex(index)}
                className="flex-shrink-0"
              >
                Compartment {index + 1}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Handle settings dialog */}
      <Dialog open={showHandleSettings} onOpenChange={setShowHandleSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Handle Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Default Handle Style</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["bar", "knob", "cup", "edge", "none"] as HandleStyle[]).map((style) => (
                  <Button
                    key={style}
                    variant={defaultHandleConfig.style === style ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDefaultHandleConfig({ style })}
                    className="flex items-center justify-center"
                  >
                    {getHandleStyleIcon(style)}
                    <span className="ml-2">{getHandleStyleName(style)}</span>
                  </Button>
                ))}
              </div>
            </div>

            {defaultHandleConfig.style !== "none" && (
              <>
                <div className="space-y-2">
                  <Label>Default Handle Orientation</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={defaultHandleConfig.orientation === "horizontal" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDefaultHandleConfig({ orientation: "horizontal" })}
                      disabled={defaultHandleConfig.style === "knob"}
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Horizontal
                    </Button>
                    <Button
                      variant={defaultHandleConfig.orientation === "vertical" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDefaultHandleConfig({ orientation: "vertical" })}
                      disabled={defaultHandleConfig.style === "knob"}
                    >
                      <AlignLeft className="h-4 w-4 mr-2" />
                      Vertical
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handle-size">Default Handle Size ({units})</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="handle-size-slider"
                      min={20}
                      max={200}
                      step={10}
                      value={[defaultHandleConfig.size]}
                      onValueChange={(value) => setDefaultHandleConfig({ size: value[0] })}
                    />
                    <Input
                      id="handle-size"
                      type="number"
                      value={defaultHandleConfig.size}
                      onChange={(e) => setDefaultHandleConfig({ size: Number(e.target.value) })}
                      min={20}
                      max={200}
                      step={10}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handle-position">Default Handle Position (%)</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="handle-position-slider"
                      min={10}
                      max={90}
                      step={5}
                      value={[defaultHandleConfig.position]}
                      onValueChange={(value) => setDefaultHandleConfig({ position: value[0] })}
                    />
                    <Input
                      id="handle-position"
                      type="number"
                      value={defaultHandleConfig.position}
                      onChange={(e) => setDefaultHandleConfig({ position: Number(e.target.value) })}
                      min={10}
                      max={90}
                      step={5}
                      className="w-20"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Position from top (vertical handles) or left (horizontal handles)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handle-color">Default Handle Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {["#888888", "#555555", "#DDDDDD", "#C0C0C0", "#A67D3D", "#000000"].map((color) => (
                      <div
                        key={color}
                        className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                          defaultHandleConfig.color === color ? "border-blue-500" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setDefaultHandleConfig({ color })}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={() => applyDefaultHandleToAll()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Apply to All Handles
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="dimensions">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
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
