import { create } from "zustand"

interface BlankStoreState {
  // Basic selection
  selectedPart: string | null
  setSelectedPart: (id: string | null) => void
  
  // Basic history
  history: any[]
  currentHistoryIndex: number
  saveToHistory: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

// Create blank store with just basic functionality
export const useBlankStore = create<BlankStoreState>()((set, get) => ({
  // Basic selection
  selectedPart: null,
  setSelectedPart: (id) => set({ selectedPart: id }),
  
  gridVisible: true,
  gridSize: 4,
  gridColor: "#CCCCCC",
  snapToGrid: true,

  
  // Basic history
  history: [],
  currentHistoryIndex: -1,
  saveToHistory: () => {
    const currentState = {
      selectedPart: get().selectedPart,
    }

    // Truncate future history if we're not at the end
    const newHistory = [...get().history.slice(0, get().currentHistoryIndex + 1), currentState]

    // Limit history length to prevent memory issues
    const maxHistoryLength = 50
    if (newHistory.length > maxHistoryLength) {
      newHistory.shift()
    }

    set({
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1,
    })
  },
  undo: () => {
    const { history, currentHistoryIndex } = get()
    if (currentHistoryIndex > 0) {
      const previousState = history[currentHistoryIndex - 1]
      set({
        selectedPart: previousState.selectedPart,
        currentHistoryIndex: currentHistoryIndex - 1,
      })
    }
  },
  redo: () => {
    const { history, currentHistoryIndex } = get()
    if (currentHistoryIndex < history.length - 1) {
      const nextState = history[currentHistoryIndex + 1]
      set({
        selectedPart: nextState.selectedPart,
        currentHistoryIndex: currentHistoryIndex + 1,
      })
    }
  },
  canUndo: () => get().currentHistoryIndex > 0,
  canRedo: () => get().currentHistoryIndex < get().history.length - 1,
})) 