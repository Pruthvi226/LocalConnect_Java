import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const FlashAssistButton = ({ onClick }) => {
  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed bottom-24 right-8 z-[150] flex flex-col items-center gap-2"
    >
      <div className="relative">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.2, 0.5]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-rose-500 rounded-full"
        />
        <button 
          onClick={onClick}
          className="relative w-16 h-16 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-rose-300 transition-all hover:scale-110 active:scale-95 group"
        >
           <Zap className="w-8 h-8 fill-white group-hover:animate-bounce" />
           
           {/* Tooltip */}
           <div className="absolute right-full mr-4 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all pointer-events-none shadow-xl border border-white/10">
              Emergency SOS Assist
           </div>
        </button>
      </div>
      <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">Flash SOS</span>
    </motion.div>
  );
};

export default FlashAssistButton;
