import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Calendar, Clock, MapPin, 
  ChevronRight, MessageSquare, CreditCard, 
  XCircle, CheckCircle2, AlertCircle, 
  MoreHorizontal, ArrowUpRight, ShieldAlert
} from 'lucide-react';
import dayjs from 'dayjs';
import { bookingService } from '../services/bookingService';
import { ServiceCardSkeleton } from '../components/Skeleton';

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getAll();
      setBookings(data);
    } catch (err) {
      setError('Connection interrupted. Unable to sync projects.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    try {
      await bookingService.cancel(selectedBooking.id);
      setCancelDialogOpen(false);
      setSelectedBooking(null);
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to cancel project.');
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return { label: 'Active', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: CheckCircle2 };
      case 'PENDING':
        return { label: 'In Review', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock };
      case 'COMPLETED':
        return { label: 'Finalized', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: CheckCircle2 };
      case 'CANCELLED':
        return { label: 'Archived', color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100', icon: XCircle };
      default:
        return { label: status, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 px-6">
        <div className="container mx-auto max-w-5xl">
           <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse mb-8"></div>
           <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-white border border-slate-100 rounded-[2.5rem] animate-pulse"></div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <div className="flex items-center gap-3 text-primary-600 mb-2">
                 <History className="w-6 h-6" />
                 <span className="text-xs font-black uppercase tracking-[0.2em]">Project Management</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Your Expertise <span className="text-primary-600">Sync.</span></h1>
           </div>
           <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm">
              <button className="px-6 py-2 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider">All Projects</button>
              <button className="px-6 py-2 rounded-2xl text-slate-400 text-xs font-black uppercase tracking-wider hover:text-slate-600">Active</button>
              <button className="px-6 py-2 rounded-2xl text-slate-400 text-xs font-black uppercase tracking-wider hover:text-slate-600">Past</button>
           </div>
        </header>

        {error && (
          <div className="mb-8 bg-red-50 text-red-700 p-6 rounded-[2rem] border border-red-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
             <ShieldAlert className="w-6 h-6" />
             <p className="font-bold">{error}</p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-premium max-w-2xl mx-auto px-12">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-white">
                <Calendar className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-3xl font-black text-slate-800 mb-4">No projects yet</h3>
             <p className="text-slate-500 font-medium mb-10 text-lg">
                Your future service engagements will appear here. Start by finding your first expert.
             </p>
             <button onClick={() => navigate('/search')} className="bg-primary-600 text-white font-black py-4 px-12 rounded-2xl shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
                Discover Experts
             </button>
          </div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {bookings.map((booking) => {
                const config = getStatusConfig(booking.status);
                const Icon = config.icon;
                
                return (
                  <motion.div 
                    key={booking.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-premium hover:shadow-2xl hover:border-primary-100 transition-all overflow-hidden"
                  >
                    <div className="p-8 lg:p-10 flex flex-col lg:flex-row gap-8 items-start">
                       
                       {/* Service Mini Gallery */}
                       <div className="w-full lg:w-48 h-48 bg-slate-100 rounded-[2rem] overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform">
                          <img 
                            src={booking.service?.imageUrl || `https://source.unsplash.com/featured/?${booking.service?.category}`} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                       </div>

                       {/* Project Content */}
                       <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                             <span className={`${config.bg} ${config.color} ${config.border} border px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}>
                                <Icon className="w-3.5 h-3.5" />
                                {config.label}
                             </span>
                             <span className="text-slate-300 font-medium text-xs">•</span>
                             <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{booking.service?.category}</span>
                          </div>

                          <h3 className="text-2xl lg:text-3xl font-black text-slate-900 mb-2 truncate">
                             {booking.service?.title}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                             <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                                <Clock className="w-5 h-5 text-primary-500" />
                                {dayjs(booking.bookingDate).format('MMM D, YYYY • h:mm A')}
                             </div>
                             <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                                <MapPin className="w-5 h-5 text-primary-500" />
                                {booking.service?.location}
                             </div>
                             <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                                <CreditCard className="w-5 h-5 text-primary-500" />
                                Est. Total: ₹{Math.round(booking.service?.price * 1.05)}
                             </div>
                             {booking.notes && (
                               <div className="flex items-center gap-3 text-slate-500 font-medium text-sm italic">
                                  <AlertCircle className="w-5 h-5 text-slate-300" />
                                  "{booking.notes}"
                               </div>
                             )}
                          </div>
                       </div>

                       {/* Action Hub */}
                       <div className="w-full lg:w-auto flex flex-col gap-3 lg:border-l lg:border-slate-50 lg:pl-8">
                          {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' ? (
                            <>
                               <button 
                                onClick={() => navigate(`/checkout/${booking.id}`)}
                                className="bg-primary-600 hover:bg-primary-700 text-white font-black py-3 px-8 rounded-2xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                               >
                                  <ArrowUpRight className="w-4 h-4" />
                                  Complete Project
                               </button>
                               <button 
                                onClick={() => navigate('/messages', { state: { partnerId: booking.service?.provider?.id, partnerName: booking.service?.provider?.fullName } })}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 px-8 rounded-2xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                               >
                                  <MessageSquare className="w-4 h-4" />
                                  Chat Expert
                               </button>
                               <button 
                                onClick={() => { setSelectedBooking(booking); setCancelDialogOpen(true); }}
                                className="text-slate-400 hover:text-red-500 font-bold py-2 transition-colors text-xs flex items-center justify-center gap-2"
                               >
                                  Archive Request
                               </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => navigate(`/services/${booking.service?.id}`)}
                              className="bg-slate-900 border border-slate-800 text-white font-black py-3 px-8 rounded-2xl hover:bg-slate-800 transition-all text-sm"
                            >
                               Rebook Service
                            </button>
                          )}
                       </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="bg-slate-50/50 px-8 lg:px-12 py-6 border-t border-slate-100 flex items-center gap-6 overflow-x-auto invisible-scrollbar">
                       {[
                         { step: 'Logged', active: true },
                         { step: 'Accepted', active: ['CONFIRMED', 'COMPLETED'].includes(booking.status) },
                         { step: 'Dispatch', active: ['CONFIRMED', 'COMPLETED'].includes(booking.status) },
                         { step: 'Finished', active: booking.status === 'COMPLETED' }
                       ].map((node, idx, arr) => (
                         <React.Fragment key={idx}>
                           <div className="flex items-center gap-2 min-w-fit">
                              <div className={`w-3 h-3 rounded-full ${node.active ? 'bg-primary-500 shadow-[0_0_10px_rgba(30,64,175,0.4)]' : 'bg-slate-200'}`}></div>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${node.active ? 'text-slate-900' : 'text-slate-300'}`}>{node.step}</span>
                           </div>
                           {idx < arr.length - 1 && (
                             <div className={`h-px w-8 flex-shrink-0 ${arr[idx+1].active ? 'bg-primary-500' : 'bg-slate-200'}`}></div>
                           )}
                         </React.Fragment>
                       ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modern Cancelation Modal */}
      <AnimatePresence>
        {cancelDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setCancelDialogOpen(false)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             ></motion.div>
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-8">
                   <AlertCircle className="w-8 h-8" />
                </div>
                
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Archive Project?</h3>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg">
                   You are about to cancel <strong className="text-slate-900 font-black">{selectedBooking?.service?.title}</strong>. 
                   This action will notify the expert and can't be reversed.
                </p>
                
                <div className="flex flex-col gap-3">
                   <button 
                    onClick={handleCancelConfirm}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                   >
                      Yes, Cancel Project
                   </button>
                   <button 
                    onClick={() => setCancelDialogOpen(false)}
                    className="w-full bg-slate-100 text-slate-600 font-black py-4 rounded-2xl active:scale-95 transition-all underline underline-offset-4"
                   >
                      Keep Current Request
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bookings;

