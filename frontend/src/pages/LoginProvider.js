import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Lock, ArrowRight, Eye, EyeOff, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginProvider = () => {
  const [Username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const { login, redirectPath, setRedirectPath } = useAuth();
  const navigate = useNavigate();

  // Randomized names to evade autofill
  const fieldNames = React.useMemo(() => ({
    user: `prov_user_${Math.random().toString(36).substring(7)}`,
    pass: `prov_pass_${Math.random().toString(36).substring(7)}`
  }), []);

  useEffect(() => {
    // Force form reset on mount
    setUsername('');
    setPassword('');
    setFormKey(prev => prev + 1);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!Username || !password) {
      setError('Credentials required for provider authentication.');
      return;
    }

    setLoading(true);
    try {
      const userData = await login(Username, password, false);
      
      // Role validation: only PROVIDER accounts can access the provider dashboard
      const role = userData?.role || localStorage.getItem('userRole');
      if (role && role !== 'PROVIDER') {
        // Log out the just-logged-in user to prevent unauthorized access
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        setError('This account is not a provider account. Please use Customer Login instead.');
        setLoading(false);
        return;
      }

      // Clear any legacy storage
      localStorage.removeItem('remembered_provider_Username');

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      const target = redirect || redirectPath || '/provider/dashboard';
      
      setRedirectPath(null); // Clear after use
      navigate(target);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Authentication failed. Please verify provider credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-24 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-100 rounded-full blur-[120px] opacity-40"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[480px]"
      >
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(79,70,229,0.15)] border border-white p-8 lg:p-12 relative overflow-hidden">
          {/* Top Decorative Element */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 to-primary-500"></div>

          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-6 relative group"
            >
              <div className="absolute inset-0 bg-indigo-200 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity"></div>
              <Briefcase className="w-8 h-8 text-indigo-600 relative z-10" />
            </motion.div>
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Provider <span className="text-indigo-600">Login.</span></h1>
            <p className="text-slate-500 font-medium">Manage your services and bookings</p>
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
          </AnimatePresence>

          <form key={formKey} onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {/* Hidden dummy fields to deflect autofill */}
            <input type="text" name="prevent_autofill" style={{ display: 'none' }} tabIndex="-1" aria-hidden="true" />
            <input type="password" name="password_fake" style={{ display: 'none' }} tabIndex="-1" aria-hidden="true" />

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name={fieldNames.user}
                  value={Username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl py-4 pl-12 pr-5 text-slate-900 font-bold outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  placeholder="your_username"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-black uppercase text-indigo-600 hover:underline tracking-widest">
                  Reset Key?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name={fieldNames.pass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl py-4 pl-12 pr-12 text-slate-900 font-bold outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 opacity-0 pointer-events-none h-0">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="sr-only" checked={false} readOnly />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Keep Session Active</span>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-50">
            <div className="flex flex-col gap-4">
               <p className="text-center text-slate-400 font-bold text-sm">
                 Want to join our expert network?{' '}
                 <Link to="/register/provider" className="text-indigo-600 hover:underline">Apply Now</Link>
               </p>
               <div className="flex items-center gap-4">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Account Type</span>
                  <div className="h-px bg-slate-100 flex-1"></div>
               </div>
               <Link 
                to="/login/customer" 
                className="w-full py-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 group"
               >
                 <UserCircle className="w-4 h-4 text-slate-400 group-hover:text-primary-600" />
                 Switch to Customer Login
               </Link>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center mt-8 text-slate-400 text-xs font-medium">
          Authorized Personnel Only • ProxiSense Provider Network
        </p>
      </motion.div>
    </div>
  );
};

export default LoginProvider;

