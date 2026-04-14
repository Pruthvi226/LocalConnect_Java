import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { providerService } from '../services/providerService';
import { userService } from '../services/userService';
import { Mail, Phone, MapPin, Briefcase, CreditCard, ShieldCheck, Star, ArrowRight, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import PortfolioGallery from '../components/PortfolioGallery';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import AvailabilityManager from '../components/AvailabilityManager';
import dayjs from 'dayjs';

const ProviderProfile = () => {
  const { user, setUser, loading } = useAuth();
  const [services, setServices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    bio: '',
    profileImageUrl: ''
  });

  useEffect(() => {
    if (user?.role === 'PROVIDER' || user?.role === 'ADMIN') {
      providerService.getSummary().then(setSummary).catch(() => {});
      providerService.getMyServices().then((s) => setServices(Array.isArray(s) ? s : [])).catch(() => {});
      
      setEditForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        profileImageUrl: user.profileImageUrl || ''
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await userService.updateMe(editForm);
      setUser(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Access Restricted. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-premium relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-primary-500 flex items-center justify-center text-white text-5xl font-black shadow-2xl overflow-hidden border-4 border-white">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.fullName?.charAt(0) || 'P'
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-white rounded-2xl flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  {user.fullName || user.username}
                </h1>
                <div className="bg-indigo-50 text-indigo-600 text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-indigo-100 shadow-sm flex items-center gap-1.5">
                   <Briefcase className="w-3.5 h-3.5" /> Specialist Partner
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                   <Mail className="w-4 h-4 text-slate-300" /> {user.email}
                </div>
                <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                   <Phone className="w-4 h-4 text-slate-300" /> {user.phone || 'No phone linked'}
                </div>
                <div className="flex items-center gap-3 text-slate-500 font-bold text-sm col-span-full">
                   <MapPin className="w-4 h-4 text-slate-300" /> {user.address || 'Operational base not set'}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black active:scale-95 transition-all shadow-xl shadow-slate-200"
            >
              {isEditing ? 'Discard Changes' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-8">
            {isEditing ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-premium"
              >
                 <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-widest">Edit Profile Information</h2>
                 <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Full Legal Name</label>
                          <input 
                            value={editForm.fullName}
                            onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Business Contact</label>
                          <input 
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Profile Image (URL)</label>
                          <input 
                            value={editForm.profileImageUrl}
                            onChange={(e) => setEditForm({...editForm, profileImageUrl: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                          />
                       </div>
                       <div className="col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Headquarters / Address</label>
                          <input 
                            value={editForm.address}
                            onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                          />
                       </div>
                       <div className="col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Specialist Bio</label>
                          <textarea 
                            rows="4"
                            value={editForm.bio}
                            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                          />
                       </div>
                    </div>
                     <button 
                      type="submit" 
                      disabled={saving}
                      className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-100 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {saving ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                 </form>
              </motion.div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-premium">
                 <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Professional Dossier</h2>
                 <p className="text-slate-600 font-medium leading-relaxed mb-10 italic">
                    {user.bio || "No professional biography has been documented for this specialist partner yet."}
                 </p>
                 
                 <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Specialization Metrics</h3>
                    <div className="grid grid-cols-2 gap-8">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reputation Score</p>
                          <div className="flex items-center gap-2">
                             <h4 className="text-2xl font-black text-slate-900">{user.averageRating?.toFixed(1) || '0.0'}</h4>
                             <div className="flex text-amber-400">
                                <Star className="w-4 h-4 fill-current" />
                             </div>
                             <span className="text-[10px] font-black text-slate-400">({user.totalReviews || 0} Reviews)</span>
                          </div>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trust Integrity</p>
                          <div className="flex items-center gap-2 text-green-600">
                             <ShieldCheck className="w-5 h-5" />
                             <h4 className="text-2xl font-black">{user.trustScore}%</h4>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* Phase 5: Availability Manager */}
            {!isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AvailabilityManager />
              </motion.div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] -mr-16 -mt-16 opacity-30"></div>
               <h3 className="text-sm font-black uppercase tracking-widest mb-8 opacity-40">Financial Pulse</h3>
               <div className="mb-8">
                  <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-2">Lifetime Earnings</p>
                  <h4 className="text-4xl font-black tracking-tight">₹{Number(summary?.totalRevenue || 0).toLocaleString()}</h4>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                     <span className="text-[10px] font-black uppercase text-white/40">Services Paged</span>
                     <span className="font-black">{services.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                     <span className="text-[10px] font-black uppercase text-white/40">Completed Ops</span>
                     <span className="font-black">{summary?.completedBookings || 0}</span>
                  </div>
               </div>
               <Link to="/provider/dashboard" className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  Dashboard <ArrowRight className="w-4 h-4" />
               </Link>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Security & Cloud</h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                     <CreditCard className="w-5 h-5 text-slate-300" />
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bank Sync</p>
                        <p className="text-xs font-black text-slate-900">{user.bankAccountNumber ? 'Authorized' : 'Action Required'}</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

        </div>

        {/* Global Work Showcase */}
        <div className="mt-12 space-y-12">
            <div className="bg-white rounded-[3rem] p-10 lg:p-14 border border-slate-100 shadow-premium">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Global <span className="text-indigo-600">Work Showcase</span></h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Verified results across all specialist categories</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="text-center px-6 py-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <p className="text-2xl font-black text-indigo-600">
                           {services.reduce((acc, s) => acc + (s.projectReels?.length || 0), 0)}
                        </p>
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Live Proofs</p>
                     </div>
                     <div className="text-center px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-2xl font-black text-slate-900">
                           {services.reduce((acc, s) => acc + (s.portfolioImages?.length || 0), 0)}
                        </p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Gallery Items</p>
                     </div>
                  </div>
               </div>

               {/* Section 1: Verified Results (Before/After) */}
               {services.some(s => s.projectReels?.length > 0) && (
                 <div className="mb-16">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-green-500" /> Latest Verified Transformations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       {services.flatMap(s => s.projectReels || []).slice(0, 4).map((reel, idx) => (
                         <BeforeAfterSlider 
                            key={reel.bookingId}
                            before={reel.beforeImageUrl} 
                            after={reel.afterImageUrl} 
                            label={`Project #${reel.bookingId}`}
                         />
                       ))}
                    </div>
                 </div>
               )}

               {/* Section 2: Master Gallery */}
               {services.some(s => s.portfolioImages?.length > 0) && (
                 <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 border-t border-slate-50 pt-8 flex items-center gap-2">
                       <Camera className="w-4 h-4 text-primary-500" /> Curated Portfolio Gallery
                    </h3>
                    <PortfolioGallery 
                       images={services.flatMap(s => Array.from(s.portfolioImages || []))} 
                    />
                 </div>
               )}

               {!services.some(s => (s.projectReels?.length > 0 || s.portfolioImages?.length > 0)) && (
                 <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">No portfolio items documented for this provider yet.</p>
                 </div>
               )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;

