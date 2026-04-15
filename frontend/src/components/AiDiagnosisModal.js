import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, CheckCircle, AlertTriangle, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

const SAMPLE_PROBLEMS = [
  {
    id: 1,
    name: "Leaking Faucet",
    category: "Plumbing",
    // Base64 for a simple faucet icon placeholder or similar can be used here
    // For now we'll just use these for UI selection
    description: "Water dripping from the main tap joint"
  },
  {
    id: 2,
    name: "Burnt Switch",
    category: "Electrical",
    description: "Burn marks around the plug socket"
  },
  {
    id: 3,
    name: "AC Not Cooling",
    category: "AC Repair",
    description: "Fan is running but no cooling provided"
  }
];

const AiDiagnosisModal = ({ isOpen, onClose, onFinishDiagnosis }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
      setError(null);
    }
  };

  const handleSampleSelect = (sample) => {
    // Simulating a real file selection for the sample
    setPreview("https://via.placeholder.com/400x300?text=" + encodeURIComponent(sample.name));
    setFile({ name: sample.name, type: 'image/jpeg', isSample: true });
    setError(null);
  };

  const startDiagnosis = async () => {
    if (!file && !preview) return;

    setIsScanning(true);
    setResult(null);

    try {
      // In a real production app, we'd send the base64 to /api/ai/diagnose
      // For this demo, we'll simulate the backend call or use dummy data if no API response
      
      const base64Content = preview.split(',')[1] || "";
      const mimeType = file?.type || 'image/jpeg';

      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Content, mimeType })
      });

      if (!response.ok) throw new Error('AI analysis failed');
      const data = await response.json();
      
      // Delay to show the cool animation
      setTimeout(() => {
        setResult(data);
        setIsScanning(false);
      }, 2000);

    } catch (err) {
      console.error("Diagnosis Error:", err);
      // Fallback result for demo if backend fails or isn't connected
      setTimeout(() => {
        setResult({
          issue: "Potential mechanical issue identified in the " + (file?.name || "system"),
          urgency: "MEDIUM",
          category: "General",
          estimatedLabor: "₹499 - ₹899",
          requiredParts: "Inspection required for part identification"
        });
        setIsScanning(false);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-indigo-500/10"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
              <Zap size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-none">Instant Fix AI-Scan</h2>
              <p className="text-sm text-slate-400 mt-1">AI-Powered Problem Diagnosis & Estimation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {!result && !isScanning ? (
            <div className="space-y-6">
              {/* Upload/Preview Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-300
                  ${preview ? 'border-indigo-500/50 aspect-video' : 'border-slate-800 hover:border-indigo-500/40 py-12'}`}
              >
                {preview ? (
                  <img src={preview} alt="Task Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                      <Camera size={28} />
                    </div>
                    <p className="text-white font-medium">Click to Upload or Take a Photo</p>
                    <p className="text-slate-500 text-sm mt-1 px-4">AI will analyze the technical fault and urgency</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
              </div>

              {/* Sample Assets */}
              {!preview && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Or try a sample problem</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SAMPLE_PROBLEMS.map(sample => (
                      <button 
                        key={sample.id}
                        onClick={() => handleSampleSelect(sample)}
                        className="p-3 text-left bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-white/5 transition-colors group"
                      >
                        <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">{sample.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{sample.category}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {preview && (
                <button 
                  onClick={startDiagnosis}
                  className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 group transition-all"
                >
                  <Zap size={20} className="group-hover:animate-pulse" />
                  Analyze Problem Now
                </button>
              )}
            </div>
          ) : isScanning ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 mb-8">
                {/* Radar effect */}
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-indigo-500 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-indigo-500 rounded-full text-white shadow-xl shadow-indigo-500/50">
                  <Zap size={40} className="animate-pulse" />
                </div>
                {/* Circular progress mask placeholder */}
                <svg className="absolute -inset-2 w-[112px] h-[112px] -rotate-90">
                  <circle 
                    cx="56" cy="56" r="52" 
                    fill="transparent" 
                    stroke="rgba(255,255,255,0.1)" 
                    strokeWidth="8"
                  />
                  <motion.circle 
                    cx="56" cy="56" r="52" 
                    fill="transparent" 
                    stroke="white" 
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 327" }}
                    animate={{ strokeDasharray: "327 327" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Analyzing Problem...</h3>
              <p className="text-slate-400 max-w-xs mx-auto">Gemini is identifying the technical fault and calculating parts estimation</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Results Container */}
              <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                {/* Urgency Badge */}
                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter uppercase
                  ${result.urgency === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
                    result.urgency === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}
                >
                  <div className="flex items-center gap-1">
                    <AlertTriangle size={10} />
                    {result.urgency} URGENCY
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <CheckCircle size={24} />
                  </div>
                  <div className="pr-20">
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest leading-none mb-1">Diagnosis Complete</p>
                    <h4 className="text-xl font-bold text-white">{result.issue}</h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Recommended Specialist</p>
                    <p className="text-white font-bold">{result.category}</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Est. Labor Cost</p>
                    <p className="text-emerald-400 font-bold">{result.estimatedLabor}</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                   <p className="text-[10px] font-semibold text-indigo-300 uppercase mb-1">AI Recommendation</p>
                   <p className="text-slate-300 text-sm italic">"{result.requiredParts}"</p>
                </div>
              </div>

              {/* Proof of Work Note */}
              <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
                <p className="text-xs text-emerald-400/80 leading-relaxed italic">
                  This AI Diagnosis will be saved to your booking record to prevent on-site price disputes.
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setResult(null)}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-colors"
                >
                  Retake
                </button>
                <button 
                  onClick={() => onFinishDiagnosis(result, preview)}
                  className="flex-1 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 transition-all"
                >
                  Book Specialist Now
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AiDiagnosisModal;
