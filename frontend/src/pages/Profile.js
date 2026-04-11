import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, 
  Camera, Save, X, Edit2, 
  ShieldCheck, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

const Profile = () => {
  const { user, setUser, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    profileImageUrl: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
        profileImageUrl: user.profileImageUrl || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedUser = await userService.updateMe(formData);
      setUser(updatedUser);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="glass-card p-10 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-slate-500 font-medium mb-8">Please sign in to view and manage your account settings.</p>
          <a href="/login" className="btn-primary block w-full py-4 rounded-2xl">Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">
          <a href="/" className="hover:text-primary-600 transition-colors uppercase">Home</a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Account Settings</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Side Info Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 text-center overlow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
              
              <div className="relative mb-6 inline-block">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white text-5xl font-black shadow-xl border-4 border-white overflow-hidden">
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user.fullName?.charAt(0) || user.username?.charAt(0)
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-lg rounded-2xl flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors border border-slate-100">
                    <Camera className="w-5 h-5 text-primary-600" />
                    <input 
                      type="text" 
                      className="hidden" 
                      placeholder="URL" 
                      name="profileImageUrl"
                      value={formData.profileImageUrl}
                      onChange={handleChange}
                    />
                  </label>
                )}
              </div>

              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                {user.fullName || user.username}
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-1 mb-4 italic">@{user.username}</p>
              
              <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> {user.role} Verified
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col gap-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Integrity</p>
                <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                  <span className="text-slate-400">Trust Score</span>
                  <span className="text-primary-600">{user.trustScore || 100}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary-500 h-full" style={{ width: `${user.trustScore || 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 font-mono">System Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/60">Member Since</span>
                  <span className="text-xs font-black">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/60">Last Security Update</span>
                  <span className="text-xs font-black uppercase">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 lg:p-10 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Personal Information</h2>
                  <p className="text-sm font-medium text-slate-400 mt-1">Manage your identity and contact details.</p>
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-700 font-black text-xs uppercase tracking-widest transition-all active:scale-95 border border-slate-100"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                )}
              </div>

              <div className="p-8 lg:p-10">
                <AnimatePresence mode="wait">
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm font-bold"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Changes saved successfully!
                    </motion.div>
                  )}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold"
                    >
                      <AlertCircle className="w-5 h-5" /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Full Name */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> Full Legal Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-700 font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner"
                          placeholder="What should we call you?"
                          required
                        />
                      ) : (
                        <div className="bg-slate-50/50 rounded-2xl py-4 px-6 border border-transparent font-black text-slate-800">
                          {user.fullName || "Not provided"}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" /> Security Email
                      </label>
                      <div className="bg-slate-50/50 rounded-2xl py-4 px-6 border border-transparent font-black text-slate-400 flex items-center justify-between">
                        {user.email}
                        <div className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Verified</div>
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium px-1 italic">* Email cannot be changed for security audits.</p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" /> Contact Number
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-700 font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner"
                          placeholder="+1 (555) 000-0000"
                        />
                      ) : (
                        <div className="bg-slate-50/50 rounded-2xl py-4 px-6 border border-transparent font-black text-slate-800">
                          {user.phone || "No phone linked"}
                        </div>
                      )}
                    </div>

                    {/* Profile Image URL */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Camera className="w-3.5 h-3.5" /> Profile Image URL
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="profileImageUrl"
                          value={formData.profileImageUrl}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-700 font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner"
                          placeholder="https://example.com/avatar.jpg"
                        />
                      ) : (
                        <div className="bg-slate-50/50 rounded-2xl py-4 px-6 border border-transparent font-black text-slate-400 truncate max-w-xs">
                          {user.profileImageUrl || "Default Avatar"}
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    <div className="col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> Primary Address
                      </label>
                      {isEditing ? (
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={2}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-700 font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-inner resize-none"
                          placeholder="123 Street Name, City, Country"
                        />
                      ) : (
                        <div className="bg-slate-50/50 rounded-2xl py-4 px-6 border border-transparent font-black text-slate-800">
                          {user.address || "No address documentation found"}
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row gap-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" /> Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        disabled={saving}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                      >
                        <X className="w-4 h-4" /> Discard Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


