"use client"

import { useCabinetStore } from "@/store/cabinet-store"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CutList() {
  const { getWidth, getHeight, getDepth, getType, getCompartments, units, convertToCurrentUnit } = useCabinetStore()

  const { toast } = useToast()

  // Get cabinet dimensions
  const width = getWidth()
  const height = getHeight()
  const depth = getDepth()
  const type = getType()
  const compartments = getCompartments()

  // Standard thicknesses
  const thickness = 18 // 18mm standard thickness
  const backThickness = 5 // 5mm for back panel

  // Calculate internal dimensions
  const internalWidth = width - thickness * 2
  const internalHeight = height - thickness * 2
  const internalDepth = depth - backThickness

  // Format dimensions based on current units
  const formatDimension = (value: number) => {
    return convertToCurrentUnit(value).toFixed(units === "mm" ? 0 : 1)
  }

  const formatDimensions = (width: number, height: number, thickness: number) => {
    return `${formatDimension(width)} × ${formatDimension(height)} × ${formatDimension(thickness)}`
  }

  // Generate cut list
  const cutList = [
    {
      name: "Side Panel",
      quantity: 2,
      dimensions: formatDimensions(height, depth, thickness),
      material: "Plywood",
    },
    {
      name: "Bottom Panel",
      quantity: 1,
      dimensions: formatDimensions(internalWidth, depth, thickness),
      material: "Plywood",
    },
    {
      name: "Top Panel",
      quantity: 1,
      dimensions: formatDimensions(internalWidth, depth, thickness),
      material: "Plywood",
    },
    {
      name: "Back Panel",
      quantity: 1,
      dimensions: formatDimensions(width, height, backThickness),
      material: "MDF",
    },
  ]

  // Add vertical dividers for compartments
  if (compartments.length > 1) {
    cutList.push({
      name: "Vertical Divider",
      quantity: compartments.length - 1,
      dimensions: formatDimensions(internalHeight, internalDepth, thickness),
      material: "Plywood",
    })
  }

  // Calculate shelves based on door sections
  let totalShelfCount = 0
  const shelfDimensions: Record<string, { width: number; depth: number; count: number }> = {}

  // Process each compartment to determine shelf requirements
  compartments.forEach((compartment, compartmentIndex) => {
    const compartmentWidth = internalWidth / compartments.length
    const sections = compartment.sections || []
    
    if (sections.length === 0) {
      // Default single door compartment gets one shelf
      const shelfWidth = compartmentWidth - thickness
      const shelfDepth = internalDepth - thickness
      const key = `${shelfWidth}x${shelfDepth}`
      
      if (!shelfDimensions[key]) {
        shelfDimensions[key] = { width: shelfWidth, depth: shelfDepth, count: 0 }
      }
      shelfDimensions[key].count += 1
      totalShelfCount += 1
    } else {
      // Calculate shelves for each door section
      const totalSectionHeight = sections.reduce((sum, section) => sum + Math.max(0, section?.height || 0), 0)
      const scaleFactor = totalSectionHeight > 0 ? internalHeight / totalSectionHeight : 1
      
      // Find door sections
      const doorSections = sections.filter(s => s?.type === "door")
      const tallDoorSections = doorSections.filter(s => (s?.height || 0) * scaleFactor >= 300) // Only doors taller than 300mm get shelves
      
      if (tallDoorSections.length > 0) {
        const shelfWidth = compartmentWidth - thickness
        const shelfDepth = internalDepth - thickness
        const key = `${shelfWidth}x${shelfDepth}`
        
        if (!shelfDimensions[key]) {
          shelfDimensions[key] = { width: shelfWidth, depth: shelfDepth, count: 0 }
        }
        
        // One shelf per tall door section
        shelfDimensions[key].count += tallDoorSections.length
        totalShelfCount += tallDoorSections.length
      }
    }
  })

  // Add shelves to the cut list
  Object.values(shelfDimensions).forEach((shelf) => {
    cutList.push({
      name: "Shelf",
      quantity: shelf.count,
      dimensions: formatDimensions(shelf.width, shelf.depth, thickness),
      material: "Plywood",
    })
  })

  // Add doors and drawers for each compartment
  compartments.forEach((compartment, compartmentIndex) => {
    const sections = compartment.sections || []
    const compartmentWidth = internalWidth / compartments.length

    if (sections.length === 0) {
      // Default single door for compartment
      cutList.push({
        name: `Compartment ${compartmentIndex + 1} Door Panel`,
        quantity: 1,
        dimensions: formatDimensions(compartmentWidth, internalHeight, thickness),
        material: "Plywood",
      })
    } else {
      // Add sections (doors/drawers)
      const totalSectionHeight = sections.reduce((sum, section) => sum + Math.max(0, section?.height || 0), 0)
      const scaleFactor = totalSectionHeight > 0 ? internalHeight / totalSectionHeight : 1

      // Group similar sections
      const doorSections = sections.filter((s) => s?.type === "door")
      const drawerSections = sections.filter((s) => s?.type === "drawer")

      if (doorSections.length > 0) {
        const doorHeights = doorSections.map((s) => Math.round((s?.height || 0) * scaleFactor))

        // Group identical door heights
        const doorHeightCounts = doorHeights.reduce(
          (acc, height) => {
            acc[height] = (acc[height] || 0) + 1
            return acc
          },
          {} as Record<number, number>,
        )

        Object.entries(doorHeightCounts).forEach(([height, count]) => {
          cutList.push({
            name: `Compartment ${compartmentIndex + 1} Door Panel`,
            quantity: count,
            dimensions: formatDimensions(compartmentWidth, Number(height), thickness),
            material: "Plywood",
          })
        })
      }

      if (drawerSections.length > 0) {
        const drawerHeights = drawerSections.map((s) => Math.round((s?.height || 0) * scaleFactor))

        // Group identical drawer heights
        const drawerHeightCounts = drawerHeights.reduce(
          (acc, height) => {
            acc[height] = (acc[height] || 0) + 1
            return acc
          },
          {} as Record<number, number>,
        )

        Object.entries(drawerHeightCounts).forEach(([height, count]) => {
          cutList.push({
            name: `Compartment ${compartmentIndex + 1} Drawer Front`,
            quantity: count,
            dimensions: formatDimensions(compartmentWidth, Number(height), thickness),
            material: "Plywood",
          })
        })
      }
    }
  })

  // Add toe kick for base cabinet
  if (type === "base") {
    cutList.push({
      name: "Toe Kick",
      quantity: 1,
      dimensions: formatDimensions(width, 100, thickness),
      material: "Plywood",
    })
  }

  const exportCSV = () => {
    const headers = [`Part,Quantity,Dimensions (${units}),Material`]
    const rows = cutList.map((item) => `${item.name},${item.quantity},${item.dimensions},${item.material}`)

    const csvContent = [...headers, ...rows].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "cabinet-cut-list.csv"
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Cut list exported",
      description: "Your cut list has been exported as CSV",
    })
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Part</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-left py-2">Dimensions ({units})</th>
              <th className="text-left py-2">Material</th>
            </tr>
          </thead>
          <tbody>
            {cutList.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{item.name}</td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="py-2">{item.dimensions}</td>
                <td className="py-2">{item.material}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button onClick={exportCSV} className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Export as CSV
      </Button>

      <div className="text-sm text-muted-foreground">
        <p>
          Note: This cut list includes all panels needed to build the cabinet as designed. Standard thickness is assumed
          to be 18mm for structural panels and 5mm for the back panel.
        </p>
        {totalShelfCount > 0 && (
          <p className="mt-2">
            Shelves are automatically added to door sections taller than 300mm for proper storage.
          </p>
        )}
      </div>
    </div>
  )
}
