import React, { useState, useEffect, useCallback } from 'react';
import TextEditor from './components/TextEditor';
import ToneSlider from './components/ToneSlider';
import ActionBar from './components/ActionBar';
import useUndoRedoState from './hooks/useUndoRedoState';
import { adjustTextTone } from './services/toneService';
import './App.css';

// Toast component for notifications
const Toast = ({ message, type = 'success', onClose }) => {
  // Close toast after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className={`toast ${type ? `toast--${type}` : ''}`}>
      {type === 'error' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      )}
      {type === 'success' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="16 12 12 16 8 12"></polyline>
          <line x1="12" y1="8" x2="12" y2="16"></line>
        </svg>
      )}
      {type === 'warning' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      )}
      <span>{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Close notification">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

// Status indicator component to show processing status
const StatusIndicator = ({ status, message }) => {
  return (
    <div className={`status-indicator status-indicator--${status}`}>
      {status === 'processing' && (
        <div className="spinner"></div>
      )}
      {status === 'success' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )}
      {status === 'error' && (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      )}
      <span>{message}</span>
    </div>
  );
};

const App = () => {
  // Initialize with default values
  const defaultText = 'Enter your text here and adjust the tone using the slider.';
  const defaultTone = 50;
  
  // State for text and tone with undo/redo
  const textState = useUndoRedoState(defaultText);
  const toneState = useUndoRedoState(defaultTone);
  
  // State for API interaction
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adjustedText, setAdjustedText] = useState('');
  const [processingStatus, setProcessingStatus] = useState(null); // 'processing', 'success', 'error'
  
  // Toast notification state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  // Local storage persistence
  useEffect(() => {
    try {
      const savedText = localStorage.getItem('toneSliderText');
      const savedTone = localStorage.getItem('toneSliderTone');
      const savedAdjusted = localStorage.getItem('toneSliderAdjusted');
      
      if (savedText) {
        textState.setValue(savedText);
      }
      
      if (savedTone) {
        const parsedTone = parseInt(savedTone, 10);
        if (!isNaN(parsedTone)) {
          toneState.setValue(parsedTone);
        }
      }
      
      if (savedAdjusted) {
        setAdjustedText(savedAdjusted);
      }
    } catch (err) {
      console.error('Error loading from local storage:', err);
      showToast('Failed to load saved data', 'error');
    }
  }, []);
  
  // Save to local storage when state changes
  useEffect(() => {
    try {
      localStorage.setItem('toneSliderText', textState.value);
      localStorage.setItem('toneSliderTone', String(toneState.value));
      
      if (adjustedText) {
        localStorage.setItem('toneSliderAdjusted', adjustedText);
      }
    } catch (err) {
      console.error('Error saving to local storage:', err);
      // Only show toast for critical errors to avoid too many notifications
      if (!toast.visible) {
        showToast('Failed to save your changes', 'warning');
      }
    }
  }, [textState.value, toneState.value, adjustedText, toast.visible]);
  
  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };
  
  // Hide toast message
  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };
  
  // Debounced tone adjustment
  const updateTone = useCallback(async () => {
    if (!textState.value || !textState.value.trim()) {
      setAdjustedText('');
      setProcessingStatus(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    setProcessingStatus('processing');
    
    try {
      // Adding a minimum loading time for better UX
      const startTime = Date.now();
      const result = await adjustTextTone(textState.value, toneState.value);
      
      // Ensure loading shows for at least 500ms to prevent flashing
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsedTime));
      }
      
      setAdjustedText(result);
      setProcessingStatus('success');
      
      // Show success toast only on first successful adjustment or after an error
      if (!adjustedText || error) {
        showToast('Text tone adjusted successfully', 'success');
      }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(`Failed to adjust text: ${errorMessage}`);
      console.error('API Error:', err);
      showToast('Failed to adjust text tone', 'error');
      setProcessingStatus('error');
    } finally {
      setLoading(false);
      
      // Reset the status indicator after a delay
      setTimeout(() => {
        if (processingStatus === 'success' || processingStatus === 'error') {
          setProcessingStatus(null);
        }
      }, 3000);
    }
  }, [textState.value, toneState.value, adjustedText, error]);
  
  // Debounce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (textState.value.trim()) {
        updateTone();
      }
    }, 800); // Delay API calls by 800ms
    
    return () => clearTimeout(timer);
  }, [updateTone]);
  
  // Reset all state
  const handleReset = useCallback(() => {
    // Add confirmation dialog
    if (window.confirm('Are you sure you want to reset all content?')) {
      textState.reset();
      toneState.reset();
      setAdjustedText('');
      setError(null);
      setProcessingStatus(null);
      showToast('All content has been reset', 'success');
    }
  }, [textState, toneState]);
  
  // Handle undo action with visual feedback
  const handleUndo = () => {
    const textCanUndo = textState.canUndo;
    const toneCanUndo = toneState.canUndo;
    
    if (textCanUndo) textState.undo();
    if (toneCanUndo) toneState.undo();
    
    if (textCanUndo || toneCanUndo) {
      showToast('Change undone', 'success');
    }
  };
  
  // Handle redo action with visual feedback
  const handleRedo = () => {
    const textCanRedo = textState.canRedo;
    const toneCanRedo = toneState.canRedo;
    
    if (textCanRedo) textState.redo();
    if (toneCanRedo) toneState.redo();
    
    if (textCanRedo || toneCanRedo) {
      showToast('Change redone', 'success');
    }
  };
  
  // Copy adjusted text to clipboard
  const handleCopyText = () => {
    if (adjustedText) {
      navigator.clipboard.writeText(adjustedText)
        .then(() => {
          showToast('Text copied to clipboard', 'success');
        })
        .catch(err => {
          console.error('Failed to copy text:', err);
          showToast('Failed to copy text', 'error');
        });
    }
  };
  
  // Handle retry on error
  const handleRetry = () => {
    setError(null);
    updateTone();
    showToast('Retrying...', 'info');
  };
  
  return (
    <div className="app">
      <header className="app__header">
        <h1>Tone Slider Text Tool</h1>
        <p>Adjust the tone of your text from formal to casual</p>
      </header>
      
      <main className="app__content">
        <div className="app__editor-container">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Input Text
          </h2>
          <TextEditor 
            text={textState.value} 
            onChange={textState.setValue} 
            isLoading={loading}
            disabled={false}
            placeholder="Start typing here to adjust the tone..."
          />
          <div className="word-count">
            {textState.value ? `${textState.value.trim().split(/\s+/).length} words` : '0 words'}
          </div>
        </div>
        
        <div className="app__controls-container">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Adjust Tone
          </h2>
          <ToneSlider 
            value={toneState.value} 
            onChange={toneState.setValue} 
            disabled={loading}
          />
          
          <ActionBar 
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleReset}
            canUndo={textState.canUndo || toneState.canUndo}
            canRedo={textState.canRedo || toneState.canRedo}
            isLoading={loading}
          />
          
          {processingStatus && (
            <StatusIndicator 
              status={processingStatus} 
              message={
                processingStatus === 'processing' ? 'Adjusting tone...' : 
                processingStatus === 'success' ? 'Tone adjusted successfully' : 
                'Failed to adjust tone'
              } 
            />
          )}
          
          {error && (
            <div className="app__error-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div className="error-content">
                <div>{error}</div>
                <button className="retry-button" onClick={handleRetry}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <section className="app__output">
        <div className="app__output-header">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Adjusted Text
          </h2>
          
          {adjustedText && (
            <button 
              className="copy-button"
              onClick={handleCopyText}
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </button>
          )}
        </div>
        
        <div className={`app__output-container ${loading ? 'app__output-container--loading' : ''}`}>
          {loading ? (
            <div className="app__loading">
              <div className="spinner"></div>
              <span>Processing your text...</span>
            </div>
          ) : adjustedText ? (
            <div className="app__output-text">{adjustedText}</div>
          ) : (
            <div className="app__output-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <p>Adjusted text will appear here after you input text and set your desired tone.</p>
            </div>
          )}
        </div>
        
        {adjustedText && (
          <div className="word-count output-word-count">
            {adjustedText.trim().split(/\s+/).length} words
          </div>
        )}
      </section>
      
      <footer className="app__footer">
        <p>© 2025 Tone Slider Text Tool. All rights reserved.</p>
        <div className="app__footer-links">
          <a href="#help" className="footer-link">Help</a>
          <a href="#privacy" className="footer-link">Privacy</a>
          <a href="#terms" className="footer-link">Terms</a>
        </div>
      </footer>
      
      {/* Conditionally show the toast */}
      {toast.visible && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default App;