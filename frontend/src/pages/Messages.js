import React, { useState, useEffect, useRef } from 'react';
import { messageService } from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { MessageCircle, Send } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const { lastMessage } = useRealtime();
  const [unread, setUnread] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadUnread();
  }, []);

  useEffect(() => {
    if (selectedUserId) loadConversation(selectedUserId);
  }, [selectedUserId]);

  useEffect(() => {
    if (!lastMessage) return;
    const fromId = lastMessage.senderId;
    setConversations((prev) => {
      if (prev.some((c) => c.id === fromId)) return prev;
      return [{ id: fromId, name: lastMessage.senderName || 'User' }, ...prev];
    });
    setMessages((prev) => {
      if (selectedUserId !== fromId) return prev;
      return [
        ...prev,
        {
          id: lastMessage.id,
          content: lastMessage.content,
          sender: { id: lastMessage.senderId },
          createdAt: lastMessage.createdAt,
        },
      ];
    });
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    loadUnread();
  }, [lastMessage, selectedUserId]);

  const loadUnread = async () => {
    try {
      const data = await messageService.getUnread();
      const list = Array.isArray(data) ? data : [];
      setUnread(list);
      const partners = [];
      const seen = new Set();
      list.forEach((m) => {
        const id = m.sender?.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          partners.push({ id, name: m.sender?.fullName || m.sender?.username || 'User' });
        }
      });
      setConversations(partners);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (userId) => {
    try {
      const data = await messageService.getConversation(userId);
      setMessages(Array.isArray(data) ? data : []);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUserId) return;
    try {
      setSending(true);
      await messageService.send(selectedUserId, newMessage.trim());
      setNewMessage('');
      loadConversation(selectedUserId);
      loadUnread();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const selectedPartner = conversations.find((c) => c.id === selectedUserId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <MessageCircle className="w-8 h-8 text-primary-600" />
          Messages
        </h1>

        <div className="card overflow-hidden flex flex-col md:flex-row" style={{ minHeight: '400px' }}>
          <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-gray-200">
            <div className="p-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-500">Conversations</p>
              {unread.length > 0 && (
                <p className="text-xs text-primary-600">{unread.length} unread</p>
              )}
            </div>
            <ul className="overflow-y-auto max-h-64 md:max-h-none">
              {conversations.length === 0 ? (
                <li className="p-4 text-gray-500 text-sm">No conversations yet. Messages from others will appear here.</li>
              ) : (
                conversations.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedUserId(c.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${selectedUserId === c.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''}`}
                    >
                      <p className="font-medium">{c.name}</p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {selectedUserId ? (
              <>
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <p className="font-medium">{selectedPartner?.name ?? 'User'}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender?.id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          m.sender?.id === user?.id ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{m.content}</p>
                        <p className={`text-xs mt-1 ${m.sender?.id === user?.id ? 'text-primary-100' : 'text-gray-500'}`}>
                          {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t border-gray-200 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type a message..."
                    className="input-field flex-1"
                  />
                  <button type="button" onClick={handleSend} disabled={sending || !newMessage.trim()} className="btn-primary flex items-center gap-1">
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation or wait for new messages to appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
