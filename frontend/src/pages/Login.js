import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [Username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('remembered_username');
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!Username.trim()) errors.Username = 'Username is required';
    if (!password) errors.password = 'Password is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(Username, password);
      if (rememberMe) {
        localStorage.setItem('remembered_username', Username);
      } else {
        localStorage.removeItem('remembered_username');
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-600/5 rounded-full blur-[120px] animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-premium p-10 border border-slate-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-200">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome <span className="text-primary-600">Back</span></h1>
            <p className="text-slate-400 font-bold text-sm mt-2">Login to manage your ProxiSense appointments</p>
          </div>

          {error && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-8 flex items-center gap-3 text-xs font-black uppercase tracking-widest"
            >
              <div className="w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px]">!</span>
              </div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input 
                  type="text"
                  value={Username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-800 outline-none focus:border-primary-500/20 focus:bg-white transition-all"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-800 outline-none focus:border-primary-500/20 focus:bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-primary-600 border-primary-600 shadow-lg shadow-primary-200' : 'border-slate-200 bg-white group-hover:border-slate-300'}`}>
                    {rememberMe && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500 select-none">Remember Me</span>
              </label>
              <Link to="/forgot-password" size="sm" className="text-xs font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest">Forgot?</Link>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Login Now <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-bold text-slate-400">
              New to ProxiSense? <Link to="/register" className="text-primary-600 font-black hover:underline ml-1">Create Account</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;


