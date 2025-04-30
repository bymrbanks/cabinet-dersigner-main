"use client"

import { useState } from "react"
import { useCabinetStore } from "@/store/cabinet-store"
import { cabinetPresets, getAllCategories, getPresetsByCategory } from "@/store/cabinet-presets"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function PresetLibrary() {
  const { toast } = useToast()
  const [activeCategory, setActiveCategory] = useState<"base" | "wall" | "tall" | "special">("base")
  const categories = getAllCategories()
  const presets = getPresetsByCategory(activeCategory)

  const { setWidth, setHeight, setDepth, setType, setColumns, setSections, setMaterialColor, units } = useCabinetStore()

  const applyPreset = (presetId: string) => {
    const preset = cabinetPresets.find((p) => p.id === presetId)
    if (!preset) return

    // Apply the preset configuration
    setWidth(preset.config.width)
    setHeight(preset.config.height)
    setDepth(preset.config.depth)
    setType(preset.config.type)
    setColumns(preset.config.columns)
    setSections([...preset.config.sections]) // Create a copy to ensure reactivity
    setMaterialColor(preset.config.materialColor)

    toast({
      title: "Preset applied",
      description: `Applied the "${preset.name}" preset`,
    })
  }

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case "base":
        return "Base Cabinets"
      case "wall":
        return "Wall Cabinets"
      case "tall":
        return "Tall Cabinets"
      case "special":
        return "Special Cabinets"
      default:
        return category
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="base" value={activeCategory} onValueChange={(value) => setActiveCategory(value as any)}>
        <TabsList className="grid grid-cols-4 w-full">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {getCategoryLabel(category)}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getPresetsByCategory(category).map((preset) => (
                <Card key={preset.id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">{preset.name}</CardTitle>
                    <CardDescription className="text-xs">{preset.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="bg-gray-100 rounded-md p-2 flex justify-center items-center h-24">
                      <Image
                        src={preset.thumbnail || "/placeholder.svg"}
                        alt={preset.name}
                        width={100}
                        height={100}
                        className="object-contain"
                      />
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                      <div>
                        <span className="font-semibold">Width:</span>{" "}
                        {units === "mm" ? preset.config.width : (preset.config.width / 25.4).toFixed(1)} {units}
                      </div>
                      <div>
                        <span className="font-semibold">Height:</span>{" "}
                        {units === "mm" ? preset.config.height : (preset.config.height / 25.4).toFixed(1)} {units}
                      </div>
                      <div>
                        <span className="font-semibold">Depth:</span>{" "}
                        {units === "mm" ? preset.config.depth : (preset.config.depth / 25.4).toFixed(1)} {units}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button variant="default" size="sm" className="w-full" onClick={() => applyPreset(preset.id)}>
                      Apply Preset
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
