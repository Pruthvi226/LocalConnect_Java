import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Users, 
  Plus, Edit2, Trash2, CheckCircle2, 
  Clock, XCircle, AlertCircle, 
  MessageSquare, DollarSign, Zap,
  ChevronRight, Filter, Settings,
  ShieldCheck, LayoutDashboard,
  MoreVertical, ArrowUpRight, Search,
  Calendar, MapPin, Star
} from 'lucide-react';
import dayjs from 'dayjs';
import { providerService } from '../services/providerService';
import { serviceService } from '../services/serviceService';

const ProviderDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState({});
  
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: '', description: '', category: '', price: '', location: '', isAvailable: true
  });
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, servicesData, bookingsData] = await Promise.all([
        providerService.getSummary(),
        providerService.getMyServices(),
        providerService.getProviderBookings(),
      ]);
      setSummary(summaryData);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      setError('Operational data sync failed. Retrying...');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeRequests = bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status));

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setStatusUpdating(prev => ({ ...prev, [bookingId]: true }));
      await providerService.updateBookingStatus(bookingId, newStatus);
      await loadData();
    } catch (err) { 
      console.error('Status update failed:', err);
    } finally {
      setStatusUpdating(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleOpenServiceDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        title: service.title,
        description: service.description || '',
        category: service.category || '',
        price: service.price?.toString() || '',
        location: service.location || '',
        isAvailable: service.isAvailable !== false
      });
    } else {
      setEditingService(null);
      setServiceForm({ title: '', description: '', category: '', price: '', location: '', isAvailable: true });
    }
    setServiceDialogOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...serviceForm, price: parseFloat(serviceForm.price) || 0 };
      if (editingService) await serviceService.update(editingService.id, payload);
      else await serviceService.create(payload);
      setServiceDialogOpen(false);
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Archive this service profile?')) return;
    try {
      await serviceService.delete(id);
      loadData();
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 px-6 flex flex-col items-center">
         <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
         <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Syncing Ops Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
        
        {/* Dashboard Header */}
        <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
           <div>
              <div className="flex items-center gap-3 text-primary-600 mb-2 font-black uppercase tracking-[0.2em] text-[10px]">
                 <LayoutDashboard className="w-4 h-4" />
                 Provider Operations Center
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Control <span className="text-primary-600">Central.</span>
              </h1>
           </div>
           <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 px-4 border-r border-slate-100">
                 <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                    <p className="text-sm font-bold text-slate-900 leading-none">Accepting Requests</p>
                 </div>
              </div>
              <button 
                onClick={() => handleOpenServiceDialog()}
                className="bg-primary-600 hover:bg-primary-700 text-white font-black py-3 px-8 rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                 <Plus className="w-4 h-4" />
                 Launch Service
              </button>
           </div>
        </header>

        {/* Global Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           {[
             { label: 'Net Revenue', value: `₹${Number(summary?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', trend: '+12% this month' },
             { label: 'Active Tasks', value: activeRequests.length || 0, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', trend: '3 new notifications' },
             { label: 'Completion', value: '98%', icon: ShieldCheck, color: 'text-primary-600', bg: 'bg-primary-50', trend: 'Top 5% Expert' },
             { label: 'Service Hub', value: services.length, icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Stable performance' },
           ].map((stat, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-primary-200 transition-colors"
             >
                <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{stat.value}</h3>
                <p className="text-[11px] font-bold text-slate-500 leading-none flex items-center gap-1">
                   <TrendingUp className="w-3 h-3 text-green-500" />
                   {stat.trend}
                </p>
             </motion.div>
           ))}
        </section>

        <div className="grid lg:grid-cols-3 gap-12">
           
           {/* Active Requests Inbox */}
           <div className="lg:col-span-2 space-y-12">
              <section>
                 <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-2xl font-black text-slate-900">Task Inbox</h2>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                       Priority Mode <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    </div>
                 </div>

                 {activeRequests.length === 0 ? (
                   <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-premium">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                         <MessageSquare className="w-10 h-10 text-slate-200" />
                      </div>
                      <h4 className="text-xl font-black text-slate-800 mb-2">Inbox Clear</h4>
                      <p className="text-slate-500 font-medium">All current requests have been processed.</p>
                   </div>
                 ) : (
                   <div className="space-y-6">
                      <AnimatePresence mode="popLayout">
                        {activeRequests.map((booking) => (
                           <motion.div 
                            key={booking.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium flex flex-col md:flex-row md:items-center gap-8 group"
                           >
                              <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-50">
                                 <img src={`https://i.pravatar.cc/100?u=${booking.user?.id || 'user'}`} alt="" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-lg font-black text-slate-900 truncate">
                                       {booking.user?.fullName || 'ProxiSense Client'}
                                    </h4>
                                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                       booking.status === 'CONFIRMED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                       {booking.status}
                                    </span>
                                 </div>
                                 <p className="text-slate-500 font-bold text-sm mb-4">
                                    Needs: <span className="text-primary-600 underline underline-offset-4">{booking.service?.title}</span>
                                 </p>
                                 <div className="flex flex-wrap gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {dayjs(booking.bookingDate).format('MMM D, h:mm A')}</div>
                                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {booking.service?.location}</div>
                                 </div>
                              </div>
                              <div className="flex md:flex-col gap-3">
                                 {booking.status === 'PENDING' ? (
                                    <button 
                                      disabled={statusUpdating[booking.id]}
                                      onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                                      className="flex-1 bg-slate-900 text-white font-black py-4 px-10 rounded-2xl text-sm hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                       {statusUpdating[booking.id] ? 'Updating...' : 'Accept Request'}
                                    </button>
                                 ) : (
                                    <div className="flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest bg-green-50 px-6 py-4 rounded-2xl border border-green-100">
                                       <CheckCircle2 className="w-4 h-4" /> Ready to Fulfill
                                    </div>
                                 )}
                                 <div className="flex gap-2">
                                    <button 
                                      disabled={statusUpdating[booking.id]}
                                      onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                                      className="p-4 bg-green-50 text-green-600 rounded-xl border border-green-100 hover:bg-green-100 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                       <CheckCircle2 className="w-5 h-5" />
                                    </button>
                                    <button 
                                      disabled={statusUpdating[booking.id]}
                                      onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                                      className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                       <XCircle className="w-5 h-5" />
                                    </button>
                                 </div>
                              </div>
                           </motion.div>
                        ))}
                      </AnimatePresence>
                   </div>
                 )}
              </section>

              {/* Service Inventory */}
              <section>
                 <div className="bg-white rounded-[3rem] p-8 lg:p-12 border border-slate-100 shadow-premium overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                       <h2 className="text-2xl font-black text-slate-800 tracking-tight">Service Ecosystem</h2>
                       <Search className="text-slate-300 w-5 h-5" />
                    </div>
                    
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="border-b border-slate-50">
                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Insight</th>
                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Metric</th>
                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visibility</th>
                                <th className="pb-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {services.map((s) => (
                                <tr key={s.id} className="group transition-colors hover:bg-slate-50/50">
                                   <td className="py-6 pr-4">
                                      <p className="font-black text-slate-800 leading-tight mb-1">{s.title}</p>
                                      <p className="text-xs font-bold text-slate-400 tracking-tight">{s.category}</p>
                                   </td>
                                   <td className="py-6 pr-4">
                                      <p className="font-black text-primary-600">₹{s.price}</p>
                                   </td>
                                   <td className="py-6 pr-4">
                                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                         s.isAvailable ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                      }`}>
                                         <div className={`w-1.5 h-1.5 rounded-full ${s.isAvailable ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                         {s.isAvailable ? 'Public' : 'Hidden'}
                                      </div>
                                   </td>
                                   <td className="py-6 text-right">
                                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => handleOpenServiceDialog(s)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary-600 hover:border-primary-200 shadow-sm transition-all">
                                            <Edit2 className="w-4 h-4" />
                                         </button>
                                         <button onClick={() => handleDeleteService(s.id)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all">
                                            <Trash2 className="w-4 h-4" />
                                         </button>
                                      </div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </section>
           </div>

           {/* Performance sidebar */}
           <div className="lg:col-span-1 space-y-8">
              <section className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full blur-[80px] -mr-16 -mt-16 opacity-30"></div>
                 <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-10 leading-tight">Growth <br /> Analytics</h3>
                    
                    <div className="space-y-8">
                       {[
                         { label: 'Booking Success', val: 94, color: 'bg-primary-500' },
                         { label: 'Response Speed', val: 82, color: 'bg-green-500' },
                         { label: 'Resolution Rate', val: 78, color: 'bg-indigo-500' }
                       ].map((m, i) => (
                         <div key={i}>
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3 opacity-60">
                               <span>{m.label}</span>
                               <span>{m.val}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 whileInView={{ width: `${m.val}%` }}
                                 className={`h-full ${m.color}`}
                               ></motion.div>
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Average Review</p>
                          <div className="flex items-center gap-1.5">
                             <span className="text-2xl font-black">4.9</span>
                             <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          </div>
                       </div>
                       <button className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
                          <ArrowUpRight className="w-5 h-5 text-primary-400" />
                       </button>
                    </div>
                 </div>
              </section>

              <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium">
                 <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary-500" />
                    Quick Insights
                 </h4>
                 <ul className="space-y-4">
                    <li className="p-4 bg-slate-50 rounded-2xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Busy Window</p>
                       <p className="text-sm font-bold text-slate-700">Tue & Fri are your peak days.</p>
                    </li>
                    <li className="p-4 bg-slate-50 rounded-2xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Optimization</p>
                       <p className="text-sm font-bold text-slate-700">Response time improved by 4m.</p>
                    </li>
                 </ul>
              </section>
           </div>

        </div>
      </div>

      {/* Service Editor Modal */}
      <AnimatePresence>
        {serviceDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 mt-12">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setServiceDialogOpen(false)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             ></motion.div>
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">
                   {editingService ? 'Refine Service' : 'Initialize Specialist Profile'}
                </h3>
                
                <form onSubmit={handleSaveService} className="grid md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Service Title</label>
                      <input 
                        required
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-primary-500 transition-colors"
                        placeholder="e.g. Master Pipe Installation"
                        value={serviceForm.title}
                        onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                      />
                   </div>
                   <div className="md:col-span-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Visual Description</label>
                      <textarea 
                        rows="3"
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-medium text-slate-700 focus:outline-none focus:border-primary-500 transition-colors"
                        placeholder="Detail your process and tools used..."
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      />
                   </div>
                   <div>
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Specialization Category</label>
                      <input 
                        required
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-primary-500 transition-colors"
                        placeholder="e.g. Technical Repair"
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                      />
                   </div>
                   <div>
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Professional Fee (₹)</label>
                      <input 
                        required
                        type="number"
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-black text-primary-600 focus:outline-none focus:border-primary-500 transition-colors"
                        placeholder="0.00"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                      />
                   </div>
                   <div>
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Operating Base</label>
                      <input 
                        required
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-primary-500 transition-colors"
                        placeholder="e.g. Downtown Core"
                        value={serviceForm.location}
                        onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                      />
                   </div>
                   <div>
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Project Visibility</label>
                      <select 
                        value={serviceForm.isAvailable}
                        onChange={(e) => setServiceForm({ ...serviceForm, isAvailable: e.target.value === 'true' })}
                        className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-primary-500 transition-colors appearance-none"
                      >
                         <option value="true">Publicly Listed</option>
                         <option value="false">Private Staging</option>
                      </select>
                   </div>
                   
                   <div className="md:col-span-2 pt-6 flex gap-4">
                      <button 
                        type="submit"
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/20 active:scale-95 transition-all outline-none"
                      >
                         Sync to Cloud
                      </button>
                      <button 
                        type="button"
                        onClick={() => setServiceDialogOpen(false)}
                        className="px-10 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all outline-none"
                      >
                         Abort
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProviderDashboard;
