import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export const useGuestGuard = () => {
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [triggerAction, setTriggerAction] = useState('perform this action');
  const location = useLocation();

  const checkAccess = (actionName = 'perform this action') => {
    if (isAuthenticated) return true;
    
    setTriggerAction(actionName);
    setIsModalOpen(true);
    return false;
  };

  const getLoginRedirect = (customPath = null) => {
    const path = customPath || location.pathname + location.search;
    return `/login?redirect=${encodeURIComponent(path)}`;
  };

  const getRegisterRedirect = (customPath = null) => {
    const path = customPath || location.pathname + location.search;
    return `/register?redirect=${encodeURIComponent(path)}`;
  };

  return {
    checkAccess,
    isModalOpen,
    setIsModalOpen,
    triggerAction,
    getLoginRedirect,
    getRegisterRedirect
  };
};
