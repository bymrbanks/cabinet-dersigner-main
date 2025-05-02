"use client"

import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { toolbarState } from "../ToolbarFloating";

interface InsertCabinetButtonProps {
  label?: string;
}

export default function InsertCabinetButton({ label = "Insert Cabinet" }: InsertCabinetButtonProps) {
  const handleInsertCabinet = useCallback(() => {
    // Set toolbar to layout mode and indicate we want to use cabinet template
    toolbarState.toolMode = 'layout';
    toolbarState.useCabinetTemplate = true;
    
    // Dispatch an event to notify any components that are listening
    const event = new CustomEvent('tool-mode-changed', {
      detail: { mode: 'layout', useCabinetTemplate: true }
    });
    window.dispatchEvent(event);
    
    console.log("Insert cabinet mode activated");
  }, []);
  
  return (
    <Button 
      onClick={handleInsertCabinet}
      variant="outline"
      className="flex items-center gap-2"
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
      {label}
    </Button>
  );
} 