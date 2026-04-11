import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, User, LogOut, Search, 
  MapPin, Heart, MessageSquare, Shield,
  LayoutDashboard, Settings, HelpCircle, Package, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';

import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  useRealtime();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const logoutUser = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {!isAuthenticated && !loading && (
          <motion.div 
            initial={{ y: -40 }}
            animate={{ y: 0 }}
            exit={{ y: -40 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-600 px-4 py-1.5 flex items-center justify-center gap-4 shadow-lg shadow-primary-600/10"
          >
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-none">Browsing as Guest</span>
             </div>
             <div className="h-3 w-px bg-white/20"></div>
             <div className="flex gap-3">
                <Link to="/login" className="text-[9px] font-black text-white/80 hover:text-white uppercase tracking-widest transition-colors">Sign In</Link>
                <Link to="/register" className="text-[9px] font-black text-white uppercase tracking-widest underline decoration-white/30 underline-offset-4 hover:decoration-white transition-all">Create Account</Link>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
        !isAuthenticated ? (isScrolled ? 'top-8 py-3' : 'top-8 py-5') : (isScrolled ? 'top-0 py-3' : 'top-0 py-5')
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

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all font-bold text-sm shadow-sm group ${
                isActive('/') ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 hover:border-primary-300 bg-white text-slate-600 hover:text-primary-600 hover:bg-primary-50'
              } border`}
            >
               <span>Home</span>
            </Link>
            <Link 
              to="/search" 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all font-bold text-sm shadow-sm group ${
                isActive('/search') ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 hover:border-primary-300 bg-white text-slate-600 hover:text-primary-600 hover:bg-primary-50'
              } border`}
            >
               <span>Find Services</span>
            </Link>
            
            {isAuthenticated && (
              <Link 
                to="/my-bookings" 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all font-bold text-sm shadow-sm group ${
                  isActive('/my-bookings') ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 hover:border-primary-300 bg-white text-slate-600 hover:text-primary-600 hover:bg-primary-50'
                } border`}
              >
                 <Package className="w-4 h-4" />
                 <span>My Bookings</span>
              </Link>
            )}

            <Link 
              to="/explore-map" 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all font-bold text-sm shadow-sm group ${
                isActive('/explore-map') ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 hover:border-primary-300 bg-white text-slate-600 hover:text-primary-600 hover:bg-primary-50'
              } border`}
            >
               <MapPin className="w-4 h-4 group-hover:animate-bounce" />
               <span>Explore Map</span>
            </Link>
          </div>

          {/* User Section (Auth/Account) */}
          <div className="flex items-center gap-2 lg:gap-4">
            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/login" className="nav-link text-sm hidden sm:block font-bold">Log in</Link>
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
                
                {/* Notifications Bell Component */}
                <NotificationBell />

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
                          <MenuItem icon={Package} label="My Bookings" to="/my-bookings" onClick={() => setUserMenuOpen(false)} />
                          {user?.role === 'PROVIDER' && (
                            <MenuItem icon={Package} label="Booking History" to="/provider/history" onClick={() => setUserMenuOpen(false)} />
                          )}
                          <MenuItem 
                            icon={LayoutDashboard} 
                            label="Dashboard" 
                            to={user?.role === 'PROVIDER' ? '/provider/dashboard' : '/customer/dashboard'} 
                            onClick={() => setUserMenuOpen(false)} 
                          />
                          <MenuItem 
                            icon={User} 
                            label="Profile settings" 
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
                <MenuItem icon={LayoutDashboard} label="Home" to="/" onClick={() => setMobileMenuOpen(false)} full />
                <MenuItem icon={Search} label="Find Services" to="/search" onClick={() => setMobileMenuOpen(false)} full />
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
                     <MenuItem icon={User} label="Profile & Settings" to="/profile" onClick={() => setMobileMenuOpen(false)} full />
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
  </>
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
