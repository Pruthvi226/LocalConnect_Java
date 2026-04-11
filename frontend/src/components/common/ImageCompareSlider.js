import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const ImageCompareSlider = ({ beforeImage, afterImage, height = "500px" }) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const scrollX = x - rect.left;
    const percentage = (scrollX / rect.width) * 100;
    
    setPosition(Math.min(100, Math.max(0, percentage)));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-[2.5rem] shadow-premium select-none group cursor-ew-resize"
      style={{ height }}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* After Image (Background) */}
      <img 
        src={afterImage} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Before Image (Clip) */}
      <div 
        className="absolute inset-0 h-full overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img 
          src={beforeImage} 
          alt="Before" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${100 / (position / 100)}%` }} // Prevent stretching
          // Fixed width approach:
          dangerouslySetInnerHTML={{ __html: `<img src="${beforeImage}" style="width: ${containerRef.current?.offsetWidth}px; height: ${height}; object-fit: cover;" />` }}
        />
        {/* React standard for non-stretched clip: */}
        <div 
          className="absolute inset-0 h-full"
          style={{ 
            backgroundImage: `url(${beforeImage})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'left center',
            width: containerRef.current?.offsetWidth || '100%'
          }} 
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.3)] z-10"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-primary-50">
          <ChevronLeft className="w-4 h-4 text-primary-600 -mr-1" />
          <ChevronRight className="w-4 h-4 text-primary-600 -ml-1" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl text-white text-[10px] font-black uppercase tracking-widest pointer-events-none">
        Before
      </div>
      <div className="absolute bottom-6 right-6 px-4 py-2 bg-primary-600/60 backdrop-blur-md rounded-xl text-white text-[10px] font-black uppercase tracking-widest pointer-events-none">
        After
      </div>
    </div>
  );
};

export default ImageCompareSlider;
