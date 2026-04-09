import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Navigation, MapPin, Phone, MessageCircle, 
  Clock, ShieldCheck, CheckCircle2, ChevronLeft,
  AlertCircle, Star, Image as ImageIcon, Briefcase
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import GoogleMap from '../components/GoogleMap';

const ServiceTracking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchBookingDetails();
    // Poll for status updates every 5 seconds for live feel
    const interval = setInterval(fetchBookingDetails, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const data = await bookingService.getById(bookingId);
      setBooking(data);
    } catch (err) {
      setError('Unable to load tracking details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { id: 'PENDING_PAYMENT', label: 'Payment', icon: Clock },
    { id: 'CONFIRMED', label: 'Confirmed', icon: ShieldCheck },
    { id: 'ACCEPTED', label: 'Assigned', icon: Briefcase },
    { id: 'ARRIVED', label: 'Arrived', icon: MapPin },
    { id: 'IN_PROGRESS', label: 'In Progress', icon: Navigation },
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
               <div className="bg-primary-50/50 rounded-3xl p-6 border-2 border-primary-50/50 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                     <Navigation className="w-6 h-6 text-primary-600 animate-bounce" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Real-time Update</p>
                     <p className="text-sm font-black text-slate-800">Your service provider is on the way!</p>
                  </div>
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

         {/* Map Simulation */}
         {(booking.status === 'ACCEPTED' || booking.status === 'ARRIVED' || booking.status === 'IN_PROGRESS') && (
            <div className="bg-white rounded-[2.5rem] p-2 border border-slate-100 shadow-premium mb-8 overflow-hidden h-72">
               <GoogleMap 
                 latitude={booking.service?.latitude || 0} 
                 longitude={booking.service?.longitude || 0} 
                 services={[booking.service]}
                 activeServiceId={booking.service?.id}
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
               <button className="flex items-center justify-center gap-3 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black transition-all active:scale-[0.98]">
                  <MessageCircle className="w-4 h-4" /> Message
               </button>
            </div>
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
