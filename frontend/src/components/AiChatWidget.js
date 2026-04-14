import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * AiChatWidget — Floating AI assistant powered by Gemini.
 * Lives globally in App.js, always visible (except on login/register).
 * Ctrl+/ to toggle.
 */
const AiChatWidget = () => {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm ProxiSense AI 🤖 — tell me what service you need and I'll help you find the best provider near you!" }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);
  const navigate              = useNavigate();

  // Keyboard shortcut Ctrl+/
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: text });
      const { reply, suggestedActions } = res.data;

      setMessages(prev => [
        ...prev,
        { role: 'ai', text: reply, actions: suggestedActions }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: "I'm having a quick rest 😴 — try searching for your service directly!", actions: ['Browse All Services'] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action) => {
    const lower = action.toLowerCase();
    if (lower.includes('plumb'))       navigate('/nearby?q=Plumbing');
    else if (lower.includes('electric')) navigate('/nearby?q=Electrical');
    else if (lower.includes('ac'))       navigate('/nearby?q=AC Repair');
    else if (lower.includes('clean'))    navigate('/nearby?q=Cleaning');
    else if (lower.includes('recommend'))navigate('/recommendations');
    else                                 navigate('/nearby');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-violet-500 opacity-30 animate-ping" />
        )}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          aria-label="Open AI Assistant"
          className={`
            relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl
            transition-all duration-300 hover:scale-110 active:scale-95
            ${isOpen
              ? 'bg-slate-800 text-white rotate-0'
              : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white'}
          `}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[480px] flex flex-col
                     bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden
                     animate-in slide-in-from-bottom-4 duration-200"
          style={{ animation: 'slideUp 0.2s ease-out' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm leading-none">ProxiSense AI</p>
              <p className="text-violet-200 text-[10px] font-bold mt-0.5">Powered by Gemini 1.5 Flash</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-white/70 font-bold">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs
                  ${msg.role === 'user' ? 'bg-violet-600' : 'bg-indigo-600'}`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                  <div className={`px-3 py-2 rounded-2xl text-sm font-medium leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-tr-sm'
                      : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-tl-sm'}`}>
                    {msg.text}
                  </div>

                  {/* Action buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.actions.map((action, j) => (
                        <button
                          key={j}
                          onClick={() => handleAction(action)}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-black
                                     rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span className="text-sm text-slate-400 font-medium">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex gap-2 items-center bg-slate-50 rounded-2xl px-3 py-2 border border-slate-200 focus-within:border-violet-400 transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask me anything... (e.g. fix my AC)"
                className="flex-1 bg-transparent text-sm text-slate-700 font-medium placeholder-slate-400
                           focus:outline-none"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-8 h-8 bg-violet-600 hover:bg-violet-700 text-white rounded-xl flex items-center
                           justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-1.5 font-medium">
              Press <kbd className="px-1 bg-slate-100 rounded text-[9px]">Ctrl</kbd>+<kbd className="px-1 bg-slate-100 rounded text-[9px]">/</kbd> to toggle
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default AiChatWidget;
