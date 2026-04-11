import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Search, Calendar, Clock, MapPin, 
  ChevronRight, AlertCircle, CheckCircle2, XCircle, 
  RefreshCcw, Star, ExternalLink, ShieldCheck, CreditCard,
  Trash2, Navigation, MessageCircle
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/common/EmptyState';
import ChatPopup from '../components/ChatPopup';
import Pagination from '../components/Pagination';



const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0 });
  const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null });
  const [reviewModal, setReviewModal] = useState({ open: false, booking: null, rating: 5, comment: '', loading: false });
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed', 'cancelled'
  const [chatPartner, setChatPartner] = useState(null); // { id, name, bookingId }
  
  
  useAuth();
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getUserBookings(pagination.page, pagination.size);
      setBookings(data.content || []);
      setPagination(prev => ({ ...prev, totalPages: data.totalPages || 0 }));
    } catch (err) {
      setError('Unable to load your bookings. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size]);

  useEffect(() => {
    fetchBookings();
    
    // 5s polling for active bookings (Phase 6 optimization)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchBookings();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [pagination.page, activeTab, fetchBookings]);

  const handleCancelClick = (id) => {
    setCancelModal({ open: true, bookingId: id });
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const blob = await bookingService.getInvoice(bookingId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Could not generate invoice. Please try again later.');
    }
  };

  const handleMessageProvider = (booking) => {
    setChatPartner({
      id: booking.providerId,
      name: booking.providerName,
      bookingId: booking.id
    });
  };

  const confirmCancellation = async () => {
    try {
      await bookingService.cancelPost(cancelModal.bookingId);
      setCancelModal({ open: false, bookingId: null });
      fetchBookings();
    } catch (err) {
      alert('Could not cancel this booking. Please try again or contact support.');
    }
  };

  const handleOpenReview = (booking) => {
    setReviewModal({ open: true, booking, rating: 5, comment: '', loading: false });
  };

  const submitReview = async () => {
    if (!reviewModal.booking) return;
    setReviewModal(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/reviews?bookingId=${reviewModal.booking.id}&rating=${reviewModal.rating}&comment=${encodeURIComponent(reviewModal.comment)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to submit review');
      }
      
      setReviewModal({ open: false, booking: null, rating: 5, comment: '', loading: false });
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewModal(prev => ({ ...prev, loading: false }));
    }
  };

  const filteredBookings = bookings.filter(b => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = b.service?.title?.toLowerCase().includes(term) || 
                          b.service?.provider?.fullName?.toLowerCase().includes(term);
    
    if (activeTab === 'active') return matchesSearch && !['COMPLETED', 'CANCELLED'].includes(b.status);
    if (activeTab === 'completed') return matchesSearch && b.status === 'COMPLETED';
    if (activeTab === 'cancelled') return matchesSearch && b.status === 'CANCELLED';
    return matchesSearch;
  });

  // Simple Frontend Pagination for current set (can be improved to backend pagination later)
  const paginatedBookings = filteredBookings.slice(pagination.page * pagination.size, (pagination.page + 1) * pagination.size);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: CreditCard, label: 'Payment Required' };
      case 'PENDING': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock, label: 'Pending Approval' };
      case 'CONFIRMED': return { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: ShieldCheck, label: 'Confirmed' };
      case 'ACCEPTED': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: CheckCircle2, label: 'Accepted' };
      case 'IN_PROGRESS': return { color: 'text-primary-600', bg: 'bg-primary-50', border: 'border-primary-100', icon: RefreshCcw, label: 'Service Provider on the Way' };
      case 'ARRIVED': return { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', icon: Navigation, label: 'Service Provider Arrived' };
      case 'COMPLETED': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2, label: 'Service Completed' };
      case 'CANCELLED': return { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', icon: XCircle, label: 'Cancelled' };
      default: return { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100', icon: AlertCircle, label: status };
    }
  };

  const getProgressStep = (status) => {
    const steps = ['PENDING_PAYMENT', 'CONFIRMED', 'ACCEPTED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'];
    if (status === 'PENDING') return 0;
    const index = steps.indexOf(status);
    return index === -1 ? 0 : index;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
                <Package className="w-5 h-5" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                My <span className="text-primary-600">Bookings</span>
              </h1>
            </div>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] ml-1">
              Track and manage your service requests
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by service or specialist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-5 text-sm font-bold text-slate-800 focus:border-primary-500/30 outline-none w-full md:w-64 transition-all shadow-sm shadow-slate-100"
              />
            </div>
            <div className="flex items-center bg-white border-2 border-slate-100 rounded-2xl p-1.5 shadow-sm">
               {[
                 { id: 'active', label: 'Active Jobs' },
                 { id: 'completed', label: 'Service History' },
                 { id: 'cancelled', label: 'Cancelled' }
               ].map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                   }`}
                 >
                   {tab.label}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">{error}</p>
            <button 
              onClick={fetchBookings} 
              className="ml-auto text-xs font-black uppercase tracking-widest underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && bookings.length === 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[2rem] h-64 animate-pulse border-2 border-slate-50"></div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState 
            icon={Package}
            title="No Bookings Found"
            message={searchTerm || activeTab !== 'active'
              ? `We couldn't find any results for your current filters in ${activeTab} items.`
              : "You haven't made any bookings yet. Start exploring local experts!"}
            actionText="Find Services"
            actionLink="/search"
          />
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-8"
          >
            {paginatedBookings.map((booking) => {
              const statusCfg = getStatusConfig(booking.status);
              const progressStep = getProgressStep(booking.status);
              
              return (
                <motion.div 
                  key={booking.id}
                  variants={itemVariants}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium group hover:shadow-2xl hover:shadow-primary-600/5 transition-all duration-500 overflow-hidden"
                >
                  {/* Top Bar: ID & Status */}
                  <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Booking ID</p>
                          <p className="text-sm font-black text-slate-900 tracking-tight">#{booking.id?.toString().padStart(6, '0')}</p>
                       </div>
                       <div className="h-8 w-px bg-slate-200"></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Booked On</p>
                          <div className="flex items-center gap-2">
                             <Calendar className="w-3.5 h-3.5 text-slate-400" />
                             <p className="text-sm font-bold text-slate-700">
                               {new Date(booking.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                             </p>
                          </div>
                       </div>
                    </div>
                    <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full ${statusCfg.bg} ${statusCfg.border} border-2`}>
                       <statusCfg.icon className={`w-4 h-4 ${statusCfg.color}`} />
                       <span className={`text-[10px] font-black uppercase tracking-widest ${statusCfg.color}`}>{statusCfg.label}</span>
                    </div>
                  </div>

                  <div className="p-8 lg:p-10 flex flex-col lg:flex-row gap-10">
                    {/* Left: Service Info */}
                    <div className="flex-1 space-y-8">
                       <div className="flex gap-6">
                          <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl flex-shrink-0 bg-slate-100">
                             <img 
                               src={booking.service?.imageUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=200'} 
                               alt={booking.serviceTitle}
                               className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                             />
                          </div>
                          <div>
                             <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight group-hover:text-primary-600 transition-colors">
                               {booking.serviceTitle}
                             </h3>
                             <p className="flex items-center gap-2 text-slate-500 font-bold mb-4">
                               <MapPin className="w-4 h-4 text-primary-500" />
                               {booking.service?.location || 'Your area'}
                             </p>
                             <div className="flex items-center gap-3">
                                <Link 
                                  to={`/services/${booking.serviceId}`} 
                                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all active:scale-95"
                                >
                                   View Service <ExternalLink className="w-3 h-3" />
                                </Link>
                                <button 
                                  onClick={() => handleDownloadInvoice(booking.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all active:scale-95"
                                >
                                   Invoice <CreditCard className="w-3 h-3" />
                                </button>
                             </div>
                          </div>
                       </div>

                       {/* Booking Progress Tracker */}
                       <div className="relative pt-4 pb-6 px-2">
                          <div className="h-2 w-full bg-slate-100 rounded-full relative overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${(progressStep / 4) * 100}%` }}
                               transition={{ duration: 1, ease: 'easeOut' }}
                               className="absolute h-full bg-gradient-to-r from-primary-400 to-primary-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                             />
                          </div>
                          <div className="flex justify-between mt-6">
                             {['Payment', 'Confirmed', 'Accepted', 'On Way', 'Done'].map((s, idx) => (
                               <div key={s} className="flex flex-col items-center gap-2 flex-1">
                                  <div className={`w-5 h-5 rounded-full border-4 transition-all duration-500 ${
                                    idx <= progressStep 
                                      ? 'bg-primary-600 border-white shadow-lg ring-4 ring-primary-50' 
                                      : 'bg-slate-200 border-slate-50'
                                  }`}></div>
                                  <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${
                                    idx <= progressStep ? 'text-primary-600' : 'text-slate-400'
                                  }`}>{s}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Right: Payment & Actions */}
                    <div className="lg:w-80 space-y-6">
                       <div className="bg-slate-50 rounded-3xl p-6 border-2 border-white shadow-inner">
                          <div className="flex justify-between items-center mb-6">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment Summary</p>
                             <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                               booking.paymentStatus === 'COMPLETED' 
                                 ? 'bg-emerald-100 text-emerald-700' 
                                 : 'bg-amber-100 text-amber-700'
                             }`}>
                                {booking.paymentStatus === 'COMPLETED' ? 'Paid' : 'Payment Pending'}
                             </div>
                          </div>
                          <div className="flex items-end justify-between">
                             <div>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">₹{booking.totalPrice?.toFixed(0)}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 whitespace-nowrap">
                                  Via {booking.paymentMethod || 'Online Payment'}
                                </p>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Fee</p>
                                <p className="text-sm font-black text-indigo-600">₹{booking.platformFee || 0}</p>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-3">
                          {booking.status === 'PENDING_PAYMENT' && (
                            <button 
                              onClick={() => navigate(`/checkout/${booking.id}`)}
                              className="w-full flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl shadow-primary-200"
                            >
                               <CreditCard className="w-4 h-4" /> Pay Now
                            </button>
                          )}

                          {(booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT') && (
                            <button 
                              onClick={() => handleCancelClick(booking.id)}
                              className="w-full flex items-center justify-center gap-3 bg-red-50 hover:bg-red-100 text-red-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
                            >
                               <Trash2 className="w-4 h-4" /> Cancel Booking
                            </button>
                          )}
                          
                          {['IN_PROGRESS', 'ACCEPTED', 'ARRIVED'].includes(booking.status) && (
                            <Link 
                               to={`/track/${booking.id}`}
                               className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
                            >
                               <Navigation className="w-4 h-4" /> Track Service
                            </Link>
                          )}

                          {booking.status === 'COMPLETED' && (
                             <div className="grid grid-cols-2 gap-3">
                                <button 
                                  onClick={() => handleOpenReview(booking)}
                                  className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary-200 active:scale-95"
                                >
                                   <Star className="w-3 h-3" /> Write Review
                                </button>
                                <button 
                                  onClick={() => navigate(`/services/${booking.serviceId}`)}
                                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                                >
                                   <RefreshCcw className="w-3 h-3" /> Book Again
                                </button>
                             </div>
                          )}

                          <button 
                            onClick={() => handleMessageProvider(booking)}
                            className="w-full flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                          >
                             <MessageCircle className="w-4 h-4" /> Message Service Provider
                          </button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Pagination (Phase 3) */}
        {!loading && filteredBookings.length > pagination.size && (
          <div className="mt-12">
            <Pagination 
              currentPage={pagination.page}
              totalPages={Math.ceil(filteredBookings.length / pagination.size)}
              onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
            />
          </div>
        )}

        {/* Chat Popup (Phase 4 Hybrid Approach) */}
        {chatPartner && (
          <ChatPopup 
            partnerId={chatPartner.id}
            partnerName={chatPartner.name}
            bookingId={chatPartner.bookingId}
            onClose={() => setChatPartner(null)}
          />
        )}

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setReviewModal({ open: false, booking: null, rating: 5, comment: '', loading: false })}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-white rounded-[3rem] p-10 lg:p-12 max-w-lg w-full shadow-2xl border border-white"
             >
                <div className="text-center mb-8">
                   <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl mb-6">
                      <Star className="w-8 h-8 text-primary-600 fill-primary-600" />
                   </div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">Rate your Experience</h3>
                   <p className="text-slate-500 font-medium mt-2">How was the service provided by {reviewModal.booking?.providerName || 'your professional'}?</p>
                </div>

                <div className="space-y-8">
                   <div className="flex justify-center gap-3">
                      {[1, 2, 3, 4, 5].map(star => (
                         <button 
                           key={star}
                           onClick={() => setReviewModal(p => ({ ...p, rating: star }))}
                           className="transition-all active:scale-90"
                         >
                            <Star className={`w-10 h-10 ${star <= reviewModal.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                         </button>
                      ))}
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Write a Review</label>
                      <textarea 
                        rows="4"
                        value={reviewModal.comment}
                        onChange={(e) => setReviewModal(p => ({ ...p, comment: e.target.value }))}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 text-sm font-medium text-slate-700 focus:border-primary-500/30 outline-none transition-all"
                        placeholder="Tell us what you liked (or what could be improved)..."
                      />
                   </div>

                   <div className="flex flex-col gap-3">
                      <button 
                        disabled={reviewModal.loading}
                        onClick={submitReview}
                        className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-[0.98]"
                      >
                         {reviewModal.loading ? (
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         ) : 'Submit Review'}
                      </button>
                      <button 
                        onClick={() => setReviewModal({ open: false, booking: null, rating: 5, comment: '', loading: false })}
                        className="w-full py-5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-black transition-all"
                      >
                         Cancel
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {cancelModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setCancelModal({ open: false, bookingId: null })}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-white rounded-[3rem] p-10 lg:p-12 max-w-md w-full shadow-[0_30px_100px_-10px_rgba(0,0,0,0.3)] border border-white"
             >
                <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mb-8 mx-auto -mt-20 border-4 border-white shadow-xl">
                   <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <div className="text-center space-y-4 mb-10">
                   <h3 className="text-3xl font-black text-slate-900 leading-tight">Cancel Booking?</h3>
                   <p className="text-slate-500 font-medium leading-relaxed px-4">
                     This will notify your service provider and cancel your appointment. This action cannot be undone.
                   </p>
                </div>
                <div className="flex flex-col gap-3">
                   <button 
                     onClick={confirmCancellation}
                     className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black shadow-xl shadow-red-500/30 transition-all active:scale-[0.98]"
                   >
                      Yes, Cancel Booking
                   </button>
                   <button 
                     onClick={() => setCancelModal({ open: false, bookingId: null })}
                     className="w-full py-5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black transition-all"
                   >
                      Keep My Booking
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default MyBookings;
