import React from 'react';

/**
 * TextEditor component for entering and editing text
 * @param {Object} props
 * @param {string} props.text - Current text content
 * @param {function} props.onChange - Function to call when text changes
 * @param {boolean} props.isLoading - Whether a tone adjustment is in progress
 * @param {boolean} props.disabled - Whether the editor is disabled
 */
const TextEditor = ({ 
  text = '', 
  onChange, 
  isLoading = false,
  disabled = false
}) => {
  // Convert null or undefined to empty string
  const safeText = text !== null && text !== undefined ? text : '';
  
  const handleChange = (e) => {
    // Check if onChange is a function before calling it
    if (typeof onChange === 'function') {
      onChange(e.target.value);
    } else {
      console.warn('TextEditor: onChange prop is not a function');
    }
  };

  return (
    <div className="text-editor">
      <textarea
        value={safeText}
        onChange={handleChange}
        disabled={isLoading || disabled}
        placeholder="Enter text to adjust tone..."
        className={`editor-textarea ${isLoading ? 'loading' : ''}`}
      />
      {isLoading && (
        <div className="editor-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default TextEditor;
