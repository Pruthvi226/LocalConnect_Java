import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Inbox, Search, Plus, MapPin } from 'lucide-react';

/**
 * A professional, production-grade Empty State component.
 * Used across the platform to provide guidance when no data is available.
 */
const EmptyState = ({ 
  icon: Icon = Inbox, 
  title = "No data found", 
  message = "It looks like there's nothing here yet.",
  actionText,
  actionLink,
  onAction
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-slate-200"
    >
      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
        <Icon className="w-10 h-10 text-slate-300" />
      </div>
      
      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
        {title}
      </h3>
      
      <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">
        {message}
      </p>

      {actionLink ? (
        <Link 
          to={actionLink}
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20 transition-all active:scale-95"
        >
          {actionText}
        </Link>
      ) : actionText && onAction ? (
        <button 
          onClick={onAction}
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20 transition-all active:scale-95"
        >
          {actionText}
        </button>
      ) : null}
    </motion.div>
  );
};

export default EmptyState;
