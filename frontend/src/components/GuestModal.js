import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, X, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GuestModal = ({ isOpen, onClose, triggerAction = 'perform this action', onLoginRedirect, onRegisterRedirect }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-primary-500/10 overflow-hidden border border-slate-100"
        >
          {/* Header Accents */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 via-secondary-400 to-primary-500"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 lg:p-12 text-center">
            {/* Icon Sphere */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-primary-100 rounded-full animate-pulse opacity-50"></div>
              <div className="absolute inset-4 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-primary-500/30 relative z-10">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-primary-200 rounded-full"
              ></motion.div>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              Join the <span className="text-primary-600">ProxiSense</span> Community
            </h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg">
               To {triggerAction}, you'll need to create a profile or log back in. It only takes a few seconds!
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  onClose();
                  navigate(onLoginRedirect || '/login');
                }}
                className="group flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:border-primary-200 transition-all hover:shadow-lg hover:shadow-primary-500/5 active:scale-95"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary-600 shadow-sm transition-colors">
                  <LogIn className="w-6 h-6" />
                </div>
                <span className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Welcome Back</span>
                <span className="font-bold text-sm">Sign In</span>
              </button>

              <button 
                onClick={() => {
                  onClose();
                  navigate(onRegisterRedirect || '/register');
                }}
                className="group flex flex-col items-center gap-3 p-6 bg-primary-600 rounded-3xl border border-primary-600 hover:bg-primary-700 transition-all hover:shadow-lg hover:shadow-primary-600/20 active:scale-95 text-white"
              >
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-sm transition-colors">
                  <UserPlus className="w-6 h-6" />
                </div>
                <span className="font-black text-white/70 uppercase tracking-widest text-[10px]">New Chapter</span>
                <span className="font-bold text-sm">Create Account</span>
              </button>
            </div>

            {/* Perks visualization */}
            <div className="mt-12 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4 text-left">
               <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                     <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">Secure Payments</span>
               </div>
               <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                     <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">Expert Directory</span>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GuestModal;
