import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, ShieldCheck, Zap, 
  MapPin, Clock, Star, ArrowRight,
  CheckCircle2
} from 'lucide-react';
import ThreeDScene from '../components/ThreeDScene';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
          <div className="absolute bottom-0 right-[-5%] w-[30%] h-[50%] bg-secondary-100 rounded-full blur-[120px] opacity-40"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-600 px-4 py-1.5 rounded-full mb-8"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-bold tracking-wide uppercase">
                  Hyperlocal Excellence
                </span>
              </motion.div>

              <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tighter">
                Services at your <br />
                <span className="text-primary-600 relative">
                  Doorstep.
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 25 0, 50 5 T 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                  </svg>
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-10 max-w-xl leading-relaxed font-medium">
                Connect with the best local experts in seconds. 
                From expert repairs to professional care—ProxiSense brings 
                trusted help right where you need it.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <button
                  onClick={() => navigate('/role-selection')}
                  className="btn-primary py-4 px-10 text-lg flex items-center justify-center gap-2 group"
                >
                  Find Services Near You
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  to="/search"
                  className="flex items-center justify-center p-4 px-10 text-lg font-bold text-slate-700 hover:text-primary-600 bg-slate-50 hover:bg-white border border-slate-200 hover:border-primary-200 rounded-xl transition-all shadow-sm"
                >
                  Find Services
                </Link>
              </div>

              {/* Stats/Trust */}
              <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap gap-8 items-center">
                 <div className="flex items-center gap-3">
                   <div className="flex -space-x-3">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                         <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Customer" />
                       </div>
                     ))}
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-900">5,000+ Customers</p>
                     <p className="text-xs text-slate-500 font-medium tracking-tight">Trusting ProxiSense expertise</p>
                   </div>
                 </div>
                 <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                 <div className="flex items-center gap-2">
                   <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                   <span className="font-bold text-slate-900 text-sm">4.9/5 Average Rating</span>
                 </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="relative aspect-square lg:aspect-auto lg:h-[600px] group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent rounded-3xl blur-2xl group-hover:opacity-100 opacity-60 transition-opacity"></div>
              <div className="relative h-full w-full bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-2xl overflow-hidden">
                <ThreeDScene />
                <div className="absolute bottom-6 left-6 right-6 p-6 glass-card border-white/50 animate-float">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Verified Professional</p>
                      <p className="text-sm text-slate-500">Identity and skill confirmed</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">Built for the Modern Neighborhood</h2>
            <p className="text-lg text-slate-600 font-medium">Smart technology meeting human reliability. Discover what makes ProxiSense the #1 choice for local services.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={MapPin} 
              title="Hyperlocal Search" 
              desc="Our smart algorithms find the absolute closest experts to minimize wait times."
              color="primary"
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Verified Trust" 
              desc="Every service provider undergoes a rigorous background and identity check."
              color="green"
            />
            <FeatureCard 
              icon={Clock} 
              title="Real-time Tracking" 
              desc="Track your service status from request to completion in a dedicated live hub."
              color="indigo"
            />
            <FeatureCard 
              icon={Zap} 
              title="Instant Booking" 
              desc="Confirm appointments in two clicks with our streamlined, secure flow."
              color="secondary"
            />
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-24 container mx-auto px-4 lg:px-6">
        <div className="bg-primary-600 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden text-center lg:text-left">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
           
           <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-4xl lg:text-6xl font-black leading-tight mb-8 italic">"ProxiSense changed how I manage my home services."</h2>
                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-white/30 overflow-hidden shadow-xl">
                    <img src="https://i.pravatar.cc/150?u=jane" alt="Jane" />
                  </div>
                  <div>
                    <p className="font-bold text-xl">Jane Cooper</p>
                    <p className="text-primary-200">Home Owner & Loyal Customer</p>
                  </div>
                </div>
              </div>
              <div className="lg:pl-12 grid grid-cols-2 gap-6">
                 <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                    <p className="text-4xl font-black mb-2">98%</p>
                    <p className="font-bold opacity-80 uppercase tracking-widest text-xs">Satisfaction</p>
                 </div>
                 <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                    <p className="text-4xl font-black mb-2">24/7</p>
                    <p className="font-bold opacity-80 uppercase tracking-widest text-xs">Expert Support</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
           <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8">Ready to experience ProxiSense?</h2>
           <button
             onClick={() => navigate('/register')}
             className="btn-primary py-5 px-16 text-xl shadow-2xl hover:-translate-y-1 transition-all"
           >
             Create Free Account
           </button>
           <p className="mt-6 text-slate-500 font-medium">No credit card required to browse</p>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="mt-auto py-12 border-t border-slate-100">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">P</div>
             <span className="font-bold text-slate-800">ProxiSense AI</span>
           </div>
           <p className="text-slate-500 text-sm font-medium">© 2026 ProxiSense. All rights reserved.</p>
           <div className="flex gap-8">
              <Link to="/terms" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-colors">Terms</Link>
              <Link to="/privacy" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-colors">Privacy</Link>
              <Link to="/contact" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-colors">Contact</Link>
           </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color }) => {
  const colors = {
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-cyan-100 text-cyan-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600'
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-premium transition-all group"
    >
      <div className={`w-14 h-14 rounded-2xl ${colors[color]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </motion.div>
  );
};

export default Landing;



