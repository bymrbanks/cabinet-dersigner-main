"use client"

import { useState } from "react"
import CabinetDesigner from "@/components/cabinet-designer"
import ControlPanel from "@/components/control-panel"
import CabinetOutliner from "@/components/cabinet-outliner"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const [showCutList, setShowCutList] = useState(false)

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <div className="flex-1 h-[50vh] md:h-screen relative">
        <CabinetOutliner />
        <CabinetDesigner />
      </div>
      <div className="w-full md:w-96 p-4 border-l bg-white overflow-y-auto">
        <ControlPanel showCutList={showCutList} setShowCutList={setShowCutList} />
      </div>
      <Toaster />
    </main>
  )
}
