"use client"

import { useEffect, useRef, useState } from "react"
import { useThree } from "@react-three/fiber"
import { TransformControls as DreiTransformControls } from "@react-three/drei"
import { useCabinetStore } from "@/store/cabinet-store"
import type * as THREE from "three"

export default function TransformControls() {
  // This component has been disabled to remove the ability to move cabinets
  return null
}
