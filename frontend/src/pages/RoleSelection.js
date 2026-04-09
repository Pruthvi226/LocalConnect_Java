import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Briefcase } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname.includes('register');

  const cardVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    hover: { y: -8, scale: 1.02 },
  };

  const handleUserClick = (e) => {
    e.preventDefault();
    const path = isRegister ? '/register/Customer' : '/login/Customer';
    navigate(path);
  };

  const handleProviderClick = (e) => {
    e.preventDefault();
    const path = isRegister ? '/register/provider' : '/login/provider';
    navigate(path);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
            How would you like to <span className="text-indigo-600">{isRegister ? 'Join' : 'Continue'}?</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            {isRegister 
              ? "Create your identity to start exploring services or growing your business."
              : "Choose whether you want to explore services as a Customer or manage your jobs as a Provider."
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.button
            type="button"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            onClick={handleUserClick}
            className="group relative overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_50px_-12px_rgba(79,70,229,0.1)] border border-indigo-50 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-white group-hover:from-indigo-50 transition-colors" />
            <div className="relative p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-indigo-600 tracking-widest">
                      Consumer Portal
                    </p>
                    <h2 className="text-2xl font-black text-slate-900">
                      {isRegister ? 'Register as Customer' : 'Login as Customer'}
                    </h2>
                  </div>
                </div>
              </div>
              <p className="text-slate-500 font-medium mb-6 line-clamp-2">
                Browse nearby services, compare providers, read reviews, and book
                your next job in a few clicks.
              </p>
              <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                <span className="text-xs font-bold text-slate-400">
                  Find expert help today
                </span>
                <span className="text-indigo-600 font-black flex items-center gap-2 group-hover:gap-3 transition-all">
                  {isRegister ? 'Start Journey' : 'Continue'} <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </motion.button>

          <motion.button
            type="button"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
            onClick={handleProviderClick}
            className="group relative overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_50px_-12px_rgba(79,70,229,0.1)] border border-indigo-50 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-white group-hover:from-indigo-50 transition-colors" />
            <div className="relative p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-indigo-600 tracking-widest">
                      Provider Network
                    </p>
                    <h2 className="text-2xl font-black text-slate-900">
                      {isRegister ? 'Register as Provider' : 'Login as Provider'}
                    </h2>
                  </div>
                </div>
              </div>
              <p className="text-slate-500 font-medium mb-6 line-clamp-2">
                Manage your services, respond to booking requests, and track earnings
                from a powerful, real-time dashboard.
              </p>
              <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                <span className="text-xs font-bold text-slate-400">
                  Grow your business
                </span>
                <span className="text-indigo-600 font-black flex items-center gap-2 group-hover:gap-3 transition-all">
                  {isRegister ? 'Apply Now' : 'Continue'} <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const ArrowRight = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default RoleSelection;


