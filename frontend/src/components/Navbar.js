import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Bell, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { notificationService } from '../services/notificationService';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { lastNotification } = useRealtime();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = () => {
    if (!isAuthenticated) return;
    notificationService.getUnreadCount().then(setUnreadCount);
    if (notificationOpen) {
      notificationService.getUnread().then((list) => setNotifications(Array.isArray(list) ? list : []));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    notificationService.getUnreadCount().then(setUnreadCount);
  }, [isAuthenticated]);

  useEffect(() => {
    if (lastNotification) {
      setNotifications((prev) => [lastNotification, ...prev]);
      setUnreadCount((c) => c + 1);
    }
  }, [lastNotification]);

  useEffect(() => {
    if (!notificationOpen || !isAuthenticated) return;
    notificationService.getUnread().then((list) => setNotifications(Array.isArray(list) ? list : []));
    notificationService.getUnreadCount().then(setUnreadCount);
  }, [notificationOpen, isAuthenticated]);

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications([]);
    setUnreadCount(0);
  };

  const displayCount = unreadCount;

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-xl">L</span>
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              LocalConnect
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link to="/login/customer" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  Customer Login
                </Link>
                <Link to="/login/provider" className="text-gray-700 hover:text-secondary-600 font-medium transition-colors">
                  Provider Login
                </Link>
                <Link to="/register/customer" className="btn-primary">
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {user?.role === 'USER' && (
                  <>
                    <Link to="/customer/dashboard" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/bookings" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                      My Bookings
                    </Link>
                    <Link to="/favorites" className="text-gray-700 hover:text-primary-600 font-medium transition-colors flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      Favorites
                    </Link>
                    <Link to="/messages" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                      Messages
                    </Link>
                  </>
                )}
                {user?.role === 'PROVIDER' && (
                  <Link to="/provider/dashboard" className="text-gray-700 hover:text-secondary-600 font-medium transition-colors">
                    Dashboard
                  </Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                    Admin Panel
                  </Link>
                )}
                
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {displayCount > 0 && (
                      <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {displayCount > 99 ? '99+' : displayCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {notificationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col"
                      >
                        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                          <span className="font-semibold">Notifications</span>
                          {notifications.length > 0 && (
                            <button type="button" onClick={handleMarkAllRead} className="text-sm text-primary-600 hover:underline">
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {notifications.length === 0 ? (
                            <p className="p-4 text-gray-500 text-sm">No new notifications</p>
                          ) : (
                            notifications.slice(0, 20).map((n) => (
                              <div
                                key={n.id}
                                className={`p-3 border-b border-gray-50 hover:bg-gray-50 ${!n.isRead ? 'bg-primary-50/50' : ''}`}
                              >
                                <p className="font-medium text-sm">{n.title}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                                {!n.isRead && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAsRead(n.id)}
                                    className="text-xs text-primary-600 hover:underline mt-1"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                        <Link
                          to="/messages"
                          onClick={() => setNotificationOpen(false)}
                          className="p-3 border-t border-gray-100 text-center text-sm text-primary-600 hover:bg-gray-50"
                        >
                          View all
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </div>
                    <span className="font-medium">{user?.fullName || user?.username}</span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
                      >
                        <Link
                          to={user?.role === 'PROVIDER' || user?.role === 'ADMIN' ? '/provider/profile' : '/customer/profile'}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login/customer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-gray-700 hover:text-primary-600"
                  >
                    Customer Login
                  </Link>
                  <Link
                    to="/login/provider"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-gray-700 hover:text-secondary-600"
                  >
                    Provider Login
                  </Link>
                  <Link
                    to="/register/customer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 btn-primary text-center"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  {user?.role === 'USER' && (
                    <>
                      <Link
                        to="/customer/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-gray-700 hover:text-primary-600"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-gray-700 hover:text-primary-600"
                      >
                        My Bookings
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-gray-700 hover:text-primary-600"
                      >
                        Favorites
                      </Link>
                      <Link
                        to="/messages"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-gray-700 hover:text-primary-600"
                      >
                        Messages
                      </Link>
                    </>
                  )}
                  {user?.role === 'PROVIDER' && (
                    <Link
                      to="/provider/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-gray-700 hover:text-secondary-600"
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    to={user?.role === 'PROVIDER' || user?.role === 'ADMIN' ? '/provider/profile' : '/customer/profile'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-gray-700 hover:text-primary-600"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-red-600 hover:text-red-700"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
