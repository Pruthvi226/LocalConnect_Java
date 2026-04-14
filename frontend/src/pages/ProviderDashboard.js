import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Users, 
  Plus, Edit2, Trash2, CheckCircle2, 
  Clock, XCircle, AlertCircle, 
  MessageSquare, DollarSign, Zap,
  Filter, Settings,
  ShieldCheck, LayoutDashboard,
  ArrowUpRight, Search,
  Calendar, MapPin, Star, Phone,
  ArrowRight, MessageCircle
} from 'lucide-react';
import dayjs from 'dayjs';
import { providerService } from '../services/providerService';
import { serviceService } from '../services/serviceService';
import { userService } from '../services/userService';
import Pagination from '../components/Pagination';
import ChatPopup from '../components/ChatPopup';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState({});
  const [proofImages, setProofImages] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [UserProfile, setUserProfile] = useState(null);
  const [enteredPin, setEnteredPin] = useState({});
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed', 'cancelled', 'services', 'earnings'
  const [completionModal, setCompletionModal] = useState({ open: false, bookingId: null, loading: false });
  const [chatPartner, setChatPartner] = useState(null); // { id, name, bookingId }
  const [negotiatePrice, setNegotiatePrice] = useState({}); // { [bookingId]: price }
  
  const [jobsPage, setJobsPage] = useState(0);
  const [jobsTotalPages, setJobsTotalPages] = useState(0);
  const [jobsTotalElements, setJobsTotalElements] = useState(0);
  
  const [txPage, setTxPage] = useState(0);
  const [txTotalPages, setTxTotalPages] = useState(0);
  const [txTotalElements, setTxTotalElements] = useState(0);
  
  const pageSize = 10;
  
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: '', description: '', category: '', price: '', location: '', isAvailable: true
  });
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    fullName: '', bankAccountNumber: '', ifscCode: '', upiId: ''
  });

  
  useEffect(() => {
    loadData();
    
    // 5s polling for active jobs (Phase 6 optimization)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && (activeTab === 'active' || activeTab === 'tasks')) {
        loadJobs();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    // Reset page to 0 when switching tabs to avoid "no results" on high pages
    setJobsPage(0);
    loadJobs();
  }, [activeTab]);

  useEffect(() => {
    loadJobs();
  }, [jobsPage]);

  useEffect(() => {
    loadTransactions();
  }, [txPage]);

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      const [summaryData, servicesData, meData] = await Promise.all([
        providerService.getSummary(),
        providerService.getMyServices(),
        userService.getMe().catch(() => null)
      ]);
      setSummary(summaryData);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      
      if (meData) {
        setUserProfile(meData);
        setPayoutForm({
          fullName: meData.fullName || '',
          bankAccountNumber: meData.bankAccountNumber || '',
          ifscCode: meData.ifscCode || '',
          upiId: meData.upiId || ''
        });
      }
      
      // Load first pages
      await Promise.all([loadJobs(), loadTransactions()]);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      let status = null;
      if (activeTab === 'completed') status = 'COMPLETED';
      else if (activeTab === 'cancelled') status = 'CANCELLED';
      else if (activeTab === 'active') {
        // For 'active', we might want to fetch all and filter client-side 
        // OR the backend could support multiple statuses. 
        // Since getProviderBookings only takes ONE status, we'll fetch all and filter client-side for active.
        status = null; 
      }

      const data = await providerService.getProviderBookings({
        status: status,
        page: jobsPage,
        size: pageSize,
        sort: 'createdAt,desc'
      });
      setBookings(data.content || []);
      setJobsTotalPages(data.totalPages || 0);
      setJobsTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Error loading jobs:', err);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await providerService.getProviderTransactions({
        page: txPage,
        size: pageSize,
        sort: 'createdAt,desc'
      });
      setTransactions(data.content || []);
      setTxTotalPages(data.totalPages || 0);
      setTxTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  const handleConfirmPayment = async (paymentId) => {
    try {
      await providerService.confirmOfflinePayment(paymentId);
      await loadData();
    } catch (err) {
      console.error('Payment confirmation failed:', err);
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'CONFIRMED': return { label: 'Accept Booking', next: 'ACCEPTED' };
      case 'ACCEPTED': return { label: 'Mark as Arrived', next: 'ARRIVED' };
      case 'ARRIVED': return { label: 'Start Service', next: 'IN_PROGRESS' };
      case 'IN_PROGRESS': return { label: 'Complete & Request Verify', next: 'COMPLETED' };
      case 'UNDER_NEGOTIATION': return { label: 'Awaiting Quote Approval', next: null };
      case 'PENDING_VERIFICATION': return { label: 'Awaiting Customer Release', next: null };
      default: return null;
    }
  };

  const filteredJobs = bookings.filter(b => {
    if (activeTab === 'active') return !['COMPLETED', 'CANCELLED'].includes(b.status);
    if (activeTab === 'completed') return b.status === 'COMPLETED';
    if (activeTab === 'cancelled') return b.status === 'CANCELLED';
    return true;
  });

  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (newStatus === 'COMPLETED') {
      setCompletionModal({ open: true, bookingId, loading: false });
      return;
    }

    try {
      setStatusUpdating(prev => ({ ...prev, [bookingId]: true }));
      const imgs = proofImages[bookingId] || {};
      const pin = enteredPin[bookingId];
      
      // Call service
      await providerService.updateBookingStatus(bookingId, newStatus, null, imgs.before, imgs.after, null, null, null, pin);
      
      // Immediate UI Feedback (Phase 1 Fix)
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));

      // Refresh data
      await loadData();
      
      // Clear images after update
      setProofImages(prev => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      // Detailed error for user (Stability Rule)
      const errorMsg = err.response?.data?.message || `Failed to transition to ${newStatus}. Please check connection.`;
      alert(errorMsg); 
    } finally {
      setStatusUpdating(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleFinalizeCompletion = async (paymentStatus) => {
    const { bookingId } = completionModal;
    if (!bookingId) return;

    setCompletionModal(prev => ({ ...prev, loading: true }));
    try {
      const imgs = proofImages[bookingId] || {};
      // Step 1: Update images/notes if any
      if (imgs.after) {
        await providerService.updateBookingStatus(bookingId, 'IN_PROGRESS', null, null, imgs.after);
      }
      
      // Step 2: Call specialized complete API
      await providerService.completeBooking(bookingId, { paymentStatus });
      
      // Optimistic Update
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'COMPLETED', paymentStatus: paymentStatus === 'PAID' ? 'COMPLETED' : b.paymentStatus } : b
      ));

      setCompletionModal({ open: false, bookingId: null, loading: false });
      await loadData();
    } catch (err) {
      console.error('Completion finalization failed:', err);
      alert('Failed to complete booking. Please try again.');
    } finally {
      setCompletionModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleProposePrice = async (bookingId) => {
    const price = negotiatePrice[bookingId];
    if (!price || isNaN(price)) {
      alert('Please enter a valid price.');
      return;
    }
    try {
      setStatusUpdating(prev => ({ ...prev, [bookingId]: true }));
      await providerService.proposePrice(bookingId, price);
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'UNDER_NEGOTIATION', proposedPrice: price } : b
      ));
      setNegotiatePrice(prev => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
      await loadData();
    } catch (err) {
      console.error('Failed to propose price:', err);
      alert('Failed to send proposal.');
    } finally {
      setStatusUpdating(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleProofImageChange = (bookingId, field, value) => {
    setProofImages(prev => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], [field]: value }
    }));
  };

  const handleOpenServiceDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        title: service.title,
        description: service.description || '',
        category: service.category || '',
        price: service.price?.toString() || '',
        location: service.location || '',
        isAvailable: service.isAvailable !== false
      });
    } else {
      setEditingService(null);
      setServiceForm({ title: '', description: '', category: '', price: '', location: '', isAvailable: true });
    }
    setServiceDialogOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...serviceForm, price: parseFloat(serviceForm.price) || 0 };
      if (editingService) await serviceService.update(editingService.id, payload);
      else await serviceService.create(payload);
      setServiceDialogOpen(false);
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Archive this service profile?')) return;
    try {
      await serviceService.delete(id);
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleSavePayouts = async (e) => {
    e.preventDefault();
    try {
      await userService.updateMe(payoutForm);
      setPayoutDialogOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to update payout settings', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 px-6 flex flex-col items-center">
         <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
         <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Dashboard...</p>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-white p-8 rounded-[3rem] border border-red-100 shadow-premium">
             <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-2">Service unavailable.</h2>
             <p className="text-slate-500 font-medium mb-6">{error}</p>
             <button onClick={loadData} className="bg-primary-600 hover:bg-primary-700 text-white font-black py-3 px-8 rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-95">
                Reconnect
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
        
        {/* Dashboard Header */}
        <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
           <div>
              <div className="flex items-center gap-3 text-primary-600 mb-2 font-black uppercase tracking-[0.2em] text-[10px]">
                 <LayoutDashboard className="w-4 h-4" />
                 Provider Portfolio
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Provider <span className="text-primary-600">Dashboard</span>
              </h1>
           </div>
           <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 px-4 border-r border-slate-100">
                 <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                    <p className="text-sm font-bold text-slate-900 leading-none">Accepting Requests</p>
                 </div>
              </div>
              <button 
                onClick={() => handleOpenServiceDialog()}
                className="bg-primary-600 hover:bg-primary-700 text-white font-black py-3 px-8 rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                 <Plus className="w-4 h-4" />
                 Add New Service
              </button>
              <button 
                onClick={() => setPayoutDialogOpen(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 font-black py-3 px-6 border-2 border-slate-200 rounded-2xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                 <Settings className="w-4 h-4" />
                 Payout Settings
              </button>
           </div>
        </header>

        {/* Global Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           {[
             { label: 'Total Earnings', value: `₹${Number(summary?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', trend: 'Lifetime' },
             { label: 'Pending Completion', value: bookings.filter(b => !['COMPLETED', 'CANCELLED'].includes(b.status)).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Active now' },
             { label: 'Completed Jobs', value: summary?.completedBookings || 0, icon: ShieldCheck, color: 'text-primary-600', bg: 'bg-primary-50', trend: 'Excellent' },
             { label: 'My Services', value: services.length, icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Stable performance' },
           ].map((stat, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-primary-200 transition-colors"
             >
                <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{stat.value}</h3>
                <p className="text-[11px] font-bold text-slate-500 leading-none flex items-center gap-1">
                   <TrendingUp className="w-3 h-3 text-green-500" />
                   {stat.trend}
                </p>
             </motion.div>
           ))}
        </section>

        <div className="grid lg:grid-cols-3 gap-12">
           
           {/* Main Work Area */}
           <div className="lg:col-span-2 space-y-12">

              {/* Navigation Tabs */}               <div className="flex space-x-2 bg-slate-200/50 p-2 rounded-2xl">
                <button 
                   onClick={() => setActiveTab('active')}
                   className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >Active Jobs</button>
                <button 
                   onClick={() => setActiveTab('completed')}
                   className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all ${activeTab === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >Completed</button>
                <button 
                   onClick={() => setActiveTab('cancelled')}
                   className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all ${activeTab === 'cancelled' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >Cancelled</button>
                <button 
                   onClick={() => setActiveTab('services')}
                   className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all ${activeTab === 'services' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >Services</button>
                <button 
                   onClick={() => setActiveTab('earnings')}
                   className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all ${activeTab === 'earnings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >Earnings</button>
              </div>

              {/* Active Requests Inbox */}
              {['active', 'completed', 'cancelled'].includes(activeTab) && (
              <section>
                 <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-2xl font-black text-slate-900">
                      {activeTab === 'active' ? 'Active Pipeline' : activeTab === 'completed' ? 'Service History' : 'Cancelled Jobs'}
                    </h2>
                 </div>

                  {filteredJobs.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-premium">
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <MessageSquare className="w-10 h-10 text-slate-200" />
                       </div>
                       <h4 className="text-xl font-black text-slate-800 mb-2">Workspace Clear</h4>
                       <p className="text-slate-500 font-medium">No {activeTab} jobs at the moment.</p>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <AnimatePresence mode="popLayout">
                         {filteredJobs.map((booking) => {
                            const nextAction = getNextStatus(booking.status);
                            const isOfflinePaymentPending = booking.paymentMethod === 'OFFLINE' && booking.paymentStatus === 'PENDING';

                            return (
                               <motion.div 
                                key={booking.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium flex flex-col md:flex-row md:items-start gap-8 group"
                               >
                                  <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200/50 shadow-inner">
                                     <img src={`https://i.pravatar.cc/150?u=${booking.Customer?.id || 'Customer'}`} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h4 className="text-xl font-black text-slate-900 truncate">
                                           {booking.Customer?.fullName || 'ProxiSense Client'}
                                        </h4>
                                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                            booking.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-100' : 
                                            booking.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            booking.status === 'ARRIVED' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                            booking.status === 'PENDING_VERIFICATION' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                            booking.status === 'UNDER_NEGOTIATION' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-slate-50 text-slate-600 border-slate-100'
                                         }`}>
                                            {booking.status === 'PENDING_VERIFICATION' ? 'VERIFICATION PENDING' : booking.status.replace('_', ' ')}
                                         </span>
                                         {booking.isEmergency && (
                                           <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-red-50 text-red-600 border-red-100 flex items-center gap-1 shadow-sm">
                                              <Zap className="w-3 h-3" /> URGENT
                                           </span>
                                         )}
                                     </div>
                                     <p className="text-slate-500 font-bold text-sm mb-6">
                                        Fulfilling Service: <span className="text-primary-600 underline decoration-2 underline-offset-4">{booking.service?.title}</span>
                                     </p>
                                     <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div>
                                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Schedule</p>
                                           <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                              <Calendar className="w-3.5 h-3.5" /> {dayjs(booking.bookingDate).format('MMM D, h:mm A')}
                                           </p>
                                        </div>
                                        <div>
                                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quote</p>
                                           <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                              <DollarSign className="w-3.5 h-3.5 text-green-600" /> ₹{booking.totalPrice}
                                              {booking.proposedPrice && <span className="text-[10px] text-amber-500 font-bold ml-1">(Proposal: ₹{booking.proposedPrice})</span>}
                                           </p>
                                        </div>

                                      {/* Phase 3: Negotiation Input */}
                                      {(booking.status === 'ACCEPTED' || booking.status === 'ARRIVED' || booking.status === 'IN_PROGRESS') && (
                                        <div className="mt-4 flex gap-2">
                                           <div className="relative flex-1">
                                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                              <input 
                                                type="number"
                                                placeholder="Propose New Price..."
                                                value={negotiatePrice[booking.id] || ''}
                                                onChange={(e) => setNegotiatePrice(prev => ({ ...prev, [booking.id]: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-8 pr-3 text-[10px] font-bold text-slate-700 focus:outline-none focus:border-amber-400 transition-all border shadow-inner"
                                              />
                                           </div>
                                           <button 
                                             onClick={() => handleProposePrice(booking.id)}
                                             className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-200 active:scale-95"
                                           >
                                              Offer
                                           </button>
                                        </div>
                                      )}
                                     </div>
                                     <div className="flex flex-wrap gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-300" /> {booking.service?.location}</div>
                                        {booking.problemImageUrl && (
                                          <a href={booking.problemImageUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 transition-colors">
                                             <ArrowUpRight className="w-3.5 h-3.5" /> Client Photos
                                          </a>
                                        )}
                                     </div>
                                  </div>

                                  <div className="flex flex-col gap-3 w-full md:w-64">
                                     {booking.status === 'ARRIVED' && (
                                       <>
                                       <div className="mb-2 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                          <div className="flex justify-between items-center mb-2 px-1">
                                             <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Proof: Before Service</p>
                                             <span className="text-[8px] font-bold text-indigo-300 uppercase italic">Optional</span>
                                          </div>
                                          <input 
                                            type="text"
                                            placeholder="Image URL (recommended)..."
                                            value={proofImages[booking.id]?.before || ''}
                                            onChange={(e) => handleProofImageChange(booking.id, 'before', e.target.value)}
                                            className="w-full bg-white border border-indigo-200/50 rounded-xl py-2 px-3 text-[10px] font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                                          />
                                       </div>
                                       <div className="mb-2 p-3 bg-slate-900 rounded-2xl border border-white/10 shadow-lg">
                                          <div className="flex justify-between items-center mb-2 px-1">
                                             <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest leading-none">Security: Verify Customer PIN</p>
                                             <ShieldCheck className="w-3 h-3 text-primary-500" />
                                          </div>
                                          <input 
                                            type="text"
                                            maxLength="4"
                                            placeholder="Enter 4-digit code..."
                                            value={enteredPin[booking.id] || ''}
                                            onChange={(e) => setEnteredPin(prev => ({ ...prev, [booking.id]: e.target.value }))}
                                            className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-[10px] font-black text-white focus:outline-none focus:border-primary-500 transition-all text-center tracking-[0.5em]"
                                          />
                                       </div>
                                       </>
                                     )}
                                     {booking.status === 'IN_PROGRESS' && (
                                       <div className="mb-2 p-3 bg-green-50/50 rounded-2xl border border-green-100/50">
                                          <div className="flex justify-between items-center mb-2 px-1">
                                             <p className="text-[9px] font-black text-green-400 uppercase tracking-widest leading-none">Completion Photo</p>
                                             <span className="text-[8px] font-bold text-green-300 uppercase italic">Optional</span>
                                          </div>
                                          <input 
                                            type="text"
                                            placeholder="Image URL (recommended)..."
                                            value={proofImages[booking.id]?.after || ''}
                                            onChange={(e) => handleProofImageChange(booking.id, 'after', e.target.value)}
                                            className="w-full bg-white border border-green-200/50 rounded-xl py-2 px-3 text-[10px] font-bold text-slate-700 focus:outline-none focus:border-green-500 transition-all shadow-inner"
                                          />
                                       </div>
                                     )}
                                     {booking.status === 'COMPLETED' && (
                                         <div className="space-y-3">
                                            <div className={`p-4 rounded-2xl border flex flex-col items-center gap-1 ${booking.paymentStatus === 'COMPLETED' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                                               <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Revenue Status</p>
                                               <p className="text-sm font-black flex items-center gap-2">
                                                  {booking.paymentStatus === 'COMPLETED' ? <ShieldCheck className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                  {booking.paymentStatus === 'COMPLETED' ? 'Settled to Wallet' : 'Payment Processing'}
                                               </p>
                                            </div>
                                            <button 
                                              type="button"
                                              onClick={async () => {
                                                try {
                                                  const blob = await providerService.getInvoice(booking.id);
                                                  const url = window.URL.createObjectURL(new Blob([blob]));
                                                  const a = document.createElement('a');
                                                  a.href = url;
                                                  a.download = `invoice_${booking.id}.pdf`;
                                                  a.click();
                                                } catch (err) {
                                                  alert('Invoice generation failed.');
                                                }
                                              }}
                                              className="w-full bg-slate-100 text-slate-600 font-black py-4 px-6 rounded-2xl text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                            >
                                               <DollarSign className="w-4 h-4" /> Download Invoice
                                            </button>
                                         </div>
                                      )}

                                      <button 
                                        type="button"
                                        onClick={() => setChatPartner({
                                          id: booking.customerId,
                                          name: booking.customerName,
                                          bookingId: booking.id
                                        })}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 transition-all font-black text-xs uppercase"
                                      >
                                         <MessageCircle className="w-4 h-4" /> Message Customer
                                      </button>

                                      {nextAction && (
                                         <button 
                                           type="button"
                                           disabled={statusUpdating[booking.id]}
                                           onClick={() => handleUpdateStatus(booking.id, nextAction.next)}
                                           className={`w-full font-black py-4 px-6 rounded-2xl text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg ${
                                              nextAction.next === 'ACCEPTED' ? 'bg-slate-900 text-white hover:bg-black shadow-slate-200' :
                                              nextAction.next === 'ARRIVED' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' :
                                              nextAction.next === 'IN_PROGRESS' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' :
                                              'bg-green-600 text-white hover:bg-green-700 shadow-green-200'
                                           }`}
                                         >
                                            {statusUpdating[booking.id] ? (
                                              <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Updating...
                                              </div>
                                            ) : nextAction.label}
                                         </button>
                                      )}
                                      {isOfflinePaymentPending && (
                                         <button 
                                           onClick={() => handleConfirmPayment(booking.paymentId)}
                                           className="w-full bg-orange-100 text-orange-700 font-black py-4 px-6 rounded-2xl text-sm border-2 border-orange-200 hover:bg-orange-200 transition-all flex items-center justify-center gap-2"
                                         >
                                            <CheckCircle2 className="w-5 h-5" /> Confirm UPI/Cash
                                         </button>
                                      )}
                                      {!['COMPLETED', 'CANCELLED'].includes(booking.status) && (
                                      <div className="flex gap-2">
                                         <button 
                                           type="button"
                                           disabled={statusUpdating[booking.id]}
                                           onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                                           className="flex-1 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 font-black text-[10px] uppercase"
                                         >
                                            <Trash2 className="w-4 h-4" /> {booking.status === 'CONFIRMED' ? 'Reject Job' : 'Cancel Action'}
                                         </button>
                                         <a href={`tel:${booking.Customer?.phone || ''}`} className="p-4 bg-slate-100 text-slate-500 rounded-2xl border border-slate-200 hover:bg-slate-200 transition-all flex items-center justify-center">
                                            <Phone className="w-5 h-5" />
                                         </a>
                                      </div>
                                      )}
                                  </div>
                               </motion.div>
                            );
                         })}
                       </AnimatePresence>
                       
                       {bookings.length > 0 && (
                         <Pagination 
                           currentPage={jobsPage}
                           totalPages={jobsTotalPages}
                           onPageChange={setJobsPage}
                           totalElements={jobsTotalElements}
                           size={pageSize}
                         />
                       )}
                    </div>
                 )}
              </section>
              )}

              {/* Service Inventory */}
              {activeTab === 'services' && (
              <section>
                 <div className="bg-white rounded-[3rem] p-8 lg:p-12 border border-slate-100 shadow-premium overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                       <h2 className="text-2xl font-black text-slate-800 tracking-tight">Service Ecosystem</h2>
                       <Search className="text-slate-300 w-5 h-5" />
                    </div>
                    
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="border-b border-slate-50">
                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Insight</th>
                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Metric</th>
                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visibility</th>
                                <th className="pb-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {services.map((s) => (
                                <tr key={s.id} className="group transition-colors hover:bg-slate-50/50">
                                   <td className="py-6 pr-4">
                                      <p className="font-black text-slate-800 leading-tight mb-1">{s.title}</p>
                                      <p className="text-xs font-bold text-slate-400 tracking-tight">{s.category}</p>
                                   </td>
                                   <td className="py-6 pr-4">
                                      <p className="font-black text-primary-600">₹{s.price}</p>
                                   </td>
                                   <td className="py-6 pr-4">
                                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                         s.isAvailable ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                      }`}>
                                         <div className={`w-1.5 h-1.5 rounded-full ${s.isAvailable ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                         {s.isAvailable ? 'Public' : 'Hidden'}
                                      </div>
                                   </td>
                                   <td className="py-6 text-right">
                                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => handleOpenServiceDialog(s)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary-600 hover:border-primary-200 shadow-sm transition-all">
                                            <Edit2 className="w-4 h-4" />
                                         </button>
                                         <button onClick={() => handleDeleteService(s.id)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all">
                                            <Trash2 className="w-4 h-4" />
                                         </button>
                                      </div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </section>
              )}

              {/* Earnings & Transactions */}
              {activeTab === 'earnings' && (
              <section>
                 <div className="bg-white rounded-[3rem] p-8 lg:p-12 border border-slate-100 shadow-premium overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                       <h2 className="text-2xl font-black text-slate-800 tracking-tight">Financial Ledger</h2>
                       {(!UserProfile?.upiId && !UserProfile?.bankAccountNumber) && (
                         <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 cursor-pointer" onClick={() => setPayoutDialogOpen(true)}>
                           <AlertCircle className="w-4 h-4"/> Missing Payout Method
                         </div>
                       )}
                    </div>
                    
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="border-b border-slate-50">
                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference</th>
                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="pb-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {transactions.length === 0 && (
                               <tr><td colSpan="4" className="text-center py-8 text-slate-400 font-bold text-sm">No transactions to display.</td></tr>
                             )}
                             {transactions.map((tx) => (
                                <tr key={tx.id} className="group transition-colors hover:bg-slate-50/50">
                                    <td className="py-6 pr-4">
                                       <p className="font-black text-slate-800 leading-tight mb-1">#{tx.id}</p>
                                       <p className="text-xs font-bold text-slate-400 tracking-tight">Order #{tx.paymentId}</p>
                                    </td>
                                   <td className="py-6 pr-4">
                                      <p className="font-bold text-slate-700">{dayjs(tx.createdAt).format('MMM D, YYYY')}</p>
                                      <p className="text-xs text-slate-400">{dayjs(tx.createdAt).format('h:mm A')}</p>
                                   </td>
                                   <td className="py-6 pr-4">
                                      <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest ${tx.payoutStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                         {tx.payoutStatus}
                                      </span>
                                   </td>
                                   <td className="py-6 text-right">
                                      <p className="font-black text-green-600">₹{tx.amount}</p>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                    <div className="mt-8">
                       <Pagination 
                         currentPage={txPage}
                         totalPages={txTotalPages}
                         onPageChange={setTxPage}
                         totalElements={txTotalElements}
                         size={pageSize}
                       />
                    </div>
                 </div>
              </section>
              )}
           </div>

           {/* Performance sidebar */}
           <div className="lg:col-span-1 space-y-8">
              <section className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full blur-[80px] -mr-16 -mt-16 opacity-30"></div>
                 <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-10 leading-tight">Growth <br /> Analytics</h3>
                    
                    <div className="space-y-8">
                       {[
                         { label: 'Booking Success', val: 94, color: 'bg-primary-500' },
                         { label: 'Response Speed', val: 82, color: 'bg-green-500' },
                         { label: 'Resolution Rate', val: 78, color: 'bg-indigo-500' }
                       ].map((m, i) => (
                         <div key={i}>
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3 opacity-60">
                               <span>{m.label}</span>
                               <span>{m.val}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 whileInView={{ width: `${m.val}%` }}
                                 className={`h-full ${m.color}`}
                               ></motion.div>
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Reputation Score</p>
                          <div className="flex items-center gap-1.5">
                             <span className="text-2xl font-black">{UserProfile?.averageRating?.toFixed(1) || '0.0'}</span>
                             <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                             <span className="text-[10px] text-white/40 font-bold ml-1">({UserProfile?.totalReviews || 0} reviews)</span>
                          </div>
                       </div>
                       <button className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
                          <ArrowUpRight className="w-5 h-5 text-primary-400" />
                       </button>
                    </div>
                 </div>
              </section>

              <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium">
                 <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary-500" />
                    Quick Insights
                 </h4>
                 <ul className="space-y-4">
                    <li className="p-4 bg-slate-50 rounded-2xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Busy Window</p>
                       <p className="text-sm font-bold text-slate-700">Tue & Fri are your peak days.</p>
                    </li>
                    <li className="p-4 bg-slate-50 rounded-2xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Optimization</p>
                       <p className="text-sm font-bold text-slate-700">Response time improved by 4m.</p>
                    </li>
                 </ul>
              </section>
           </div>

        </div>
      </div>

      {/* Service Editor Modal */}
      <AnimatePresence>
        {serviceDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 mt-12">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setServiceDialogOpen(false)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             ></motion.div>
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">
                   {editingService ? 'Refine Service' : 'Initialize Specialist Profile'}
                </h3>
                
                <form onSubmit={handleSaveService} className="grid md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Service Title</label>
                      <input 
                        required
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-primary-500 transition-colors"
                        placeholder="e.g. Master Pipe Installation"
                        value={serviceForm.title}
                        onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                      />
                   </div>
                   <div className="md:col-span-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Visual Description</label>
                      <textarea 
                        rows="3"
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-medium text-slate-700 focus:outline-none focus:border-primary-500 transition-colors"
                        placeholder="Detail your process and tools used..."
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      />
                   </div>
                   <div>
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Specialization Category</label>
                      <input 
                        required
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-primary-500 transition-colors"
                        placeholder="e.g. Technical Repair"
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                      />
                   </div>
                   <div>
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Professional Fee (₹)</label>
                      <input 
                        required
                        type="number"
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-black text-primary-600 focus:outline-none focus:border-primary-500 transition-colors"
                        placeholder="0.00"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                      />
                   </div>
                   <div>
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Operating Base</label>
                      <input 
                        required
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-primary-500 transition-colors"
                        placeholder="e.g. Downtown Core"
                        value={serviceForm.location}
                        onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                      />
                   </div>
                   <div>
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Project Visibility</label>
                      <select 
                        value={serviceForm.isAvailable}
                        onChange={(e) => setServiceForm({ ...serviceForm, isAvailable: e.target.value === 'true' })}
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-primary-500 transition-colors appearance-none"
                      >
                         <option value="true">Publicly Listed</option>
                         <option value="false">Private Staging</option>
                      </select>
                   </div>
                   
                   <div className="md:col-span-2 pt-6 flex gap-4">
                      <button 
                        type="submit"
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/20 active:scale-95 transition-all outline-none"
                      >
                         Sync to Cloud
                      </button>
                      <button 
                        type="button"
                        onClick={() => setServiceDialogOpen(false)}
                        className="px-10 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all outline-none"
                      >
                         Abort
                      </button>
                   </div>
                </form>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Payout Settings Modal */}
      <AnimatePresence>
        {payoutDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 mt-12">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setPayoutDialogOpen(false)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             ></motion.div>
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                   Payout Configuration
                </h3>
                <p className="text-sm font-bold text-slate-500 mb-8 tracking-tight">Configure where you want to receive your earnings.</p>
                
                <form onSubmit={handleSavePayouts} className="grid md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Full Name (As per Bank)</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-green-500 transition-colors"
                        placeholder="John Doe"
                        value={payoutForm.fullName}
                        onChange={(e) => setPayoutForm({ ...payoutForm, fullName: e.target.value })}
                      />
                   </div>
                   <div className="md:col-span-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">UPI ID (Fastest)</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-green-500 transition-colors"
                        placeholder="yourname@upi"
                        value={payoutForm.upiId}
                        onChange={(e) => setPayoutForm({ ...payoutForm, upiId: e.target.value })}
                      />
                   </div>
                   <div className="md:col-span-2 relative">
                      <div className="absolute inset-0 flex items-center">
                         <div className="w-full border-t border-slate-100"></div>
                      </div>
                      <div className="relative flex justify-center text-xs font-black uppercase tracking-widest text-slate-300 bg-white">
                         <span className="px-4 bg-white">OR BANK DETAILS</span>
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Bank Account Number</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-green-500 transition-colors"
                        placeholder="•••• •••• •••• 1234"
                        value={payoutForm.bankAccountNumber}
                        onChange={(e) => setPayoutForm({ ...payoutForm, bankAccountNumber: e.target.value })}
                      />
                   </div>
                   <div>
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">IFSC Code</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-green-500 transition-colors"
                        placeholder="ABCD0123456"
                        value={payoutForm.ifscCode}
                        onChange={(e) => setPayoutForm({ ...payoutForm, ifscCode: e.target.value })}
                      />
                   </div>
                   
                   <div className="md:col-span-2 pt-6 flex gap-4">
                      <button 
                        type="submit"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-500/20 active:scale-95 transition-all outline-none"
                      >
                         Secure Payout Info
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPayoutDialogOpen(false)}
                        className="px-10 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all outline-none"
                      >
                         Cancel
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Completion Confirmation Modal */}
      <AnimatePresence>
        {completionModal.open && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => !completionModal.loading && setCompletionModal({ open: false, bookingId: null, loading: false })}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             ></motion.div>
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 40 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 40 }}
               className="relative bg-white rounded-[3.5rem] p-12 max-w-md w-full shadow-2xl border border-white"
             >
                <div className="w-24 h-24 bg-primary-50 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-xl shadow-primary-500/10">
                   <CheckCircle2 className="w-12 h-12 text-primary-600" />
                </div>
                
                <div className="text-center mb-10">
                   <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Complete Service</h3>
                   <p className="text-slate-500 font-bold leading-relaxed px-4">
                      Before finalizing, has the customer completed the payment for this job?
                   </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                   <button 
                     disabled={completionModal.loading}
                     onClick={() => handleFinalizeCompletion('PAID')}
                     className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                      <ShieldCheck className="w-5 h-5 text-primary-400" />
                      Payment Received
                   </button>
                   <button 
                     disabled={completionModal.loading}
                     onClick={() => handleFinalizeCompletion('PENDING')}
                     className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-black py-5 rounded-3xl border-2 border-slate-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                      <Clock className="w-5 h-5 text-amber-500" />
                      Payment Pending
                   </button>
                   <button 
                     disabled={completionModal.loading}
                     onClick={() => setCompletionModal({ open: false, bookingId: null, loading: false })}
                     className="mt-2 text-slate-400 hover:text-slate-600 font-black text-xs uppercase tracking-widest transition-colors py-2"
                   >
                      Go Back
                   </button>
                </div>

                {completionModal.loading && (
                   <div className="mt-8 flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing Transaction...</p>
                   </div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ChatPopup 
        partnerId={chatPartner?.id}
        partnerName={chatPartner?.name}
        bookingId={chatPartner?.bookingId}
        onClose={() => setChatPartner(null)}
      />
    </div>
  );
};

export default ProviderDashboard;
