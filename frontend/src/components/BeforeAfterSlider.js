import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const BeforeAfterSlider = ({ before, after, label = "Restoration Proof" }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (client) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(client.clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    }
  };

  const handleMouseMove = (e) => handleMove(e);
  const handleTouchMove = (e) => handleMove(e.touches[0]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</h4>
        <div className="flex gap-4">
          <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100 uppercase tracking-tighter">Before</span>
          <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase tracking-tighter">After</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden cursor-ew-resize select-none bg-slate-900 shadow-2xl transition-all hover:shadow-primary-100"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Background) */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${after})` }}
        />

        {/* Before Image (Foreground with Clip) */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${before})`,
            clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
          }}
        />

        {/* Divider Line */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Slider Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center border-4 border-slate-100">
             <div className="flex gap-1">
                <div className="w-1 h-4 bg-slate-300 rounded-full" />
                <div className="w-1 h-4 bg-slate-300 rounded-full" />
             </div>
          </div>
        </div>

        {/* Labels Overlay */}
        <div className="absolute bottom-6 left-6 z-30 pointer-events-none">
           <div className="bg-black/40 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-white font-black text-[10px] uppercase tracking-widest">
              Slide to Compare Results
           </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
