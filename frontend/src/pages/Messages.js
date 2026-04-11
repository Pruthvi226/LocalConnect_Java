import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  MessageCircle, Send, Search, 
  Phone, Video,
  Paperclip, Smile, Image as ImageIcon,
  CheckCheck, Clock, ShieldCheck,
  ChevronLeft, Info, Sparkles,
  Zap
} from 'lucide-react';
import { messageService } from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { motion } from 'framer-motion';

const Messages = () => {
  const { user } = useAuth();
  const { lastMessage } = useRealtime();
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [, setUnread] = useState([]);
  
  const messagesEndRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    loadUnread();
  }, []);

  useEffect(() => {
    const state = location.state;
    if (state && state.partnerId) {
      const { partnerId, partnerName } = state;
      setConversations((prev) => {
        if (prev.some((c) => c.id === partnerId)) return prev;
        return [{ id: partnerId, name: partnerName || 'Expert' }, ...prev];
      });
      setSelectedUserId(partnerId);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedUserId) {
        loadConversation(selectedUserId);
        const interval = setInterval(() => {
          if (document.visibilityState === 'visible') {
            loadConversation(selectedUserId);
          }
        }, 5000); // 5s chat polling
        return () => clearInterval(interval);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (!lastMessage) return;
    
    // Determine the partner ID from the message
    const partnerId = lastMessage.senderId === user?.id ? lastMessage.receiverId : lastMessage.senderId;
    const partnerName = lastMessage.senderId === user?.id ? (lastMessage.receiverName || 'Expert') : (lastMessage.senderName || 'Expert');
    
    // Update conversation list
    setConversations((prev) => {
      const existingIdx = prev.findIndex(c => c.id === partnerId);
      if (existingIdx > -1) {
         const updated = [...prev];
         updated[existingIdx] = { ...updated[existingIdx], lastContent: lastMessage.content, timestamp: new Date() };
         return [updated[existingIdx], ...updated.filter((_, i) => i !== existingIdx)];
      }
      return [{ id: partnerId, name: partnerName, lastContent: lastMessage.content }, ...prev];
    });

    if (selectedUserId === partnerId) {
       setMessages(prev => [...prev, {
         id: lastMessage.id,
         content: lastMessage.content,
         sender: { id: lastMessage.senderId },
         createdAt: lastMessage.createdAt,
       }]);
    }
    loadUnread();
  }, [lastMessage, selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUnread = async () => {
    try {
      const data = await messageService.getUnread();
      const list = Array.isArray(data) ? data : [];
      setUnread(list);
      
      const partnersMap = new Map();
      list.forEach((m) => {
        const id = m.sender?.id;
        if (id && !partnersMap.has(id)) {
          partnersMap.set(id, { 
            id, 
            name: m.sender?.fullName || m.sender?.Username || 'Expert',
            lastContent: m.content,
            timestamp: m.createdAt,
            unreadCount: (partnersMap.get(id)?.unreadCount || 0) + 1
          });
        }
      });
      
      setConversations(Array.from(partnersMap.values()));
    } catch (err) {
      console.error('Connection failed.', err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (UserId) => {
    try {
      const data = await messageService.getConversation(UserId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load conversation.', err);
    }
  };

  const handleSend = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !selectedUserId) return;
    try {
      setSending(true);
      const bookingIdFromState = location.state?.bookingId || null;
      const sentMsg = await messageService.send(selectedUserId, trimmed, bookingIdFromState);
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
      alert('Transmission failure. Please check link stability.');
    } finally {
      setSending(false);
    }
  };

  const selectedPartner = conversations.find((c) => c.id === selectedUserId);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-32 px-6 flex flex-col items-center justify-center">
         <div className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-6"></div>
         <p className="font-black text-white uppercase tracking-[0.3em] text-xs">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 pt-20 overflow-hidden flex flex-col">
      <div className="flex-1 flex overflow-hidden container mx-auto px-0 lg:px-6 py-4 max-w-7xl">
        
        {/* Thread Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-full md:w-[400px]' : 'hidden md:flex md:w-[100px]'} transition-all bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden flex flex-col mr-6 shadow-2xl`}>
           <div className="p-8 pb-4">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-white tracking-tight">Chats</h2>
                 <button className="bg-white/5 p-3 rounded-2xl hover:bg-white/10 transition-colors">
                    <MessageCircle className="w-5 h-5 text-primary-400" />
                 </button>
              </div>
              <div className="relative group">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search chats..."
                   className="w-full bg-white/2 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-primary-500 transition-all placeholder:text-slate-600 font-bold uppercase tracking-wider h-14"
                 />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto invisible-scrollbar px-6 py-4 space-y-2">
              {conversations.length === 0 ? (
                 <div className="text-center py-20 opacity-30">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">No Active Channels</p>
                 </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                        setSelectedUserId(c.id);
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`w-full group flex items-center gap-5 p-5 rounded-[2rem] transition-all relative ${
                      selectedUserId === c.id ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' : 'bg-transparent text-slate-500 hover:bg-white/2'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/10 overflow-hidden flex-shrink-0 border border-white/5 relative">
                       <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${c.name}`} className="w-full h-full object-cover p-2" alt="" />
                       <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 group-hover:border-primary-500 transition-all"></div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                       <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-black text-sm truncate uppercase tracking-tight ${selectedUserId === c.id ? 'text-white' : 'text-slate-200 hover:text-white'}`}>
                             {c.name}
                          </h4>
                          <span className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${selectedUserId === c.id ? 'text-white' : ''}`}>12:45PM</span>
                       </div>
                       <p className={`text-[10px] font-bold truncate opacity-80 ${selectedUserId === c.id ? 'text-primary-100' : 'text-slate-500'}`}>
                          {c.lastContent || 'No messages yet'}
                       </p>
                    </div>
                    {c.unreadCount > 0 && selectedUserId !== c.id && (
                       <span className="w-5 h-5 bg-primary-500 rounded-full text-[9px] font-black flex items-center justify-center text-white border-2 border-slate-900 absolute top-4 right-4">
                          {c.unreadCount}
                       </span>
                    )}
                  </button>
                ))
              )}
           </div>
        </aside>

        {/* Message Area */}
        <main className="flex-1 bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative">
           
           <div className="absolute inset-0 bg-primary-500 opacity-[0.02] pointer-events-none"></div>

           {selectedUserId ? (
              <>
                {/* Hub Header */}
                <header className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 relative z-10 bg-slate-900/50 backdrop-blur-xl">
                   <div className="flex items-center gap-6">
                      <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-3 bg-white/5 rounded-2xl text-white">
                         <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group relative overflow-hidden">
                         <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${selectedPartner?.name}`} className="w-10 h-10 object-contain p-2" alt="" />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-white tracking-tight leading-none mb-2 uppercase">{selectedPartner?.name || 'Chat'}</h3>
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Online</p>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="hidden md:flex p-4 bg-white/5 rounded-2xl text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                         <Phone className="w-5 h-5" />
                      </button>
                      <button className="hidden md:flex p-4 bg-white/5 rounded-2xl text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                         <Video className="w-5 h-5" />
                      </button>
                      <button className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                         <Info className="w-5 h-5" />
                      </button>
                   </div>
                </header>

                {/* Message History */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 invisible-scrollbar relative z-10">
                   <div className="flex flex-col items-center mb-12">
                      <div className="px-6 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Chat started • Today at 09:30</p>
                      </div>
                   </div>

                   {messages.map((m, idx) => (
                      <motion.div
                        key={m.id || idx}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={`flex ${m.sender?.id === user?.id ? 'justify-end' : 'justify-start'} group`}
                      >
                         <div className={`flex flex-col ${m.sender?.id === user?.id ? 'items-end' : 'items-start'} max-w-[70%]`}>
                            <div
                              className={`px-8 py-5 rounded-[2.5rem] relative group-hover:scale-[1.02] transition-transform ${
                                m.sender?.id === user?.id 
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 rounded-tr-none' 
                                : 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-none'
                              }`}
                            >
                               <p className="text-sm font-bold leading-relaxed">{m.content}</p>
                            </div>
                            <div className="mt-3 flex items-center gap-3 px-2">
                               <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                               {m.sender?.id === user?.id && (
                                  <div className="flex text-primary-500">
                                     <CheckCheck className="w-3 h-3" />
                                  </div>
                               )}
                            </div>
                         </div>
                      </motion.div>
                   ))}
                   <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <footer className="p-8 border-t border-white/5 relative z-10 bg-slate-900/50 backdrop-blur-xl">
                   {/* Quick Prompts */}
                   <div className="flex gap-3 mb-6 overflow-x-auto invisible-scrollbar pb-1">
                      {[
                        { text: "Are you available now?", icon: Zap },
                        { text: "Final quote with parts?", icon: ShieldCheck },
                        { text: "Can you come earlier?", icon: Clock },
                        { text: "Send past work samples.", icon: Sparkles }
                      ].map((prompt, i) => (
                        <button 
                          key={i}
                          onClick={() => setNewMessage(prompt.text)}
                          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 hover:border-primary-500/50 transition-all text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white group"
                        >
                           <prompt.icon className="w-3.5 h-3.5 text-primary-500 group-hover:scale-110 transition-transform" />
                           {prompt.text}
                        </button>
                      ))}
                   </div>

                   <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-3 flex items-center gap-4 focus-within:border-primary-500 transition-all shadow-2xl">
                      <button className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:bg-white/10 transition-all">
                         <Paperclip className="w-5 h-5" />
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-slate-600 font-bold h-14"
                      />
                      <div className="hidden md:flex items-center gap-2 pr-2">
                         <button className="p-4 text-slate-500 hover:text-white transition-colors">
                            <Smile className="w-5 h-5" />
                         </button>
                         <button className="p-4 text-slate-500 hover:text-white transition-colors">
                            <ImageIcon className="w-5 h-5" />
                         </button>
                      </div>
                      <button 
                        onClick={handleSend} 
                        disabled={sending || !newMessage.trim()} 
                        className="p-5 bg-primary-500 text-white rounded-3xl shadow-xl shadow-primary-500/30 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                      >
                         <Send className="w-6 h-6" />
                      </button>
                   </div>
                </footer>
              </>
           ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                 <div className="w-32 h-32 bg-primary-500/5 rounded-[3rem] flex items-center justify-center mb-10 border border-primary-500/10">
                    <MessageCircle className="w-16 h-16 text-primary-500" />
                 </div>
                 <h2 className="text-3xl font-black text-white tracking-tight mb-4 uppercase">Select a Chat</h2>
                 <p className="text-slate-500 text-sm max-w-sm font-bold leading-relaxed">
                    Select a conversation from the sidebar to start chatting.
                 </p>
                 <div className="mt-12 flex gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/2 rounded-full border border-white/5">
                       <ShieldCheck className="w-4 h-4 text-primary-500" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">End-to-End Encrypted</span>
                    </div>
                 </div>
              </div>
           )}
        </main>
      </div>
    </div>
  );
};

export default Messages;


