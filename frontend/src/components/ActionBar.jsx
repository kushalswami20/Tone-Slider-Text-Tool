import React from 'react';

/**
 * ActionBar component with undo, redo, and reset controls
 * @param {Object} props
 * @param {function} props.onUndo - Function to call on undo
 * @param {function} props.onRedo - Function to call on redo
 * @param {function} props.onReset - Function to call on reset
 * @param {boolean} props.canUndo - Whether undo is available
 * @param {boolean} props.canRedo - Whether redo is available
 * @param {boolean} props.isLoading - Whether an action is in progress
 */
const ActionBar = ({ 
  onUndo, 
  onRedo, 
  onReset, 
  canUndo, 
  canRedo, 
  isLoading 
}) => {
  return (
    <div className="action-bar">
      <button 
        onClick={onUndo} 
        disabled={!canUndo || isLoading}
        className="action-button undo-button"
        title="Undo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6"></path>
          <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path>
        </svg>
        <span>Undo</span>
      </button>
      
      <button 
        onClick={onRedo} 
        disabled={!canRedo || isLoading}
        className="action-button redo-button"
        title="Redo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 7v6h-6"></path>
          <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"></path>
        </svg>
        <span>Redo</span>
      </button>
      
      <button 
        onClick={onReset} 
        disabled={isLoading}
        className="action-button reset-button"
        title="Reset to Default"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 2v6h6"></path>
          <path d="M21 12A9 9 0 002 12a9 9 0 0019.938-5.036A9 9 0 0121 12z"></path>
        </svg>
        <span>Reset</span>
      </button>
    </div>
  );
};

export default ActionBar;