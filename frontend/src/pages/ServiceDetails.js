import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Star, Heart, 
  MessageSquare, ShieldCheck, 
  Calendar, ArrowLeft,
  Share2, ShieldAlert, CheckCircle2,
  Zap, ChevronRight, Info, AlertCircle,
  Sparkles, Camera, X, ExternalLink
} from 'lucide-react';
import dayjs from 'dayjs';
import { serviceService } from '../services/serviceService';
import { bookingService } from '../services/bookingService';
import { reviewService } from '../services/reviewService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import GoogleMap from '../components/GoogleMap';
import { useGuestGuard } from '../hooks/useGuestGuard';
import GuestModal from '../components/GuestModal';
import { toast } from 'react-toastify';
import PortfolioGallery from '../components/PortfolioGallery';
import BeforeAfterSlider from '../components/BeforeAfterSlider';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
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
  const [paymentMethod, setPaymentMethod] = useState('OFFLINE'); // Default: Pay After Service
  
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [eligibleBookingId, setEligibleBookingId] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  const { 
    checkAccess, 
    isModalOpen, 
    setIsModalOpen, 
    triggerAction: guestAction,
    getLoginRedirect,
    getRegisterRedirect
  } = useGuestGuard();

  const loadService = React.useCallback(async () => {
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
  }, [id]);

  const loadReviews = React.useCallback(async () => {
    try {
      const data = await reviewService.getByService(id);
      setReviews(data);
      
      if (isAuthenticated) {
        const eligibility = await reviewService.checkEligibility(id);
        setIsEligible(eligibility.eligible);
        setEligibleBookingId(eligibility.bookingId);
      }
    } catch (err) { console.error(err); }
  }, [id, isAuthenticated]);

  useEffect(() => {
    loadService();
    loadReviews();
    window.scrollTo(0, 0);
  }, [loadReviews, loadService]);

  const handleBooking = async () => {
    console.log("Book Now clicked"); // MUST log
    
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login...");
      navigate(`/login?redirect=booking&serviceId=${id}`);
      return;
    }
    
    setBookingLoading(true);
    setBookingSuccess(false);
    try {
      console.log("Sending booking payload to API...", {
        serviceId: id,
        bookingDate,
        bookingNotes,
        isEmergency,
        problemImageUrl,
        paymentMethod
      });
      const result = await bookingService.create(id, new Date(bookingDate), bookingNotes, isEmergency, problemImageUrl, paymentMethod);
      console.log("Booking success:", result);
      setBookingSuccess(true);
      toast.success("Booking Confirmed 🎉");
      
      const bookingId = result.id;
      
      setTimeout(() => {
        if (paymentMethod === 'ONLINE') {
          navigate(`/checkout/${bookingId}`);
        } else {
          navigate('/my-bookings');
        }
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      if (errorMsg.includes('not available') || errorMsg.includes('conflict')) {
        toast.error(errorMsg, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      } else {
        toast.error('Booking failed. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setReviewImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login/customer');
    if (!reviewComment.trim()) return alert('Please write a comment.');
    if (!eligibleBookingId) return alert('No eligible booking found for review.');

    setReviewLoading(true);
    try {
      let uploadedUrls = [];
      if (reviewImages.length > 0) {
        const formData = new FormData();
        reviewImages.forEach(file => {
          formData.append('files', file);
        });
        
        const uploadRes = await api.post('/upload/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrls = uploadRes.data.urls;
      }

      await reviewService.create(eligibleBookingId, reviewRating, reviewComment, uploadedUrls);
      
      setReviewComment('');
      setReviewImages([]);
      setReviewRating(5);
      setIsEligible(false); // Hide form after success
      
      loadReviews();
      loadService();
      
      alert('Review submitted successfully! Thank you for your feedback.');
    } catch (err) {
      console.error(err);
      setError('Failed to submit review. ' + (err.response?.data?.message || ''));
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

                {/* New Phase 4 Portfolio Sections */}
                <div className="space-y-12">
                  {/* 1. Live Project History (Automated Reels) */}
                  {service.projectReels && service.projectReels.length > 0 && (
                    <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-100 shadow-premium">
                      <div className="flex justify-between items-end mb-8">
                        <div>
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-amber-500" />
                            Live Project Reels
                          </h3>
                          <p className="text-slate-400 font-bold text-sm tracking-tight mt-1">Verified results from neighborhood bookings</p>
                        </div>
                        <span className="hidden sm:block bg-green-50 text-green-600 text-[10px] font-black px-4 py-2 rounded-2xl border border-green-100 uppercase tracking-widest">
                           Verified Proof
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {service.projectReels.map((reel, idx) => (
                          <motion.div 
                            key={reel.bookingId}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                          >
                             <BeforeAfterSlider 
                               before={reel.beforeImageUrl} 
                               after={reel.afterImageUrl} 
                               label={`Project #${reel.bookingId} - ${dayjs(reel.completedAt).format('MMM YYYY')}`}
                             />
                             {reel.customerNote && (
                               <p className="mt-4 text-slate-500 text-xs font-medium italic px-4 border-l-2 border-slate-100">
                                 &quot;{reel.customerNote}&quot;
                               </p>
                             )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Master Portfolio (Manual Carousel/Masonry) */}
                  {service.portfolioImages && service.portfolioImages.length > 0 && (
                    <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-100 shadow-premium">
                      <div className="mb-8">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                          <Camera className="w-6 h-6 text-primary-500" />
                          Master Portfolio
                        </h3>
                        <p className="text-slate-400 font-bold text-sm tracking-tight mt-1">Provider's curated showcase of excellence</p>
                      </div>
                      
                      <PortfolioGallery images={service.portfolioImages} />
                    </div>
                  )}
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
                     <h3 className="text-3xl font-black mb-2 flex flex-wrap items-center gap-3 justify-center md:justify-start">
                        {service.provider?.fullName || 'ProxiSense Expert'}
                        {service.provider?.trustScore != null && (
                          <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-xl font-bold border border-green-400 shadow-sm flex items-center gap-1">
                             <ShieldCheck className="w-4 h-4" />
                             Trusted Pro – {service.provider.trustScore}% Reliability
                          </span>
                        )}
                     </h3>
                     <p className="text-primary-100 font-medium mb-6 opacity-80">
                        Top-rated professional with {Math.floor(Math.random() * 5) + 3} years of local experience. 
                        Identity and licenses verified by ProxiSense.
                     </p>
                     <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <button 
                          onClick={() => {
                            if (checkAccess('chat with this expert')) {
                              navigate('/messages', { state: { partnerId: service.provider?.id, partnerName: service.provider?.fullName } });
                            }
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
               <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Customer <span className="text-primary-600">Reviews</span></h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Feedback from your neighborhood</p>
                  </div>
                  <div className="flex items-center gap-6 bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-premium">
                     <div className="text-center">
                        <p className="text-4xl font-black text-slate-900">{service.averageRating?.toFixed(1) || '0.0'}</p>
                        <div className="flex gap-0.5 mt-1">
                           {[1,2,3,4,5].map(s => (
                             <Star key={s} className={`w-3 h-3 ${service.averageRating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                           ))}
                        </div>
                     </div>
                     <div className="w-px h-12 bg-slate-100"></div>
                     <div>
                        <p className="text-sm font-black text-slate-900">{service.totalReviews || 0}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Ratings</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-8 mb-16">
                  {reviews.length === 0 ? (
                    <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-premium">
                       <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                          <MessageSquare className="w-10 h-10 text-slate-200" />
                       </div>
                       <h3 className="text-2xl font-black text-slate-800 mb-2">No reviews yet</h3>
                       <p className="text-slate-500 font-medium">Be the first to share your experience with this expert!</p>
                    </div>
                  ) : (
                    reviews.map(review => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={review.id} 
                        className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium hover:border-primary-100 transition-colors"
                      >
                         <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                            <div className="flex items-center gap-4">
                               <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200/50">
                                  <img src={`https://i.pravatar.cc/100?u=${review.customerId || 'Customer'}`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                   <div className="flex items-center gap-2 mb-0.5">
                                      <p className="font-black text-slate-900 text-lg">{review.customerName || 'Verified Professional'}</p>
                                      <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-1 uppercase tracking-widest">
                                         <ShieldCheck className="w-2.5 h-2.5" /> Verified Purchase
                                      </span>
                                   </div>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                                      Expertly served on {dayjs(review.createdAt).format('MMMM D, YYYY')}
                                   </p>
                                </div>
                            </div>
                            <div className="flex gap-1.5 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                               {[1,2,3,4,5].map(s => (
                                 <Star key={s} className={`w-4 h-4 ${review.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                               ))}
                            </div>
                         </div>
                         
                         <p className="text-slate-600 text-lg font-medium leading-relaxed mb-8">
                           {review.comment || "Quality service as expected. Highly recommended expert."}
                         </p>

                         {review.imageUrls && review.imageUrls.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                               {review.imageUrls.map((url, idx) => (
                                 <div 
                                   key={idx} 
                                   onClick={() => setZoomImage(url)}
                                   className="aspect-square rounded-2xl overflow-hidden border border-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
                                 >
                                    <img src={url} className="w-full h-full object-cover" alt="Review proof" />
                                 </div>
                               ))}
                            </div>
                         )}
                      </motion.div>
                    ))
                  )}
               </div>

               {/* Amazon-Style Review Form Overlay */}
               {isAuthenticated && isEligible && (
                 <motion.div 
                   initial={{ scale: 0.95, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="bg-slate-900 rounded-[3rem] p-10 lg:p-14 text-white shadow-3xl relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="relative z-10">
                       <div className="flex items-center gap-4 mb-8">
                          <div className="w-14 h-14 bg-white/10 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md">
                             <Sparkles className="w-8 h-8 text-primary-400" />
                          </div>
                          <div>
                             <h3 className="text-3xl font-black tracking-tight">Rate your Experience</h3>
                             <p className="text-primary-300 font-bold text-xs uppercase tracking-[0.2em] mt-1">Verified Expert Review</p>
                          </div>
                       </div>

                       <form onSubmit={handleReviewSubmit} className="space-y-8">
                          <div>
                             <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Quality of Execution</p>
                             <div className="flex gap-3">
                                {[1,2,3,4,5].map(star => (
                                  <button 
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewRating(star)}
                                    className="group transition-transform active:scale-150"
                                  >
                                    <Star className={`w-10 h-10 ${reviewRating >= star ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'text-slate-700 hover:text-white transition-colors'}`} />
                                  </button>
                                ))}
                             </div>
                          </div>

                          <div className="space-y-4">
                             <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Share Detailed Story</p>
                             <textarea 
                               rows="4"
                               value={reviewComment}
                               onChange={(e) => setReviewComment(e.target.value)}
                               className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] p-8 text-white text-xl font-medium focus:outline-none focus:border-primary-500/50 placeholder:text-slate-700 transition-all"
                               placeholder="Describe the professionalism, speed, and final result..."
                             />
                          </div>

                          <div className="space-y-4">
                             <div className="flex justify-between items-center">
                                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Upload Service Proof <span className="text-slate-600 font-bold lowercase italic tracking-normal">(Multiples allowed)</span></p>
                                <span className="text-[10px] font-bold text-primary-400">{reviewImages.length} images selected</span>
                             </div>
                             
                             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                {reviewImages.map((file, idx) => (
                                   <div key={idx} className="aspect-square relative group/preview rounded-2xl overflow-hidden border-2 border-white/10">
                                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                      <button 
                                        type="button" 
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity shadow-lg"
                                      >
                                         <X className="w-4 h-4" />
                                      </button>
                                   </div>
                                ))}
                                {reviewImages.length < 5 && (
                                   <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-primary-500/50 transition-all group">
                                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                      <Camera className="w-8 h-8 text-slate-600 group-hover:text-primary-400 transition-colors" />
                                      <span className="text-[10px] font-black text-slate-600 uppercase mt-2 group-hover:text-primary-400">Add Image</span>
                                   </label>
                                )}
                             </div>
                          </div>

                          <div className="pt-4 flex flex-col sm:flex-row items-center gap-6">
                             <button 
                              type="submit"
                              disabled={reviewLoading}
                               className="w-full sm:w-auto bg-primary-600 text-white font-black py-5 px-16 rounded-[2rem] shadow-2xl shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 text-lg"
                             >
                                {reviewLoading ? (
                                   <><div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> Publishing...</>
                                ) : (
                                   <><CheckCircle2 className="w-6 h-6" /> Publish Official Review</>
                                )}
                             </button>
                             <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xs text-center sm:text-left">
                                By publishing, you confirm that this is an honest review of the service received. 
                                Reviews are subject to ProxiSense community guidelines.
                             </p>
                          </div>
                       </form>
                    </div>
                 </motion.div>
               )}
            </section>

            {/* Image Zoom Modal */}
            <AnimatePresence>
               {zoomImage && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   onClick={() => setZoomImage(null)}
                   className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-6 md:p-12"
                 >
                    <button className="absolute top-10 right-10 w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all">
                       <X className="w-8 h-8" />
                    </button>
                    <motion.div 
                      key={zoomImage}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="max-w-7xl max-h-full"
                    >
                       <img src={zoomImage} className="w-full h-full object-contain rounded-3xl shadow-3xl" alt="Review proof zoom" />
                    </motion.div>
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
                       <a href={zoomImage} target="_blank" rel="noreferrer" className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
                          <ExternalLink className="w-4 h-4" /> Open Full Res
                       </a>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </div>

          {/* Booking Column */}
          <div className="lg:col-span-1">
             <div className="lg:sticky lg:top-24 space-y-6 pb-24 lg:pb-0">
                
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
                           <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-green-500" />
                           <p className="text-sm font-bold tracking-tight">Booking Confirmed 🎉 You will be notified shortly.</p>
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

                   <div className="bg-slate-50 rounded-3xl p-6 mb-8 space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Choose Payment Method</label>
                      <div className="flex flex-col gap-3">
                         <button 
                           type="button"
                           onClick={() => setPaymentMethod('ONLINE')}
                           className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${paymentMethod === 'ONLINE' ? 'border-primary-500 bg-white ring-4 ring-primary-50' : 'border-slate-100 bg-white/50 opacity-60'}`}
                         >
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-black text-[10px]">UPI</div>
                               <span className="text-sm font-black text-slate-800">Pay Now (UPI/Card)</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'ONLINE' ? 'border-primary-500' : 'border-slate-300'}`}>
                               {paymentMethod === 'ONLINE' && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />}
                            </div>
                         </button>

                         <button 
                           type="button"
                           onClick={() => setPaymentMethod('OFFLINE')}
                           className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${paymentMethod === 'OFFLINE' ? 'border-orange-500 bg-white ring-4 ring-orange-50' : 'border-slate-100 bg-white/50 opacity-60'}`}
                         >
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                               </div>
                               <span className="text-sm font-black text-slate-800">Pay After Service (Cash/UPI)</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'OFFLINE' ? 'border-orange-500' : 'border-slate-300'}`}>
                               {paymentMethod === 'OFFLINE' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                            </div>
                         </button>
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
                    disabled={bookingLoading}
                    className="hidden lg:flex w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:bg-gradient-to-r hover:from-primary-700 hover:to-indigo-700 hover:scale-105 text-white font-black py-5 rounded-3xl shadow-xl shadow-primary-500/30 active:scale-95 transition-all duration-300 text-lg items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                   >
                     {bookingLoading ? 'Booking...' : 'Book Now'}
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

      {/* Mobile Fixed Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-[100] lg:hidden flex justify-between items-center border-t border-slate-100">
         <div>
            <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Total</p>
            <p className="font-black text-slate-900 text-xl leading-none mb-1">₹{service.price + (service.platformFee || 50)}</p>
            <p className="text-[10px] font-bold text-primary-600 leading-none">{paymentMethod === 'ONLINE' ? 'Pay Now' : 'Pay After Service'}</p>
         </div>
         <button 
          onClick={handleBooking}
          disabled={bookingLoading}
          className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-black py-3.5 px-8 rounded-2xl shadow-xl shadow-primary-500/30 active:scale-95 hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
         >
           {bookingLoading ? 'Booking...' : 'Book Now'}
         </button>
      </div>

      <GuestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        triggerAction={guestAction}
        onLoginRedirect={getLoginRedirect()}
        onRegisterRedirect={getRegisterRedirect()}
      />
    </div>
  );
};

export default ServiceDetails;

