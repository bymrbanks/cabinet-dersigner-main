"use client"

import CabinetDesigner from "@/components/cabinet-designer"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="w-full h-screen relative">
        <CabinetDesigner />
      </div>
      <Toaster />
    </main>
  )
}
