import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Minimize2, Maximize2, 
  MessageCircle, Clock, CheckCheck,
  Phone, Video, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { messageService } from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const ChatPopup = ({ partnerId, partnerName, bookingId, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const messagesEndRef = useRef(null);

  const loadConversation = async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await messageService.getConversation(partnerId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load conversation.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (partnerId) {
        loadConversation();
    }
    const interval = setInterval(() => {
        if (document.visibilityState === 'visible' && !isMinimized && partnerId) {
            loadConversation();
        }
    }, 5000); // 5s chat polling
    return () => clearInterval(interval);
  }, [partnerId, isMinimized]);

  useEffect(() => {
    if (!isMinimized) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  const handleSend = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !partnerId) return;
    try {
      setSending(true);
      const sentMsg = await messageService.send({ 
        receiverId: partnerId, 
        content: trimmed, 
        bookingId 
      });
      setNewMessage('');
      // Optimistic update
      setMessages(prev => [...prev, {
        id: sentMsg.id || Date.now(),
        content: trimmed,
        sender: { id: user?.id },
        createdAt: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('Message failed to send.', err);
    } finally {
      setSending(false);
      // Refresh to ensure sync (as requested)
      loadConversation();
    }
  };

  if (isMinimized) {
    return (
      <motion.div 
        layoutId="chat-popup"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full shadow-[0_12px_30px_rgba(79,70,229,0.5)] z-50 flex items-center justify-center cursor-pointer group hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20"
        onClick={() => setIsMinimized(false)}
      >
        <div className="relative">
          <MessageCircle className="w-7 h-7 text-white group-hover:rotate-12 transition-transform duration-300" />
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-slate-900 rounded-full"
          />
        </div>
        
        {/* Tooltip for partner name */}
        <div className="absolute right-full mr-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
           Chat with {partnerName}
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        layoutId="chat-popup"
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className={`fixed bottom-6 right-6 ${isExpanded ? 'w-[450px] h-[650px]' : 'w-[320px] h-[480px]'} bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] z-50 overflow-hidden flex flex-col transition-all duration-300`}
      >
        {/* Header */}
        <div className="p-5 bg-slate-800/50 border-b border-white/5 flex items-center justify-between backdrop-blur-xl shrink-0">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                 <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${partnerName}`} alt="" className="w-7 h-7 opacity-80" />
              </div>
              <div>
                 <h4 className="text-[12px] font-black text-white uppercase tracking-tight truncate max-w-[120px]">{partnerName}</h4>
                 <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Online</span>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-1">
              <button 
                type="button"
                onClick={() => setIsExpanded(!isExpanded)} 
                className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                 {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                type="button"
                onClick={() => setIsMinimized(true)} 
                className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
              >
                 <Minimize2 className="w-4 h-4 rotate-90" opacity={0.5} />
              </button>
              <button 
                type="button"
                onClick={onClose} 
                className="p-2 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-500 transition-all"
              >
                 <X className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 invisible-scrollbar">
           {loading && messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Syncing...</p>
             </div>
           ) : messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center px-10">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110">
                   <MessageCircle className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[.2em] mb-1">Encrypted Channel</p>
                <p className="text-[10px] font-bold text-slate-600 leading-relaxed uppercase">Initiate dialogue below. Partner is online.</p>
             </div>
           ) : (
             messages.map((m, idx) => {
               const isMe = m.sender?.id === user?.id;
               return (
                 <motion.div 
                   key={m.id || idx}
                   initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                 >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-bold ${isMe ? 'bg-primary-500 text-white rounded-tr-none' : 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-none'}`}>
                       <p className="leading-relaxed">{m.content}</p>
                       <div className="mt-1.5 flex items-center gap-2 opacity-50 justify-end">
                          <span className="text-[8px] uppercase">{dayjs(m.createdAt).format('hh:mm A')}</span>
                          {isMe && <CheckCheck className="w-3 h-3" />}
                       </div>
                    </div>
                 </motion.div>
               );
             })
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-slate-800/20 backdrop-blur-xl shrink-0">
           <div className="bg-white/5 border border-white/5 rounded-2xl p-2 flex items-center gap-3 focus-within:border-primary-500/50 transition-all">
              <input 
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none text-white text-sm font-bold focus:outline-none placeholder:text-slate-600 px-3"
              />
              <button 
                type="button"
                onClick={handleSend}
                disabled={sending || !newMessage.trim()}
                className="w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
              >
                 <Send className="w-5 h-5" />
              </button>
           </div>
           {sending && (
             <div className="absolute bottom-full right-6 mb-2">
                <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest animate-pulse">Sending...</p>
             </div>
           )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatPopup;
