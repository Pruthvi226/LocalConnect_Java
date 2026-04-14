import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

const PortfolioGallery = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-slate-400">
        <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-bold text-sm">No portfolio images uploaded yet.</p>
      </div>
    );
  }

  const handleOpen = (index) => {
    setCurrentIndex(index);
    setSelectedImage(images[index]);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    const nextIdx = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIdx);
    setSelectedImage(images[nextIdx]);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    const prevIdx = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIdx);
    setSelectedImage(images[prevIdx]);
  };

  return (
    <div className="w-full">
      {/* Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="relative group cursor-zoom-in rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-200"
            onClick={() => handleOpen(idx)}
          >
            <img 
              src={img} 
              alt={`Portfolio ${idx}`} 
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
                <Maximize2 className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox / Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all z-[110]"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full max-w-6xl max-h-[85vh] flex items-center justify-center">
              <button 
                className="absolute left-0 p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all z-[110]"
                onClick={handlePrev}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <motion.img
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={selectedImage}
                alt="Selected portfolio"
                className="max-w-full max-h-full object-contain rounded-[2rem] shadow-2xl"
              />

              <button 
                className="absolute right-0 p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all z-[110]"
                onClick={handleNext}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-white font-black text-xs uppercase tracking-widest">
              {currentIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioGallery;
