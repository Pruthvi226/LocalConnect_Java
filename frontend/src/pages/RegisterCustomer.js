import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, MapPin, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({ ...formData }, 'customer');
      setIsSuccess(true);
      // Wait for 2 seconds to show success message before redirecting
      setTimeout(() => {
        navigate('/login/customer');
      }, 2000);
    } catch (err) {
      // Prioritize the specific message from the server (e.g., "Email is already in use!")
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed. Please attempt again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-2xl py-3.5 pl-12 pr-5 text-slate-900 font-bold outline-none transition-all placeholder:text-slate-300 shadow-sm text-sm";
  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(79,70,229,0.15)] border border-white p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 to-indigo-600"></div>

          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl mb-6"
            >
              <Sparkles className="w-8 h-8 text-primary-600" />
            </motion.div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Join <span className="text-primary-600">ProxiSense.</span></h1>
            <p className="text-slate-500 font-medium">Create your account to get started</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl mb-8 flex items-center gap-3"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-bold">{error}</p>
              </motion.div>
            )}
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-5 py-6 rounded-[2rem] mb-8 text-center"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-black text-lg mb-1">Registration Successful!</h3>
                <p className="text-sm font-bold text-emerald-600/70">Welcome to ProxiSense! Redirecting to login...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className={labelClasses}>Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClasses}>Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <CheckCircle2 className="h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="johndoe_pro"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className={labelClasses}>Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClasses}>Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-primary-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className={labelClasses}>Contact / Phone</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClasses}>Primary Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="123 Neighborhood St."
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
              >
                 {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 font-bold text-sm">
              Already have an account?{' '}
              <Link to="/login/customer" className="text-primary-600 hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-400 text-xs font-medium">
          By joining, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterUser;

