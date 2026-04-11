import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Search, Filter, Calendar, MapPin, 
  ChevronRight, ArrowLeft, Download, ShieldCheck, 
  XXCircle, DollarSign, Clock, LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { providerService } from '../services/providerService';
import dayjs from 'dayjs';
import Pagination from '../components/Pagination';

const BookingHistory = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, COMPLETED, CANCELLED
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    const loadHistory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await providerService.getProviderBookings({
                page,
                size: pageSize,
                sort: 'createdAt,desc',
                status: filter === 'ALL' ? null : filter
            });
            setBookings(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error('Failed to load history', err);
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <button 
                            onClick={() => navigate('/provider/dashboard')}
                            className="flex items-center gap-2 text-slate-400 hover:text-primary-600 font-black text-[10px] uppercase tracking-widest mb-4 transition-colors group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                            Return to Dashboard
                        </button>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-200">
                                <Package className="w-6 h-6" />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Booking <span className="text-primary-600">History</span></h1>
                        </div>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] ml-1">Comprehensive archive of your specialist operations</p>
                    </div>

                    <div className="flex items-center bg-white border-2 border-slate-100 rounded-3xl p-1.5 shadow-sm">
                        {['ALL', 'COMPLETED', 'CANCELLED'].map(f => (
                            <button
                                key={f}
                                onClick={() => { setFilter(f); setPage(0); }}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filter === f ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading && bookings.length === 0 ? (
                    <div className="space-y-6">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-48 bg-white rounded-[2.5rem] border border-slate-100 animate-pulse"></div>
                        ))}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-24 text-center border border-slate-100 shadow-premium">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                            <ShieldCheck className="w-12 h-12 text-slate-200" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Archive Empty</h2>
                        <p className="text-slate-500 font-medium">No records found for the selected filter.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence mode="popLayout">
                            {bookings.map((b) => (
                                <motion.div
                                    key={b.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium flex flex-col md:flex-row md:items-center gap-8 group hover:border-primary-200 transition-colors"
                                >
                                    <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200/50 shadow-inner">
                                        <img src={`https://i.pravatar.cc/150?u=${b.customer?.id || b.id}`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-xl font-black text-slate-900 uppercase truncate">{b.customer?.fullName || 'Client'}</h4>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                                b.status === 'COMPLETED' 
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                    : b.status === 'CANCELLED'
                                                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                    : 'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}>
                                                {b.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                                            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {dayjs(b.bookingDate).format('MMM D, YYYY')}</div>
                                            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {b.service?.location}</div>
                                            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {dayjs(b.bookingDate).format('h:mm A')}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 md:border-l border-slate-100 md:pl-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payout</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{b.totalPrice}</p>
                                        </div>
                                        <div className={`p-4 rounded-2xl ${b.payment?.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <Pagination 
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            totalElements={totalElements}
                            size={pageSize}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingHistory;
