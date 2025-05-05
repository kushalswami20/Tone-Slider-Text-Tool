import { useState, useCallback } from 'react';

/**
 * Custom hook for managing state with undo/redo functionality
 * @param {any} initialValue - The initial value for the state
 * @param {number} maxHistory - Maximum number of history states to keep
 * @returns {Object} - State object with value, setValue, undo, redo, etc.
 */
const useUndoRedoState = (initialValue, maxHistory = 50) => {
  // State for current value
  const [value, setInternalValue] = useState(initialValue);
  
  // State for history tracking
  const [history, setHistory] = useState([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  /**
   * Update the value and add to history
   * @param {any} newValue - New value to set
   */
  const setValue = useCallback((newValue) => {
    setInternalValue(newValue);
    
    // Add to history, but only if it's different from the current value
    setHistory(prevHistory => {
      // Create a new history array with items up to current index
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      
      // Check if the new value is different from the current value
      const lastValue = newHistory[newHistory.length - 1];
      const valueChanged = JSON.stringify(lastValue) !== JSON.stringify(newValue);
      
      if (valueChanged) {
        // Add new value to history, trim if needed
        const updatedHistory = [...newHistory, newValue];
        if (updatedHistory.length > maxHistory) {
          updatedHistory.shift();
        }
        
        // Update the index to point to the new value
        setHistoryIndex(updatedHistory.length - 1);
        return updatedHistory;
      }
      
      return newHistory;
    });
  }, [historyIndex, maxHistory]);
  
  /**
   * Undo the last change
   */
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setInternalValue(history[newIndex]);
    }
  }, [history, historyIndex]);
  
  /**
   * Redo a previously undone change
   */
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setInternalValue(history[newIndex]);
    }
  }, [history, historyIndex]);
  
  /**
   * Reset the state to the initial value
   */
  const reset = useCallback(() => {
    setInternalValue(initialValue);
    setHistory([initialValue]);
    setHistoryIndex(0);
  }, [initialValue]);
  
  return {
    value,
    setValue,
    undo,
    redo,
    reset,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    historyLength: history.length
  };
};

export default useUndoRedoState;