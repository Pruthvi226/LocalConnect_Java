import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Star, Heart, User, 
  MessageSquare, ShieldCheck, 
  Calendar, Clock, ArrowLeft,
  Share2, ShieldAlert, CheckCircle2,
  Zap, ChevronRight, Info, AlertCircle
} from 'lucide-react';
import dayjs from 'dayjs';
import { serviceService } from '../services/serviceService';
import { bookingService } from '../services/bookingService';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import GoogleMap from '../components/GoogleMap';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [bookingDate, setBookingDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'));
  const [bookingNotes, setBookingNotes] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [problemImageUrl, setProblemImageUrl] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    loadService();
    loadReviews();
    window.scrollTo(0, 0);
  }, [id]);

  const loadService = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getById(id);
      setService(data);
    } catch (err) {
      setError('Service details could not be loaded.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await reviewService.getByService(id);
      setReviews(data);
    } catch (err) { console.error(err); }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) return navigate('/login/customer');
    
    setBookingLoading(true);
    setBookingSuccess(false);
    try {
      await bookingService.create(id, new Date(bookingDate), bookingNotes, isEmergency, problemImageUrl);
      setBookingSuccess(true);
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Professional might be unavailable.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login/customer');
    if (!reviewComment.trim()) return;

    setReviewLoading(true);
    try {
      await reviewService.create(id, reviewRating, reviewComment);
      setReviewComment('');
      loadReviews();
      loadService();
    } catch (err) {
      setError('Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Fetching Expertise...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 flex justify-center px-6">
        <div className="max-w-md text-center bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100">
           <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
           <h2 className="text-3xl font-black text-slate-800 mb-2">Service Not Found</h2>
           <p className="text-slate-500 font-medium mb-8">This provider might have moved or the link is incorrect.</p>
           <button onClick={() => navigate('/search')} className="btn-primary py-3 px-10">Return to Search</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-6">
        
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-8 hover:text-primary-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Results
        </button>

        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Gallery & Hero */}
            <section className="relative group">
               <div className="aspect-[16/9] bg-white rounded-[3rem] overflow-hidden border border-white shadow-premium relative">
                  {service.imageUrl ? (
                    <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-indigo-50 flex items-center justify-center">
                       <Zap className="w-20 h-20 text-primary-300" />
                    </div>
                  )}
                  <div className="absolute top-6 left-6 flex gap-2">
                     <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary-600 border border-white shadow-sm">
                        {service.category}
                     </span>
                     <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white shadow-sm backdrop-blur-md ${
                        service.isAvailable ? 'bg-green-500/90 text-white' : 'bg-slate-500/90 text-white'
                     }`}>
                        {service.isAvailable ? 'Available Now' : 'Busy Today'}
                     </span>
                  </div>
                  <div className="absolute top-6 right-6">
                     <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-600 hover:text-red-500 transition-all shadow-sm">
                        <Heart className="w-6 h-6" />
                     </button>
                  </div>
               </div>
            </section>

            {/* Service Primary Info */}
            <section>
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3">
                      {service.title}
                    </h1>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 font-bold">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          {service.averageRating?.toFixed(1) || '0.0'}
                          <span className="text-amber-500/60 font-medium ml-1">({service.totalReviews || 0} Reviews)</span>
                       </div>
                       <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                          <MapPin className="w-5 h-5 text-primary-500" />
                          {service.location}
                       </div>
                    </div>
                  </div>
                  <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary-600 transition-colors shadow-sm">
                     <Share2 className="w-6 h-6" />
                  </button>
               </div>

               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium">
                  <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                     <Info className="w-5 h-5 text-primary-500" />
                     About the Service
                  </h3>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                    {service.description || 'No detailed description provided by this expert.'}
                  </p>
               </div>
            </section>

            {/* Provider Spotlight */}
            <section className="bg-primary-600 rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform"></div>
               <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-32 h-32 bg-white rounded-[2.5rem] flex-shrink-0 relative">
                     <img src={`https://i.pravatar.cc/200?u=${service.provider?.id || 'provider'}`} alt="" className="w-full h-full object-cover rounded-[2.5rem]" />
                     <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-primary-600 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-white" />
                     </div>
                  </div>
                  <div className="text-center md:text-left">
                     <p className="text-primary-200 font-black uppercase tracking-widest text-xs mb-1">Service Provider</p>
                     <h3 className="text-3xl font-black mb-2">{service.provider?.fullName || 'ProxiSense Expert'}</h3>
                     <p className="text-primary-100 font-medium mb-6 opacity-80">
                        Top-rated professional with {Math.floor(Math.random() * 5) + 3} years of local experience. 
                        Identity and licenses verified by ProxiSense.
                     </p>
                     <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <button 
                          onClick={() => {
                            if (isAuthenticated) navigate('/messages', { state: { partnerId: service.provider?.id, partnerName: service.provider?.fullName } });
                            else navigate('/login/customer');
                          }}
                          className="bg-white text-primary-700 font-black py-3 px-8 rounded-2xl hover:bg-primary-50 transition-all flex items-center gap-2"
                        >
                           <MessageSquare className="w-5 h-5" />
                           Chat with Expert
                        </button>
                        <div className="flex items-center gap-2 px-6 bg-white/10 border border-white/20 rounded-2xl">
                           <Calendar className="w-5 h-5" />
                           <span className="font-bold text-sm">Response: 15m</span>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Location Map */}
            {service.latitude && service.longitude && (
              <section className="bg-white rounded-[3rem] p-2 border border-slate-100 shadow-premium overflow-hidden">
                <div className="h-[400px] w-full rounded-[2.5rem] overflow-hidden">
                   <GoogleMap 
                     latitude={service.latitude} 
                     longitude={service.longitude} 
                     title={`${service.title} - Service Area`} 
                   />
                </div>
              </section>
            )}

            {/* Reviews Section */}
            <section id="reviews">
               <div className="flex justify-between items-center mb-10 px-2">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Expert Reviews</h2>
                  <div className="flex items-center gap-2">
                     <span className="text-3xl font-black text-primary-600">{service.averageRating?.toFixed(1) || '0.0'}</span>
                     <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  </div>
               </div>

               <div className="space-y-6 mb-12">
                  {reviews.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                       <Star className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-lg font-bold text-slate-400">No reviews yet. Be the first!</p>
                    </div>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium group">
                         <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                  <img src={`https://i.pravatar.cc/100?u=${review.user?.id || 'user'}`} alt="" />
                               </div>
                               <div>
                                  <p className="font-black text-slate-800">{review.user?.fullName || 'ProxiSense User'}</p>
                                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{dayjs(review.createdAt).format('MMMM D, YYYY')}</p>
                               </div>
                            </div>
                            <div className="flex gap-1 px-3 py-1.5 bg-amber-50 rounded-xl">
                               <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                               <span className="font-black text-xs text-amber-700">{review.rating}</span>
                            </div>
                         </div>
                         <p className="text-slate-600 font-medium leading-relaxed italic">
                           "{review.comment}"
                         </p>
                      </div>
                    ))
                  )}
               </div>

               {/* Add Review */}
               {isAuthenticated && (
                 <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
                    <h3 className="text-2xl font-black mb-6">Review your Experience</h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-6">
                       <div className="flex gap-4 mb-4">
                          {[1,2,3,4,5].map(star => (
                            <button 
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="group transition-transform active:scale-125"
                            >
                              <Star className={`w-8 h-8 ${reviewRating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-700 hover:text-white'}`} />
                            </button>
                          ))}
                       </div>
                       <textarea 
                         rows="4"
                         value={reviewComment}
                         onChange={(e) => setReviewComment(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-lg font-medium focus:outline-none focus:border-primary-500 placeholder:text-slate-600"
                         placeholder="Share your thoughts on the quality, speed, and reliability..."
                       />
                       <button 
                        type="submit"
                        disabled={reviewLoading}
                        className="bg-primary-600 text-white font-black py-4 px-12 rounded-2xl shadow-xl hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
                       >
                          {reviewLoading ? 'Sharing...' : 'Publish Review'}
                       </button>
                    </form>
                 </div>
               )}
            </section>
          </div>

          {/* Sticky Booking Column */}
          <div className="lg:col-span-1">
             <div className="sticky top-24 space-y-6">
                
                {/* Booking Card */}
                <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-100 shadow-premium relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                   
                   <div className="mb-8">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Service Fee</p>
                      <div className="flex items-baseline gap-2">
                         <span className="text-5xl font-black text-slate-900">₹{service.price}</span>
                         <span className="text-slate-400 font-bold">/ project</span>
                      </div>
                   </div>

                   <AnimatePresence>
                      {bookingSuccess && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-green-50 text-green-700 p-4 rounded-3xl border border-green-100 mb-6 flex items-center gap-3"
                        >
                           <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                           <p className="text-sm font-bold tracking-tight">Project scheduled! Redirecting...</p>
                        </motion.div>
                      )}
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-red-50 text-red-700 p-4 rounded-3xl border border-red-100 mb-6 flex items-center gap-3"
                        >
                           <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                           <p className="text-sm font-bold tracking-tight">{error}</p>
                        </motion.div>
                      )}
                   </AnimatePresence>

                   <div className="space-y-6 mb-8">
                      <div>
                         <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block ml-1">Preferred Timing</label>
                         <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 w-5 h-5 pointer-events-none" />
                            <input 
                              type="datetime-local" 
                              value={bookingDate}
                              onChange={(e) => setBookingDate(e.target.value)}
                              min={dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm')}
                              className="w-full bg-slate-50 border border-slate-100 py-4 pl-12 pr-6 rounded-2xl font-bold text-slate-700 focus:outline-none focus:border-primary-500"
                            />
                         </div>
                      </div>
                       <div>
                         <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block ml-1">Job Details</label>
                         <textarea 
                           className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-medium text-slate-600 focus:outline-none focus:border-primary-500 h-24 text-sm mb-3"
                           placeholder="Describe the issue or requirements..."
                           value={bookingNotes}
                           onChange={(e) => setBookingNotes(e.target.value)}
                         />
                         <input 
                           type="text"
                           placeholder="Image URL (optional)"
                           value={problemImageUrl}
                           onChange={(e) => setProblemImageUrl(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-100 py-3 px-4 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500 mb-4"
                         />
                         
                         <label className="flex items-center gap-3 cursor-pointer bg-red-50 p-4 rounded-xl border border-red-100">
                           <input 
                              type="checkbox" 
                              checked={isEmergency}
                              onChange={(e) => setIsEmergency(e.target.checked)}
                              className="w-5 h-5 text-red-500 border-red-200 rounded focus:ring-red-500"
                           />
                           <div>
                              <p className="font-bold text-red-700 text-sm flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" /> Emergency Mode
                              </p>
                              <p className="text-[10px] font-bold text-red-500">Prioritizes your request for immediate attention.</p>
                           </div>
                         </label>
                      </div>
                   </div>

                   <div className="bg-slate-50 rounded-3xl p-6 mb-8 space-y-3">
                      <div className="flex justify-between text-sm font-bold text-slate-500">
                         <span>Base Price</span>
                         <span>₹{service.price}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-500">
                         <span>Platform Fee</span>
                         <span>₹{service.platformFee || 50}</span>
                      </div>
                      <div className="h-px bg-slate-200"></div>
                      <div className="flex justify-between text-lg font-black text-slate-900">
                         <span>Total Due</span>
                         <span className="text-primary-600">₹{service.price + (service.platformFee || 50)}</span>
                      </div>
                   </div>

                   <button 
                    onClick={handleBooking}
                    disabled={bookingLoading || !service.isAvailable}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-primary-500/20 active:scale-95 transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {bookingLoading ? 'Processing...' : (service.isAvailable ? 'Reserve Now' : 'Join Waitlist')}
                     <ChevronRight className="w-5 h-5" />
                   </button>
                   
                   <p className="text-[11px] text-slate-400 font-bold text-center mt-6">
                      No upfront payment required for most services. <br />
                      Cancelation is free up to 4 hours before.
                   </p>
                </div>

                {/* Trust Badge */}
                <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex items-center gap-4">
                   <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
                      <ShieldCheck className="w-6 h-6 text-white" />
                   </div>
                   <div>
                      <p className="font-black text-xs uppercase tracking-widest text-primary-400">ProxiSense Protect</p>
                      <p className="text-xs font-medium text-slate-400 leading-snug">Money-back guarantee if the expert doesn't meet quality standards.</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
