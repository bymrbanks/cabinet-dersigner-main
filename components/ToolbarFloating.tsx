import React, { useState } from "react"
import { ChevronDown } from "lucide-react"

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
export type ToolMode = 'select' | 'layout' | 'other'

export interface ToolbarState {
  toolMode: ToolMode
  setToolMode: (mode: ToolMode) => void
  listeners: Array<(mode: ToolMode) => void>
}

// Create a central store for toolbar state
let toolbarState: ToolbarState = {
  toolMode: 'select',
  setToolMode: (mode: ToolMode) => {
    toolbarState.toolMode = mode
    if (toolbarState.listeners.length > 0) {
      toolbarState.listeners.forEach(listener => listener(mode))
    }
  },
  listeners: [] as Array<(mode: ToolMode) => void>
}

// Function to subscribe to toolbar state changes
export function useToolbarState(onChange: (mode: ToolMode) => void) {
  React.useEffect(() => {
    toolbarState.listeners.push(onChange)
    return () => {
      toolbarState.listeners = toolbarState.listeners.filter(l => l !== onChange)
    }
  }, [onChange])
  
  return {
    currentMode: toolbarState.toolMode,
    setToolMode: toolbarState.setToolMode
  }
}

const ToolbarFloating: React.FC = () => {
  const [activeToolMode, setActiveToolMode] = useState<ToolMode>('select')
  
  const handleToolModeChange = (mode: ToolMode) => {
    console.log("Toolbar: Setting tool mode to", mode);
    setActiveToolMode(mode)
    toolbarState.setToolMode(mode)
  }

  return (
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

      {/* Code view */}
      <div className="h-10 px-3 bg-gray-100 rounded-md flex items-center justify-center ml-1 relative group cursor-pointer">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 18L22 12L16 6M8 6L2 12L8 18"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          View Code
        </div>
      </div>
    </div>
  )
}

export default ToolbarFloating 