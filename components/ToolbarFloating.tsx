import React from "react"
import { ChevronDown } from "lucide-react"

interface ToolbarButtonProps {
  icon: React.ReactNode
  hasDropdown?: boolean
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, hasDropdown = false }) => {
  return (
    <div className="relative flex items-center justify-center w-10 h-10 cursor-pointer hover:bg-gray-100 rounded-md transition-colors">
      <div className="flex items-center justify-center">{icon}</div>
      {hasDropdown && (
        <div className="absolute right-0 bottom-0 p-0.5">
          <ChevronDown size={12} />
        </div>
      )}
    </div>
  )
}

const ToolbarFloating: React.FC = () => {
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
      />

      {/* Square/Rectangle tool */}
      <ToolbarButton
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="16" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        }
        hasDropdown
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
      />

      {/* Code view */}
      <div className="h-10 px-3 bg-gray-100 rounded-md flex items-center justify-center ml-1">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 18L22 12L16 6M8 6L2 12L8 18"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

export default ToolbarFloating 