import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Filter, Search, Calendar, CheckCircle2, XCircle, 
  ArrowLeft, ChevronLeft, ChevronRight, Clock, MapPin, ExternalLink 
} from 'lucide-react';
import { providerService } from '../services/providerService';
import dayjs from 'dayjs';

const BookingHistory = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState('ALL'); // ALL, COMPLETED, CANCELLED

  useEffect(() => {
    fetchHistory();
  }, [page, filter]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await providerService.getProviderBookings({ 
        page, 
        size: 10,
        status: filter !== 'ALL' ? filter : undefined
      });
      // Filter only finished bookings if filter is ALL (or let backend handle it)
      // For now, let's assume we want to show everything and users can filter
      setBookings(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError('Failed to load booking history.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const dashboardClasses = "min-h-screen bg-[#F8FAFC] pt-28 pb-20";

  return (
    <div className={dashboardClasses}>
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <button 
              onClick={() => navigate('/provider/dashboard')}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold mb-4 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <History className="w-10 h-10 text-indigo-600" />
              Booking <span className="text-indigo-600">History.</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Review your past assignments and performance</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            {['ALL', 'COMPLETED', 'CANCELLED'].map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(0); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === f 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* content area */}
        {loading && bookings.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 text-center flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Records…</p>
          </div>
        ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-12 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 mb-2">History Unavailable</h3>
              <p className="text-slate-500 font-medium mb-6">{error}</p>
              <button onClick={fetchHistory} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-sm">Retry Request</button>
            </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <History className="w-10 h-10 text-slate-200" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">No History Found</h3>
             <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
               You don't have any {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings in your records yet.
             </p>
             <button onClick={() => navigate('/provider/dashboard')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm">Get Started</button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {bookings.map((booking, idx) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
                        <Calendar className="w-7 h-7 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-black text-slate-900 text-lg">#{booking.id} · {booking.service?.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-slate-400">
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {dayjs(booking.bookingDate).format('MMM DD, YYYY · hh:mm A')}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {booking.service?.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-10 border-t lg:border-t-0 pt-4 lg:pt-0">
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payout</p>
                          <p className="text-xl font-black text-slate-900">₹{booking.totalPrice}</p>
                       </div>
                       <button 
                         onClick={() => navigate(`/provider/bookings/${booking.id}`)}
                         className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                       >
                         <ExternalLink className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-10">
                <button
                  disabled={page === 0 || loading}
                  onClick={() => setPage(prev => prev - 1)}
                  className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-400 disabled:opacity-30 transition-all shadow-sm bg-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                        page === i 
                          ? 'bg-indigo-600 text-white shadow-lg' 
                          : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={page === totalPages - 1 || loading}
                  onClick={() => setPage(prev => prev + 1)}
                  className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-400 disabled:opacity-30 transition-all shadow-sm bg-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
