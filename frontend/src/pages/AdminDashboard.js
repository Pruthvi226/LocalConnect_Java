import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, Briefcase, 
  Activity, Zap, Globe, 
  Settings, Bell, Search,
  TrendingUp, ArrowUpRight, ChevronRight,
  UserPlus, CheckCircle2, AlertTriangle,
  Database, Server, Cpu, ShieldAlert,
  BarChart3, PieChart as PieIcon,
  Clock
} from 'lucide-react';
import { adminService } from '../services/adminService';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError('Core analytics sync failed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-32 px-6 flex flex-col items-center justify-center">
         <div className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-6"></div>
         <p className="font-black text-white uppercase tracking-[0.3em] text-xs">Initializing Governance Hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-400 pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
        
        {/* Governance Header */}
        <header className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 backdrop-blur-xl">
           <div>
              <div className="flex items-center gap-3 text-primary-400 mb-2 font-black uppercase tracking-[0.2em] text-[10px]">
                 <ShieldCheck className="w-4 h-4" />
                 Ecosystem Governance Hub
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                Platform <span className="text-primary-500">Master.</span>
              </h1>
           </div>
           <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4 px-6 border-r border-white/5">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Health</p>
                    <p className="text-sm font-bold text-green-400">99.98% Optimized</p>
                 </div>
                 <Activity className="w-6 h-6 text-green-400 animate-pulse" />
              </div>
              <div className="flex gap-3">
                 <button className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors relative">
                    <Bell className="w-5 h-5 text-white" />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-primary-500 rounded-full"></span>
                 </button>
                 <button className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors text-white">
                    <Settings className="w-5 h-5" />
                 </button>
              </div>
           </div>
        </header>

        {/* Global KPI Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           {[
             { label: 'Total Citizens', value: analytics?.totalUsers || 0, icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10' },
             { label: 'Asset Listings', value: analytics?.totalServices || 0, icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
             { label: 'Cycle Velocity', value: analytics?.totalBookings || 0, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
             { label: 'Active Sessions', value: '1.2k', icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
           ].map((stat, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] group hover:border-primary-500/50 transition-all cursor-default"
             >
                <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform`}>
                   <stat.icon className="w-7 h-7" />
                </div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                <h3 className="text-4xl font-black text-white mb-2 tracking-tighter">{stat.value}</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-green-400">
                   <TrendingUp className="w-3.5 h-3.5" />
                   +8.4% growth
                </div>
             </motion.div>
           ))}
        </section>

        <div className="grid lg:grid-cols-3 gap-12">
           
           {/* Primary Control Area */}
           <div className="lg:col-span-2 space-y-12">
              
              {/* Entity management Tabs */}
              <section>
                 <div className="flex items-center gap-4 mb-8">
                    {[
                      { id: 'overview', label: 'Ecosystem Pulse' },
                      { id: 'users', label: 'Citizens' },
                      { id: 'providers', label: 'Experts' }
                    ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                          activeTab === tab.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'
                        }`}
                      >
                         {tab.label}
                      </button>
                    ))}
                 </div>

                 <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                       <motion.div 
                        key="pulse"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid md:grid-cols-2 gap-8"
                       >
                          {/* Visual KPI: Busiest Hours */}
                          <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5">
                             <div className="flex items-center justify-between mb-10">
                                <h3 className="text-xl font-black text-white">Peak Cycles</h3>
                                <Clock className="text-slate-700 w-5 h-5" />
                             </div>
                             <div className="flex items-end gap-3 h-48">
                                {[40, 70, 45, 90, 65, 30, 85].map((h, i) => (
                                   <div key={i} className="flex-1 group relative">
                                      <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        className="bg-primary-500/20 rounded-t-xl group-hover:bg-primary-500 transition-colors"
                                      ></motion.div>
                                      <div className="mt-4 text-[9px] font-black text-slate-700 uppercase tracking-widest text-center">{i+10}h</div>
                                   </div>
                                ))}
                             </div>
                          </div>

                          {/* Top Assets */}
                          <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5">
                             <div className="flex items-center justify-between mb-10">
                                <h3 className="text-xl font-black text-white">High Torque Assets</h3>
                                <Zap className="text-amber-500 w-5 h-5" />
                             </div>
                             <div className="space-y-6">
                                {Object.entries(analytics?.topServices || {}).slice(0, 4).map(([name, val], i) => (
                                   <div key={i} className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-black text-primary-400 text-xs">0{i+1}</div>
                                      <div className="flex-1 min-w-0">
                                         <p className="font-bold text-white truncate text-sm">{name}</p>
                                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{val} Transactions</p>
                                      </div>
                                      <div className="text-primary-500"><ArrowUpRight className="w-4 h-4" /></div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </section>

              {/* Ecosystem Logs */}
              <section>
                 <div className="bg-slate-900 rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500 rounded-full blur-[120px] -ml-32 -mt-32 opacity-10"></div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                       <h2 className="text-2xl font-black text-white tracking-tight">Governance Logs</h2>
                       <button className="text-[10px] font-black uppercase text-primary-400 tracking-widest hover:text-white transition-colors">Export Ledger</button>
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                       {[
                         { msg: 'System integrity synced with core AI layer.', time: '2m ago', type: 'system' },
                         { msg: 'Security firewall intercepted 4 unauthorized sync attempts.', time: '14m ago', type: 'alert' },
                         { msg: 'Expert "Alex P." reached Diamond tier status.', time: '1h ago', type: 'growth' },
                         { msg: 'Global maintenance cycle scheduled for GMT-00.', time: '4h ago', type: 'info' }
                       ].map((log, i) => (
                         <div key={i} className="flex items-center gap-6 p-5 bg-white/2 rounded-2xl border border-white/5 group hover:bg-white/5 transition-colors">
                            <div className={`w-2 h-2 rounded-full ${
                              log.type === 'alert' ? 'bg-red-500 animate-pulse' : 
                              log.type === 'system' ? 'bg-primary-500' : 'bg-slate-600'
                            }`}></div>
                            <p className="flex-1 text-sm font-bold text-slate-300">{log.msg}</p>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{log.time}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </section>
           </div>

           {/* Platform Intelligence Sidebar */}
           <div className="lg:col-span-1 space-y-8">
              
              {/* Engine Health */}
              <section className="bg-slate-900 rounded-[3rem] p-10 border border-white/5 overflow-hidden">
                 <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-400">
                       <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-white leading-none">Core Engine</h3>
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Status: Operational</p>
                    </div>
                 </div>

                 <div className="space-y-8">
                    {[
                      { l: 'Network Latency', v: 42, s: 'ms' },
                      { l: 'AI Inference', v: 88, s: '%' },
                      { l: 'Storage Load', v: 14, s: 'TB' }
                    ].map((item, i) => (
                      <div key={i}>
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">
                            <span>{item.l}</span>
                            <span className="text-white">{item.v}{item.s}</span>
                         </div>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${item.v > 100 ? 100 : item.v}%` }}
                              className="h-full bg-primary-500"
                            ></motion.div>
                         </div>
                      </div>
                    ))}
                 </div>
              </section>

              {/* Safety Monitor */}
              <section className="bg-red-500/5 rounded-[3rem] p-10 border border-red-500/10">
                 <h4 className="font-black text-red-400 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest">
                    <ShieldAlert className="w-5 h-5" />
                    Security Monitor
                 </h4>
                 <div className="space-y-4">
                    <div className="p-4 bg-red-500/10 rounded-2xl flex items-center justify-between">
                       <span className="text-xs font-bold text-red-200">Flagged Users</span>
                       <span className="text-lg font-black text-white">04</span>
                    </div>
                    <div className="p-4 bg-red-500/10 rounded-2xl flex items-center justify-between">
                       <span className="text-xs font-bold text-red-200">Disputed Cycles</span>
                       <span className="text-lg font-black text-white">00</span>
                    </div>
                 </div>
              </section>

              {/* Quick Actions */}
              <section className="bg-white/5 rounded-[3rem] p-8 border border-white/5">
                 <h4 className="font-black text-white mb-6 text-xs uppercase tracking-widest">Rapid Directives</h4>
                 <div className="grid grid-cols-2 gap-3">
                    <button className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-800 transition-colors">
                       <UserPlus className="w-5 h-5 text-primary-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Bootstrap</span>
                    </button>
                    <button className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-800 transition-colors">
                       <ShieldCheck className="w-5 h-5 text-emerald-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Verify All</span>
                    </button>
                    <button className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-800 transition-colors">
                       <AlertTriangle className="w-5 h-5 text-amber-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Audit Trails</span>
                    </button>
                    <button className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-800 transition-colors">
                       <Database className="w-5 h-5 text-indigo-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Backup</span>
                    </button>
                 </div>
              </section>
           </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

