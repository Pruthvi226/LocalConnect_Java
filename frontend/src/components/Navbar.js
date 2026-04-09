import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, User, LogOut, Bell, Search, 
  MapPin, Heart, MessageSquare, Shield, ShieldCheck,
  LayoutDashboard, Settings, HelpCircle, Zap as ZapIcon, Star, Package, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { notificationService } from '../services/notificationService';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { lastNotification } = useRealtime();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setUserMenuOpen(false);
    setNotificationOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

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
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/services/search?q=${encodeURIComponent(searchQuery)}&size=5`);
        const data = await response.json();
        setSuggestions(data.content || []);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const logoutUser = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'py-3' : 'py-5'
    }`}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className={`transition-all duration-300 rounded-2xl flex items-center justify-between px-4 lg:px-8 h-14 lg:h-16 ${
          isScrolled 
            ? 'glass-card shadow-premium border-white/40' 
            : 'bg-transparent border-transparent'
        }`}>
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-lg overflow-hidden">
                <motion.div
                  initial={false}
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  className="font-black text-xl"
                >
                  P
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20"></div>
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 lg:block hidden">
              Proxi<span className="text-primary-600 font-black">Sense</span>
            </span>
          </Link>

          {/* Smart Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8 relative">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="text"
                className="w-full bg-slate-100/50 hover:bg-slate-100 focus:bg-white border-transparent focus:border-primary-500/30 rounded-full py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition-all border group-focus-within:shadow-lg group-focus-within:shadow-primary-500/10 placeholder:text-slate-500"
                placeholder="Find services near you..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {searchLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-semibold text-slate-400 bg-white border border-slate-200 rounded">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && (searchQuery.length > 2 || suggestions.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden z-[70] p-2"
                >
                  {suggestions.length > 0 ? (
                    <div className="space-y-1">
                      {suggestions.map((svc) => (
                        <button
                          key={svc.id}
                          onClick={() => {
                            navigate(`/services/${svc.id}`);
                            setShowSuggestions(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all group text-left"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                            <img src={svc.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{svc.title}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{svc.category}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.length > 2 && !searchLoading ? (
                    <div className="p-8 text-center">
                       <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Matches Found</p>
                       <p className="text-xs text-slate-400 mt-1">Try another search term.</p>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav Links & Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            <Link 
              to="/" 
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all font-bold text-sm shadow-sm group ${
                isActive('/') ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 hover:border-primary-300 bg-white text-slate-600 hover:text-primary-600 hover:bg-primary-50'
              } border`}
            >
               <span>Home</span>
            </Link>
            <Link 
              to="/search" 
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all font-bold text-sm shadow-sm group ${
                isActive('/search') ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 hover:border-primary-300 bg-white text-slate-600 hover:text-primary-600 hover:bg-primary-50'
              } border`}
            >
               <span>Find Services</span>
            </Link>
            
            {isAuthenticated && (
              <Link 
                to="/my-bookings" 
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all font-bold text-sm shadow-sm group ${
                  isActive('/my-bookings') ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 hover:border-primary-300 bg-white text-slate-600 hover:text-primary-600 hover:bg-primary-50'
                } border`}
              >
                 <Package className="w-4 h-4" />
                 <span>My Bookings</span>
              </Link>
            )}

            <Link 
              to="/explore-map" 
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all font-bold text-sm shadow-sm group ${
                isActive('/explore-map') ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 hover:border-primary-300 bg-white text-slate-600 hover:text-primary-600 hover:bg-primary-50'
              } border`}
            >
               <MapPin className="w-4 h-4 group-hover:animate-bounce" />
               <span>Explore Map</span>
            </Link>
            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/login" className="nav-link text-sm hidden sm:block">Log in</Link>
                <Link to="/register" className="btn-primary py-2 px-5 text-sm">Join ProxiSense</Link>
              </div>
            ) : (
              <>
                <div className="hidden md:flex items-center gap-1 border-r border-slate-200 pr-4 mr-2">
                  <Link to="/favorites" className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all relative">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link to="/messages" className="p-2 text-slate-500 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all">
                    <MessageSquare className="w-5 h-5" />
                  </Link>
                </div>

                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                       setNotificationOpen(!notificationOpen);
                       setUserMenuOpen(false);
                    }}
                    className={`p-3 rounded-2xl transition-all relative group ${
                      notificationOpen ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-100 hover:text-primary-600'
                    }`}
                  >
                    <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-[10px] font-black rounded-lg border-2 border-white flex items-center justify-center animate-bounce shadow-lg">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {notificationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-[380px] bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] origin-top-right overflow-hidden z-[60]"
                      >
                        <div className="p-8 pb-4 flex justify-between items-center">
                          <div>
                             <h3 className="font-black text-slate-900 text-xl tracking-tight">Notifications</h3>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Recent activity and updates</p>
                          </div>
                          <button className="text-[10px] font-black uppercase text-primary-600 hover:underline tracking-widest bg-primary-50 px-4 py-2 rounded-xl active:scale-95 transition-all">Clear All</button>
                        </div>
                        
                        <div className="max-h-[450px] overflow-y-auto invisible-scrollbar px-4 pb-8 space-y-2">
                          {notifications.length === 0 ? (
                            <div className="py-20 text-center px-12">
                               <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100">
                                  <ShieldCheck className="w-8 h-8 text-slate-200" />
                               </div>
                               <p className="text-slate-900 font-black text-sm uppercase tracking-tight">You're all caught up!</p>
                               <p className="text-slate-400 text-xs mt-2 leading-relaxed">You have no new notifications right now. New alerts will appear here.</p>
                            </div>
                          ) : (
                            notifications.map((n, i) => (
                              <motion.button
                                key={n.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => handleMarkAsRead(n.id)}
                                className="w-full p-6 text-left hover:bg-slate-50 rounded-[2rem] transition-all group flex gap-5 border border-transparent hover:border-slate-100 relative overflow-hidden"
                              >
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all shadow-sm">
                                   <ZapIcon className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-1">
                                     <p className="font-black text-sm text-slate-900 uppercase tracking-tight line-clamp-1 group-hover:text-primary-600 transition-colors">{n.title}</p>
                                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap pt-1">Just Now</span>
                                  </div>
                                  <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                </div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                </div>
                              </motion.button>
                            ))
                          )}
                        </div>
                        
                        <div className="p-6 bg-slate-50 border-t border-slate-100">
                           <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all shadow-sm active:scale-[0.98]">
                               View All Notifications
                           </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Account Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 p-1 pl-2 rounded-full transition-all border ${
                      userMenuOpen ? 'bg-white border-primary-200 shadow-md transform scale-105' : 'bg-slate-50 border-slate-100 hover:shadow-sm'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user?.fullName?.charAt(0) || user?.username?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                    <div className="hidden lg:block text-left pr-2">
                       <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account</p>
                       <p className="text-xs font-bold text-slate-700 -mt-0.5">{user?.fullName?.split(' ')[0] || user?.username}</p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 glass-card p-2 origin-top-right shadow-2xl overflow-hidden"
                      >
                        <div className="p-3 bg-gradient-to-br from-primary-50 to-white rounded-xl mb-2 border border-primary-100/50">
                           <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">Signed in as</p>
                           <p className="font-bold text-slate-800 truncate">{user?.fullName || user?.username}</p>
                           <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                        
                        <div className="space-y-0.5">
                          <MenuItem 
                            icon={Package} 
                            label="My Bookings" 
                            to="/my-bookings" 
                            onClick={() => setUserMenuOpen(false)} 
                          />
                          {user?.role === 'PROVIDER' && (
                            <MenuItem 
                              icon={Package} 
                              label="Booking History" 
                              to="/provider/history" 
                              onClick={() => setUserMenuOpen(false)} 
                            />
                          )}
                          <MenuItem 
                            icon={LayoutDashboard} 
                            label="Dashboard" 
                            to={user?.role === 'PROVIDER' ? '/provider/dashboard' : '/customer/dashboard'} 
                            onClick={() => setUserMenuOpen(false)} 
                          />
                          <MenuItem 
                            icon={User} 
                            label="Profile" 
                            to={user?.role === 'PROVIDER' ? '/provider/profile' : '/customer/profile'} 
                            onClick={() => setUserMenuOpen(false)} 
                          />
                          <MenuItem 
                            icon={Settings} 
                            label="Settings" 
                            to="/profile" 
                            onClick={() => setUserMenuOpen(false)} 
                          />
                          {user?.role === 'ADMIN' && (
                            <MenuItem 
                              icon={Shield} 
                              label="Admin Console" 
                              to="/admin" 
                              danger
                              onClick={() => setUserMenuOpen(false)} 
                            />
                          )}
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100">
                           <button
                             onClick={logoutUser}
                             className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-bold text-sm"
                           >
                             <LogOut className="w-4 h-4" />
                             <span>Sign out</span>
                           </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[-1]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold text-slate-800">ProxiSense</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <MenuItem icon={MapPin} label="Explore Map" to="/explore-map" onClick={() => setMobileMenuOpen(false)} full />
                
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="block p-4 bg-slate-50 rounded-2xl font-bold">Log in</Link>
                    <Link to="/register" className="block p-4 btn-primary text-center">Get Started</Link>
                  </>
                ) : (
                  <>
                     <div className="p-4 bg-primary-50 rounded-2xl mb-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {user?.fullName?.charAt(0)}
                        </div>
                        <div>
                           <p className="font-bold text-slate-800">{user?.fullName}</p>
                           <p className="text-xs text-primary-600 font-bold uppercase tracking-wider">{user?.role}</p>
                        </div>
                     </div>
                     <MenuItem icon={LayoutDashboard} label="Dashboard" to={user?.role === 'PROVIDER' ? '/provider/dashboard' : '/customer/dashboard'} onClick={() => setMobileMenuOpen(false)} full />
                     <MenuItem icon={Package} label="My Bookings" to="/my-bookings" onClick={() => setMobileMenuOpen(false)} full />
                     <MenuItem icon={Heart} label="Favorites" to="/favorites" onClick={() => setMobileMenuOpen(false)} full />
                     <MenuItem icon={MessageSquare} label="Messages" to="/messages" onClick={() => setMobileMenuOpen(false)} full />
                     <MenuItem icon={User} label="My Profile" to="/profile" onClick={() => setMobileMenuOpen(false)} full />
                     <MenuItem icon={Settings} label="Settings" to="/profile" onClick={() => setMobileMenuOpen(false)} full />
                     <MenuItem icon={HelpCircle} label="Help Center" to="/help" onClick={() => setMobileMenuOpen(false)} full />
                  </>
                )}
              </div>

              {isAuthenticated && (
                <button
                  onClick={logoutUser}
                  className="mt-auto flex items-center justify-center gap-3 p-4 w-full bg-red-50 text-red-600 rounded-2xl font-bold transition-colors hover:bg-red-100"
                >
                  <LogOut className="w-5 h-5" />
                  Sign out
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

const MenuItem = ({ icon: Icon, label, to, onClick, danger, full }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
      full ? 'w-full' : ''
    } ${
      danger 
        ? 'text-primary-600 hover:bg-primary-50' 
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`}
  >
    <Icon className={`w-4 h-4 ${danger ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-900'}`} />
    <span className="text-sm">{label}</span>
  </Link>
);

export default Navbar;
