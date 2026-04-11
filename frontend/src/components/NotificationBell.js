import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, MessageSquare, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../services/notificationService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const [list, count] = await Promise.all([
        notificationService.getAll(),
        notificationService.getUnreadCount()
      ]);
      setNotifications(list.slice(0, 10)); // Show latest 10
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Delete all notifications? This action cannot be undone.')) {
      try {
        await notificationService.clearAll();
        setNotifications([]);
        setUnreadCount(0);
      } catch (err) {
        console.error('Failed to clear notifications', err);
      }
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'MESSAGE_RECEIVED': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_ACCEPTED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'BOOKING_CANCELLED': return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'PAYMENT_RECEIVED': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl shadow-sm transition-all active:scale-95 group"
      >
        <Bell className="w-5 h-5 text-slate-600 group-hover:text-primary-600 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-[2rem] border border-slate-100 shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Inbox</h3>
              <div className="flex items-center gap-4">
                {notifications.length > 0 && (
                  <button 
                    onClick={handleClearAll}
                    className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    Clear All
                  </button>
                )}
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto invisible-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-slate-200" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">All caught up!</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                    className={`p-5 border-b border-slate-50 flex gap-4 transition-all hover:bg-slate-50 cursor-pointer ${!n.isRead ? 'bg-primary-50/10' : ''}`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        {getIcon(n.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className={`text-[11px] font-black tracking-tight leading-tight uppercase ${!n.isRead ? 'text-slate-900' : 'text-slate-500'}`}>
                          {n.title}
                        </h4>
                        <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{dayjs(n.createdAt).fromNow()}</span>
                      </div>
                      <p className={`text-[11px] font-medium leading-relaxed ${!n.isRead ? 'text-slate-700' : 'text-slate-400'}`}>
                        {n.message}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="mt-1 flex-shrink-0">
                        <div className="w-2 h-2 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">End of Notifications</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
