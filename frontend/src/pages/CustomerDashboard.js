import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, Heart, MessageCircle, 
  Bell, BookOpen, Search, Star,
  TrendingUp, ArrowRight, User,
  Plus, CheckCircle2, Clock, Zap, MapPin
} from 'lucide-react';
import { customerService } from '../services/customerService';
import { bookingService } from '../services/bookingService';
import { favoriteService } from '../services/favoriteService';
import { DashboardStatsSkeleton } from '../components/Skeleton';

const CustomerDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, bookingsData, favoritesData] = await Promise.all([
        customerService.getSummary(),
        bookingService.getAll(),
        favoriteService.getAll(),
      ]);
      setSummary(summaryData);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 px-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-16 h-16 bg-slate-200 rounded-2xl animate-pulse"></div>
             <div>
                <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
             </div>
          </div>
          <DashboardStatsSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xl">
             <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-2">Something went wrong</h2>
             <p className="text-slate-500 font-medium mb-6">{error}</p>
             <button onClick={loadData} className="btn-primary py-3 px-8">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Bookings', value: summary?.totalBookings ?? 0, icon: BookOpen, color: 'primary' },
    { label: 'Active Tasks', value: summary?.pendingBookings ?? 0, icon: Clock, color: 'indigo' },
    { label: 'Saved Services', value: summary?.favoritesCount ?? 0, icon: Heart, color: 'rose' },
    { label: 'Unread Chats', value: summary?.unreadMessages ?? 0, icon: MessageCircle, color: 'cyan' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
             <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-400 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary-500/20">
                   {summary?.user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-slate-50 rounded-full"></div>
             </div>
             <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  Welcome back, <span className="text-primary-600">{summary?.user?.fullName?.split(' ')[0] || 'Member'}</span>
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
                   <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                   Premium Member Since 2026
                </p>
             </div>
          </div>
          <div className="flex gap-3">
             <Link to="/search" className="btn-primary flex items-center gap-2 py-3 px-6 shadow-xl shadow-primary-500/10 active:scale-95 transition-all">
                <Plus className="w-5 h-5" />
                New Booking
             </Link>
             <Link to="/profile" className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                <User className="w-5 h-5" />
             </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <motion.div 
              key={stat.label}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-premium flex items-center gap-5 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                stat.color === 'primary' ? 'bg-primary-50 text-primary-600' :
                stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                stat.color === 'rose' ? 'bg-red-50 text-red-600' :
                'bg-cyan-50 text-cyan-600'
              }`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium">
              <div className="flex justify-between items-center mb-8 px-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Current Timeline</h2>
                <Link to="/bookings" className="text-sm font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4 decoration-2">
                  History
                </Link>
              </div>
              
              {bookings.length === 0 ? (
                <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-lg font-bold text-slate-400">Ready to start your first project?</p>
                   <Link to="/search" className="text-primary-600 font-bold hover:underline mt-2 inline-block">Explore nearby services</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 4).map((b) => (
                    <div key={b.id} className="p-5 bg-slate-50/50 hover:bg-slate-50 rounded-3xl border border-transparent hover:border-slate-100 transition-all group flex items-center gap-5">
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl group-hover:scale-110 transition-transform">
                          {getServiceIcon(b.service?.category)}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 truncate text-lg">{b.service?.title ?? 'Service Request'}</p>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(b.bookingDate)}
                             </span>
                             <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                             <span className="text-xs font-bold text-slate-400 truncate">
                               With {b.service?.provider?.fullName || 'ProxiSense Partner'}
                             </span>
                          </div>
                       </div>
                       <div className="text-right">
                          <StatusBadge status={b.status} />
                          <p className="text-lg font-black text-slate-900 mt-1">₹{b.service?.price}</p>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* AI Recommendations Highlight */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform"></div>
               <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                  <div>
                     <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                        <TrendingUp className="w-6 h-6 text-indigo-300" />
                     </div>
                     <h2 className="text-3xl font-black mb-4">Smart Suggestions</h2>
                     <p className="text-indigo-100 font-medium mb-8 leading-relaxed">
                        Based on your search for {bookings[0]?.service?.category || 'home experts'}, we've found 12 new premium providers near you.
                     </p>
                     <Link to="/recommendations" className="inline-flex items-center gap-2 bg-white text-indigo-900 font-black py-3 px-8 rounded-2xl hover:bg-indigo-50 transition-colors shadow-xl">
                        View List
                        <ArrowRight className="w-5 h-5" />
                     </Link>
                  </div>
                  <div className="hidden md:flex justify-end">
                     <div className="grid grid-cols-2 gap-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-24 h-24 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 flex items-center justify-center p-2 overflow-hidden shadow-2xl">
                             <img src={`https://i.pravatar.cc/100?img=${i+40}`} alt="Expert" className="w-full h-full object-cover rounded-2xl opacity-80" />
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Quick Actions & Favorites */}
          <div className="space-y-8">
            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium">
               <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                 <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                 Quick Links
               </h3>
               <div className="space-y-3">
                  <QuickAction label="Browse Services" icon={Search} to="/search" />
                  <QuickAction label="Nearby Experts" icon={MapPin} to="/nearby" />
                  <QuickAction label="My Favorites" icon={Heart} to="/favorites" />
                  <QuickAction label="Chat History" icon={MessageCircle} to="/messages" />
                  <QuickAction label="Help & Support" icon={Bell} to="/support" />
               </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black text-slate-800">Top Favorites</h3>
                 <Link to="/favorites" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                 </Link>
               </div>
               
               {favorites.length === 0 ? (
                 <p className="text-slate-400 text-sm font-medium">No saved professionals yet.</p>
               ) : (
                 <div className="space-y-5">
                    {favorites.slice(0, 3).map((f) => (
                      <Link key={f.id} to={`/services/${f.service?.id}`} className="flex items-center gap-4 group">
                         <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                            {f.service?.imageUrl ? (
                              <img src={f.service.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">🔨</div>
                            )}
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate group-hover:text-primary-600 transition-colors">{f.service?.title ?? 'Expert'}</p>
                            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-black uppercase tracking-widest mt-0.5">
                               <Star className="w-3 h-3 fill-amber-500" />
                               {f.service?.averageRating?.toFixed(1) || '0.0'}
                            </div>
                         </div>
                      </Link>
                    ))}
                 </div>
               )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ label, icon: Icon, to }) => (
  <Link to={to} className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 rounded-2xl border border-transparent hover:border-primary-100 transition-all font-bold text-slate-600">
     <Icon className="w-5 h-5 opacity-60" />
     <span className="text-sm">{label}</span>
  </Link>
);

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-indigo-100 text-indigo-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700'
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
       {status}
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return 'Upcoming';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getServiceIcon = (category) => {
  const icons = {
    'Plumbing': '🚰',
    'Cleaning': '🧹',
    'Electrical': '⚡',
    'Carpentry': '🪚',
    'Tech': '💻'
  };
  return icons[category] || '🛠️';
};

export default CustomerDashboard;

