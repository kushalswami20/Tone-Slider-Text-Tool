/**
 * Service for interacting with the tone adjustment API
 */

// API base URL - change this to match your deployed backend
// Using a direct value instead of process.env 
const API_BASE_URL = import.meta.env?.VITE_API_URL || 
                     window.ENV?.API_URL || 
                     'http://localhost:5001/api/v1';

/**
 * Adjust the tone of text using the Mistral AI API
 * @param {string} text - The text to adjust
 * @param {number} toneValue - The target tone value (0-100, formal to casual)
 * @returns {Promise<string>} - The tone-adjusted text
 * @throws {Error} - If the API request fails
 */
export const adjustTextTone = async (text, toneValue) => {
  try {
    // Don't make unnecessary API calls for empty text
    if (!text.trim()) {
      return text;
    }
    
    // FIXED: Changed from '/adjust-tone' to '/tone' to match backend route
    const response = await fetch(`${API_BASE_URL}/tone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, toneValue }),
    });
    
    // Handle HTTP errors
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    // FIXED: Updated to correctly extract the adjusted text based on API response format
    return data.data?.adjustedText || data.adjustedText || text;
  } catch (error) {
    console.error('Error adjusting tone:', error);
    
    // Enhance error message based on type of error
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
};

/**
 * Get the server status to check if it's online
 * @returns {Promise<boolean>} - Whether the server is online
 */
export const checkServerStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    return response.ok;
  } catch (error) {
    return false;
  }
};