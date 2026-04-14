import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Navigation, MapPin, Phone, MessageCircle, 
  Clock, ShieldCheck, CheckCircle2, ChevronLeft,
  AlertCircle, Star, Briefcase, DollarSign, Zap
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import GoogleMap from '../components/GoogleMap';

const ServiceTracking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookingDetails = React.useCallback(async () => {
    try {
      const data = await bookingService.getById(bookingId);
      setBooking(data);
    } catch (err) {
      setError('Unable to load tracking details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBookingDetails();
    // Poll for status updates every 5 seconds for live feel
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchBookingDetails();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchBookingDetails]);

  const statusSteps = [
    { id: 'PENDING_PAYMENT', label: 'Payment', icon: Clock },
    { id: 'CONFIRMED', label: 'Confirmed', icon: ShieldCheck },
    { id: 'ACCEPTED', label: 'Assigned', icon: Briefcase },
    { id: 'UNDER_NEGOTIATION', label: 'Pricing', icon: DollarSign },
    { id: 'ARRIVED', label: 'Arrived', icon: MapPin },
    { id: 'IN_PROGRESS', label: 'Working', icon: Navigation },
    { id: 'PENDING_VERIFICATION', label: 'Verify', icon: Zap },
    { id: 'COMPLETED', label: 'Done', icon: CheckCircle2 }
  ];

  const getProgress = (currentStatus) => {
    const idx = statusSteps.findIndex(s => s.id === currentStatus);
    if (idx === -1) return 0;
    return idx;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
       <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !booking) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
       <div className="max-w-md w-full bg-white rounded-[2rem] p-10 text-center shadow-premium">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Tracking Offline</h2>
          <p className="text-slate-500 font-bold mb-8">We couldn't retrieve the live tracking info for this service.</p>
          <button onClick={() => navigate('/my-bookings')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">
             Back to My Bookings
          </button>
       </div>
    </div>
  );

  const handleAcceptPrice = async () => {
    try {
      await bookingService.acceptPrice(bookingId);
      fetchBookingDetails();
    } catch (err) {
      alert('Failed to accept quote. Please try again.');
    }
  };

  const handleReleasePayment = async () => {
    try {
      await bookingService.complete(bookingId, 'PAID');
      fetchBookingDetails();
    } catch (err) {
      alert('Failed to release payment. Please try again.');
    }
  };

  const currentStep = getProgress(booking.status);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-6 sticky top-0 z-50">
         <div className="container mx-auto px-4 max-w-2xl flex items-center justify-between">
            <button onClick={() => navigate('/my-bookings')} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 mt-2 transition-all">
               <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <h1 className="text-xl font-black text-slate-900 mt-4 tracking-tight">Live Tracking</h1>
            <div className="w-12"></div>
         </div>
      </div>

      <div className="container mx-auto px-4 mt-8 max-w-2xl">
         {/* Live Status Tracker */}
         <div className="bg-white rounded-[2.5rem] p-4 lg:p-10 border border-slate-100 shadow-premium mb-8">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 mt-4">Current Status</p>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {booking.status.replace('_', ' ')}
                  </h2>
               </div>
               <div className="w-16 h-16 bg-primary-50 rounded-[1.5rem] flex items-center justify-center">
                  <Navigation className="w-8 h-8 text-primary-600 animate-pulse" />
               </div>
            </div>

            {/* Phase 3: Negotiation & Escrow Cards */}
            <AnimatePresence>
               {booking.status === 'UNDER_NEGOTIATION' && (
                  <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-8 overflow-hidden"
                  >
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                           <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                           <h3 className="text-xl font-black text-amber-900 mb-1">New Price Proposal</h3>
                           <p className="text-amber-700/80 font-bold text-xs mb-6">
                              The specialist has proposed a revised quote of <span className="text-amber-900 font-black">₹{booking.proposedPrice}</span> due to job complexity.
                           </p>
                           <div className="flex gap-3">
                              <button 
                                 onClick={handleAcceptPrice}
                                 className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
                              >
                                 Accept New Quote
                              </button>
                              <button 
                                 onClick={() => navigate('/messages', { state: { partnerId: booking.providerId } })}
                                 className="px-6 py-3 bg-white border border-amber-200 text-amber-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-50 transition-all"
                              >
                                 Discuss in Chat
                              </button>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}

               {booking.status === 'PENDING_VERIFICATION' && (
                  <motion.div 
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="mb-8 bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200"
                  >
                     <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20">
                              <ShieldCheck className="w-8 h-8" />
                           </div>
                           <div>
                              <h3 className="text-xl font-black mb-1">Verify & Release Payment</h3>
                              <p className="text-indigo-100/80 text-xs font-bold">Check completion photos below before releasing funds.</p>
                           </div>
                        </div>
                        <button 
                           onClick={handleReleasePayment}
                           className="w-full md:w-auto px-10 py-4 bg-white text-indigo-600 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                        >
                           Release ₹{booking.totalPrice} <Zap className="w-4 h-4 fill-indigo-600" />
                        </button>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Stepper UI */}
            <div className="relative pt-4 pb-8 flex justify-between items-start">
               <div className="absolute top-[28px] left-[10%] right-[10%] h-1 bg-slate-100 -z-0">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                    className="h-full bg-primary-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                  />
               </div>
               {statusSteps.map((step, idx) => {
                 const isCompleted = idx <= currentStep;
                 return (
                   <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl border-4 flex items-center justify-center transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-primary-600 border-white shadow-xl ring-4 ring-primary-50' 
                          : 'bg-white border-slate-100 shadow-sm'
                      }`}>
                         <step.icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-slate-300'}`} />
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest text-center max-w-[60px] leading-tight ${
                        isCompleted ? 'text-primary-600' : 'text-slate-400'
                      }`}>
                         {step.label}
                      </span>
                   </div>
                 );
               })}
            </div>

            {(booking.status === 'ACCEPTED' || booking.status === 'ARRIVED' || booking.status === 'IN_PROGRESS') ? (
               <div className="bg-primary-50/50 rounded-3xl p-6 border-2 border-primary-50/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                       <Navigation className="w-6 h-6 text-primary-600 animate-bounce" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest leading-none mb-1">Target Extraction</p>
                       <p className="text-sm font-black text-slate-800">Your specialist is closing in!</p>
                    </div>
                  </div>
                  {booking.etaMinutes && (
                    <div className="text-right flex flex-col items-end">
                       <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest leading-none mb-1">Impact Countdown</p>
                       <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-emerald-500 animate-pulse" />
                          <p className="text-2xl font-black text-primary-600 tracking-tighter">{booking.etaMinutes}<span className="text-[10px] ml-0.5">MIN</span></p>
                       </div>
                    </div>
                  )}
               </div>
            ) : (
               <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                     <Clock className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Wait</p>
                     <p className="text-sm font-black text-slate-800">{booking.status === 'COMPLETED' ? 'Service Completed' : 'Pending Provider Assignment'}</p>
                  </div>
               </div>
            )}
         </div>

          {/* Secure Service PIN (Phase 1) */}
          {(booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED' || booking.status === 'ARRIVED') && booking.pin && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 rounded-[2.5rem] p-8 mb-8 border border-white/10 shadow-2xl relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full blur-[80px] -mr-16 -mt-16 opacity-20"></div>
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                     <h3 className="text-xl font-black text-white mb-1">Secure Start PIN</h3>
                     <p className="text-slate-400 text-xs font-bold">Share this code only when the specialist arrives.</p>
                  </div>
                  <div className="flex gap-2">
                     {booking.pin.split('').map((digit, i) => (
                       <div key={i} className="w-12 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-3xl font-black text-primary-400">
                          {digit}
                       </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {/* Physical Proof Gallery (Phase 1) */}
          {(booking.beforeImageUrl || booking.afterImageUrl) && (
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium mb-8">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Service Proof Gallery</h3>
               <div className="grid grid-cols-2 gap-6">
                  {booking.beforeImageUrl && (
                    <div className="space-y-3">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Before Service</p>
                       <div className="aspect-square rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner group">
                          <img 
                            src={booking.beforeImageUrl} 
                            alt="Before" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          />
                       </div>
                    </div>
                  )}
                  {booking.afterImageUrl && (
                    <div className="space-y-3">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">After Service</p>
                       <div className="aspect-square rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner group">
                          <img 
                            src={booking.afterImageUrl} 
                            alt="After" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          />
                       </div>
                    </div>
                  )}
               </div>
            </div>
          )}

         {/* Map Simulation */}
         {(booking.status === 'ACCEPTED' || booking.status === 'ARRIVED' || booking.status === 'IN_PROGRESS') && (
            <div className="bg-white rounded-[2.5rem] p-2 border border-slate-100 shadow-premium mb-8 overflow-hidden h-72">
               <GoogleMap 
                 latitude={booking.service?.latitude || 0} 
                 longitude={booking.service?.longitude || 0} 
                 services={[booking.service]}
                 activeServiceId={booking.service?.id}
                 providerLocation={(booking.providerLat && booking.providerLng) ? { lat: booking.providerLat, lng: booking.providerLng } : null}
               />
            </div>
         )}

         {/* Provider Context */}
         <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium mb-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Service Expert</h3>
            <div className="flex items-center gap-6 mb-8">
               <div className="w-20 h-20 bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-slate-200/50">
                  <img src={`https://i.pravatar.cc/150?u=${booking.provider?.id || 'expert'}`} alt="" className="w-full h-full object-cover" />
               </div>
               <div className="flex-1">
                  <h4 className="text-2xl font-black text-slate-900 leading-tight mb-1">{booking.service?.providerName || 'Expert Partner'}</h4>
                  <div className="flex items-center gap-1.5 text-primary-600 mb-2">
                     <Star className="w-4 h-4 fill-current" />
                     <span className="text-sm font-black tracking-tight">4.9 • Industry Certified</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 tracking-tight">{booking.service?.title}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <a href={`tel:${booking.provider?.phone || ''}`} className="flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 transition-all active:scale-[0.98]">
                  <Phone className="w-4 h-4" /> Call Expert
               </a>
               <button 
                  onClick={() => navigate('/messages', { 
                    state: { 
                      partnerId: booking.provider?.id, 
                      partnerName: booking.service?.providerName,
                      bookingId: booking.id
                    } 
                  })}
                  className="flex items-center justify-center gap-3 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black transition-all active:scale-[0.98]"
               >
                  <MessageCircle className="w-4 h-4" /> Message
               </button>
            </div>
         </div>

         {/* Phase 6: Specialist Showcase & Trust Layer */}
         <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-40 -mr-16 -mt-16"></div>
            <div className="flex items-center gap-4 mb-8">
               <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-xl">
                  {booking.providerName?.charAt(0)}
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{booking.providerName}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                     <Star className="w-3.5 h-3.5 fill-current" />
                     {booking.service?.averageRating?.toFixed(1) || '4.9'} • Direct Specialist
                  </div>
               </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mb-8 flex items-start gap-3">
               <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5" />
               <p className="text-[10px] text-emerald-700 font-bold leading-relaxed">
                  Verified specialist with <span className="font-black">100% security clearance</span>. carries Diamond Trust certification.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1581578731548-c64695ce6958?auto=format&fit=crop&q=80&w=200" alt="Work 1" className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
                </div>
                <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200" alt="Work 2" className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
                </div>
            </div>

            <button 
               onClick={() => navigate('/messages', { state: { partnerId: booking.providerId } })}
               className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
            >
               <MessageCircle className="w-4 h-4 text-primary-400" /> Secure Communications
            </button>
         </div>

         {/* Job Details Card */}
         <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Execution Summary</h3>
            <div className="space-y-6">
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                     <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Location</p>
                     <p className="text-sm font-bold text-slate-700 leading-relaxed max-w-[200px]">{booking.service?.location || 'Registered address'}</p>
                  </div>
               </div>
               
               <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Order ID</p>
                     <p className="text-xs font-black text-slate-900">#PRX-{booking.id?.toString().padStart(6, '0')}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Committed</p>
                     <p className="text-lg font-black text-primary-600 tracking-tight">₹{booking.totalPrice}</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ServiceTracking;
