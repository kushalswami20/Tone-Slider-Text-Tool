import React from 'react';

/**
 * Enhanced ToneSlider component with better visual feedback
 * @param {Object} props
 * @param {number} props.value - Current tone value (0-100)
 * @param {function} props.onChange - Function to call when tone changes
 * @param {boolean} props.disabled - Whether the slider is disabled
 */
const ToneSlider = ({ 
  value = 50, 
  onChange, 
  disabled = false 
}) => {
  // Ensure value is within valid range
  const safeValue = Math.min(Math.max(0, value), 100);
  
  // Generate tone description based on value
  const getToneDescription = (val) => {
    if (val < 20) return "Very formal and professional";
    if (val < 40) return "Formal and structured";
    if (val < 60) return "Neutral and balanced";
    if (val < 80) return "Casual and conversational";
    return "Very casual and friendly";
  };

  // Calculate background gradient position based on value
  const trackStyle = {
    background: `linear-gradient(to right, 
      #3498db ${Math.min(safeValue, 20)}%, 
      #2ecc71 ${Math.max(20, Math.min(safeValue, 80))}%, 
      #f39c12 ${Math.max(80, safeValue)}%)`
  };

  const handleChange = (e) => {
    if (typeof onChange === 'function') {
      onChange(Number(e.target.value));
    } else {
      console.warn('ToneSlider: onChange prop is not a function');
    }
  };

  return (
    <div className="tone-slider">
      <div className="tone-slider__labels">
        <span>Formal</span>
        <span>Neutral</span>
        <span>Casual</span>
      </div>
      
      <div className="tone-slider__track" style={trackStyle}>
        <input
          type="range"
          className="tone-slider__input"
          min="0"
          max="100"
          step="1"
          value={safeValue}
          onChange={handleChange}
          disabled={disabled}
          aria-label="Adjust text tone"
        />
      </div>
      
      <div className="tone-slider__value">
        {safeValue}%
      </div>
      
      <div className="tone-slider__description">
        {getToneDescription(safeValue)}
      </div>
    </div>
  );
};

export default ToneSlider;