// hooks/useUndoRedoState.js
import { useState, useCallback } from 'react';

/**
 * Custom hook that provides undo/redo functionality for any state
 * @param {any} initialValue - The initial state value
 * @param {any} defaultValue - The default state value to reset to (optional)
 * @returns {Object} An object containing the current value, methods to update it, and undo/redo state
 */
const useUndoRedoState = (initialValue, defaultValue = initialValue) => {
  // Main current value
  const [value, setValue] = useState(initialValue);
  
  // History stacks
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  
  // Update value and add to history
  const updateValue = useCallback((newValue) => {
    // If it's a function, call it with the current value
    const updatedValue = typeof newValue === 'function' 
      ? newValue(value) 
      : newValue;
    
    // Only update if value actually changed
    if (updatedValue !== value) {
      // Save current value to history before updating
      setPast(prev => [...prev, value]);
      
      // Clear future history on new changes
      setFuture([]);
      
      // Update the current value
      setValue(updatedValue);
    }
  }, [value]);
  
  // Undo - go back to previous state
  const undo = useCallback(() => {
    if (past.length > 0) {
      // Get the last item from past
      const newPast = [...past];
      const previousValue = newPast.pop();
      
      // Move current value to future
      setFuture(prev => [value, ...prev]);
      
      // Update states
      setPast(newPast);
      setValue(previousValue);
    }
  }, [past, value]);
  
  // Redo - go forward to next state
  const redo = useCallback(() => {
    if (future.length > 0) {
      // Get the first item from future
      const [nextValue, ...newFuture] = future;
      
      // Move current value to past
      setPast(prev => [...prev, value]);
      
      // Update states
      setFuture(newFuture);
      setValue(nextValue);
    }
  }, [future, value]);
  
  // Reset to default value
  const reset = useCallback(() => {
    setValue(defaultValue);
    setPast([]);
    setFuture([]);
  }, [defaultValue]);
  
  return {
    value,
    setValue: updateValue,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0
  };
};

export default useUndoRedoState;