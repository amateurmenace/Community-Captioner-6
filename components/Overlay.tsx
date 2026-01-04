
import React, { useEffect, useRef, useState } from 'react';
import { OverlaySettings } from '../types';
import { ArrowLeft } from 'lucide-react';

interface OverlayProps {
  currentCaption: string;
  isPartial: boolean;
  settings: OverlaySettings;
  onBack?: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ currentCaption, isPartial, settings, onBack }) => {
  const [showControls, setShowControls] = useState(false);

  const LINE_HEIGHT = 1.5;
  
  // Create styles that dynamically grow but cap at max lines
  const boxStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${settings.x}%`,
    top: `${settings.y}%`,
    width: `${settings.width}%`,
    backgroundColor: settings.backgroundColor,
    color: settings.color,
    fontFamily: settings.fontFamily,
    fontSize: `${settings.fontSize}px`,
    lineHeight: LINE_HEIGHT,
    textAlign: settings.textAlign,
    padding: '1rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end', // Pushes text to bottom
    transition: 'all 0.15s ease-out'
  };

  // We use a separate container to enforce the max-height limit based on lines
  // max-height = (fontSize * lineHeight * maxLines) + vertical padding
  const maxHeight = (settings.fontSize * LINE_HEIGHT * settings.maxLines) + 32; // 32 is padding top+bottom (1rem+1rem)

  return (
    <div 
        className="w-full h-screen relative obs-transparent overflow-hidden"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
    >
      {onBack && (
          <div className={`absolute top-4 right-4 z-50 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              <button 
                onClick={onBack}
                className="bg-stone-900/80 hover:bg-forest-dark text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 backdrop-blur-sm shadow-lg"
              >
                  <ArrowLeft size={16} /> Return to Dashboard
              </button>
          </div>
      )}

      {/* The Container with Max Height */}
      <div style={{...boxStyle, maxHeight: `${maxHeight}px`}} className="overflow-hidden">
        {/* The Content Wrapper - Logic: If text is long, justify-content: flex-end on parent pushes it up.
            Overflow hidden on parent cuts off the TOP, not the bottom. */}
        <div className="w-full">
             <p 
              className="font-semibold tracking-wide break-words whitespace-pre-wrap"
              style={{ margin: 0 }}
             >
            {currentCaption}
            {isPartial && <span className="opacity-50 animate-pulse">_</span>}
            </p>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
