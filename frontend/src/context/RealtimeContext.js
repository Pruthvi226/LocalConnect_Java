import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { connectRealtime, disconnectRealtime, isRealtimeConnected } from '../services/realtimeClient';

const RealtimeContext = createContext();

export const useRealtime = () => {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used within RealtimeProvider');
  return ctx;
};

export const RealtimeProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [lastMessage, setLastMessage] = useState(null);
  const [lastNotification, setLastNotification] = useState(null);

  const handleMessage = useCallback((payload) => {
    setLastMessage(payload);
  }, []);

  const handleNotification = useCallback((payload) => {
    setLastNotification(payload);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectRealtime();
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    connectRealtime(token, handleMessage, handleNotification);
    return () => disconnectRealtime();
  }, [isAuthenticated, user, handleMessage, handleNotification]);

  const value = {
    lastMessage,
    lastNotification,
    clearLastMessage: () => setLastMessage(null),
    clearLastNotification: () => setLastNotification(null),
    isConnected: isRealtimeConnected,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};
