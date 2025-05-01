"use client"

import { useRef, useEffect, useState } from "react"
import { useThree } from "@react-three/fiber"
import { useCabinetStore } from "@/store/cabinet-store"
import * as THREE from "three"

interface DirectManipulationControlsProps {
  objectId: string
}

export default function DirectManipulationControls({ objectId }: DirectManipulationControlsProps) {
  // This component has been disabled to remove the ability to resize or move cabinets
  return null
}
