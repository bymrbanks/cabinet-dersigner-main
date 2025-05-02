import React, { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import InsertCabinetButton from './cabinet/InsertCabinetButton'

interface ToolbarButtonProps {
  icon: React.ReactNode
  hasDropdown?: boolean
  isActive?: boolean
  onClick?: () => void
  tooltip?: string
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon, 
  hasDropdown = false, 
  isActive = false, 
  onClick,
  tooltip
}) => {
  return (
    <div 
      className={`relative flex items-center justify-center w-10 h-10 cursor-pointer ${isActive ? 'bg-blue-100' : 'hover:bg-gray-100'} rounded-md transition-colors group`}
      onClick={onClick}
    >
      <div className="flex items-center justify-center">{icon}</div>
      {hasDropdown && (
        <div className="absolute right-0 bottom-0 p-0.5">
          <ChevronDown size={12} />
        </div>
      )}
      
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </div>
  )
}

// Create a tool mode context that can be accessed by other components
export type ToolMode = 'select' | 'layout' | 'delete' | 'object-move'

export interface ToolbarState {
  toolMode: ToolMode
  setToolMode: (mode: ToolMode) => void
  listeners: Array<(mode: ToolMode) => void>
  defaultHeight: number
  setDefaultHeight: (height: number) => void
  defaultFootprintWidth: number
  defaultFootprintDepth: number
  defaultFootprintHeight: number
  useCabinetTemplate: boolean
}

// Create a central store for toolbar state
export let toolbarState: ToolbarState = {
  toolMode: 'select' as ToolMode,
  setToolMode: (mode: ToolMode) => {
    console.log("Toolbar state: Setting mode to", mode);
    toolbarState.toolMode = mode
    
    // Notify all listeners
    console.log(`Notifying ${toolbarState.listeners.length} listeners about mode change to ${mode}`);
    if (toolbarState.listeners.length > 0) {
      toolbarState.listeners.forEach(listener => {
        try {
          listener(mode);
          console.log("Successfully notified listener");
        } catch (error) {
          console.error("Error notifying listener:", error);
        }
      });
    }
  },
  listeners: [] as Array<(mode: ToolMode) => void>,
  defaultHeight: 2,
  setDefaultHeight: (height: number) => {
    console.log("Setting default height to", height);
    toolbarState.defaultHeight = height;
  },
  defaultFootprintWidth: 24,
  defaultFootprintDepth: 24,
  defaultFootprintHeight: 30,
  useCabinetTemplate: false
}

// Function to get the current tool mode without using hooks
export const getCurrentToolMode = (): ToolMode => {
  return toolbarState.toolMode;
}

// Function to get the default footprint width
export const getDefaultFootprintWidth = (): number => {
  return toolbarState.defaultFootprintWidth;
}

// Function to get the default footprint depth
export const getDefaultFootprintDepth = (): number => {
  return toolbarState.defaultFootprintDepth;
}

// Function to get the default footprint height
export const getDefaultFootprintHeight = (): number => {
  return toolbarState.defaultFootprintHeight;
}

// Function to check if we should use the cabinet template
export const usesCabinetTemplate = (): boolean => {
  return toolbarState.useCabinetTemplate;
}

// Function to subscribe to toolbar state changes
export function useToolbarState(onChange: (mode: ToolMode) => void) {
  React.useEffect(() => {
    console.log("Subscribing to toolbar state changes");
    
    // Immediately notify with current state
    try {
      onChange(toolbarState.toolMode);
    } catch (error) {
      console.error("Error notifying new listener with current state:", error);
    }
    
    // Add to listeners
    toolbarState.listeners.push(onChange);
    console.log(`Now ${toolbarState.listeners.length} listeners registered`);
    
    return () => {
      console.log("Unsubscribing from toolbar state changes");
      toolbarState.listeners = toolbarState.listeners.filter(l => l !== onChange);
      console.log(`Now ${toolbarState.listeners.length} listeners registered after unsubscribe`);
    }
  }, [onChange])
  
  return {
    currentMode: toolbarState.toolMode,
    setToolMode: toolbarState.setToolMode
  }
}

// Layout settings panel component
const LayoutSettingsPanel: React.FC = () => {
  const [height, setHeight] = useState(toolbarState.defaultHeight);
  
  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    toolbarState.setDefaultHeight(newHeight);
  };
  
  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg p-3 w-64">
      <div className="text-sm font-medium mb-2">Layout Settings</div>
      <div className="space-y-2">
        <div>
          <Label htmlFor="default-height" className="text-xs">Default Height</Label>
          <Input
            id="default-height"
            type="number"
            value={height}
            onChange={(e) => handleHeightChange(parseFloat(e.target.value) || 1)}
            min={0.5}
            max={10}
            step={0.5}
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
};

const ToolbarFloating: React.FC = () => {
  const [activeToolMode, setActiveToolMode] = useState<ToolMode>('select')
  
  // Sync with global toolbar state on mount
  useEffect(() => {
    setActiveToolMode(toolbarState.toolMode)
  }, [])
  
  const handleToolModeChange = (mode: ToolMode) => {
    console.log("Toolbar: Setting tool mode to", mode);
    setActiveToolMode(mode)
    toolbarState.setToolMode(mode)
  }

  return (
    <>
      {activeToolMode === 'layout' && <LayoutSettingsPanel />}
      
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-full shadow-lg py-2 px-2 flex items-center space-x-1">
        {/* Arrow/Selection tool */}
        <ToolbarButton
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5 5L10 15L12 10L17 12L5 5Z"
                fill="#3B82F6"
                stroke="#3B82F6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          hasDropdown
          isActive={activeToolMode === 'select'}
          onClick={() => handleToolModeChange('select')}
          tooltip="Selection Tool (Esc)"
        />

        {/* Grid tool */}
        <ToolbarButton
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 3H3V9H9V3Z M21 3H15V9H21V3Z M9 15H3V21H9V15Z M21 15H15V21H21V15Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          hasDropdown
          tooltip="Grid Settings"
        />

        {/* Square/Rectangle tool - Layout Mode */}
        <ToolbarButton
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="16" height="16" rx="1" stroke={activeToolMode === 'layout' ? "#3B82F6" : "currentColor"} strokeWidth="1.5" />
              {activeToolMode === 'layout' && <rect x="7" y="7" width="10" height="10" fill="#3B82F6" fillOpacity="0.2" />}
            </svg>
          }
          hasDropdown
          isActive={activeToolMode === 'layout'}
          onClick={() => handleToolModeChange('layout')}
          tooltip={activeToolMode === 'layout' ? "Click on floor to add boxes (Esc to exit)" : "Layout Mode - Draw Floor Boxes"}
        />

        {/* Shape/Draw tool */}
        <ToolbarButton
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 4C7 4 3 8 3 13C3 18 7 20 12 20C17 20 21 18 21 13C21 8 17 4 12 4Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          hasDropdown
          tooltip="Shape Tools"
        />

        {/* Text tool */}
        <ToolbarButton
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 6H20M12 6V18M7 18H17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          tooltip="Text Tool"
        />

        {/* Edit tool */}
        <ToolbarButton
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" fill="#EF4444" />
            </svg>
          }
          hasDropdown
          tooltip="Edit Options"
        />

        {/* Components tool */}
        <ToolbarButton
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 4L20 8.5V15.5L12 20L4 15.5V8.5L12 4Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M12 12L20 8M12 12V20M12 12L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          tooltip="Components"
        />

        {/* Insert Cabinet button */}
        <InsertCabinetButton />
      </div>
    </>
  )
}

export default ToolbarFloating 