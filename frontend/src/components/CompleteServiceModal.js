import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

const CompleteServiceModal = ({ isOpen, onClose, onConfirm, booking, loading }) => {
  const [paymentStatus, setPaymentStatus] = useState('PAID');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Complete Service</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Booking #{booking?.id}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-8">
              <h4 className="text-lg font-black text-slate-900 mb-2">Final Step: Payment Confirmation</h4>
              <p className="text-slate-500 font-medium leading-relaxed">
                You are marking the service for <span className="text-slate-900 font-bold">{booking?.Customer?.fullName}</span> as completed. Has the customer finished the payment?
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <button
                onClick={() => setPaymentStatus('PAID')}
                className={`w-full p-5 rounded-3xl border-2 transition-all flex items-start gap-4 text-left ${
                  paymentStatus === 'PAID' 
                    ? 'border-primary-600 bg-primary-50/30' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-1 ${
                  paymentStatus === 'PAID' ? 'border-primary-600 bg-primary-600' : 'border-slate-200'
                }`}>
                  {paymentStatus === 'PAID' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div>
                  <p className="font-black text-slate-900 mb-0.5 flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${paymentStatus === 'PAID' ? 'text-primary-600' : 'text-slate-400'}`} />
                    Payment Received
                  </p>
                  <p className="text-xs font-medium text-slate-500">The customer has paid the full amount of ₹{booking?.totalPrice}.</p>
                </div>
              </button>

              <button
                onClick={() => setPaymentStatus('PENDING')}
                className={`w-full p-5 rounded-3xl border-2 transition-all flex items-start gap-4 text-left ${
                  paymentStatus === 'PENDING' 
                    ? 'border-amber-500 bg-amber-50/30' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-1 ${
                  paymentStatus === 'PENDING' ? 'border-amber-500 bg-amber-500' : 'border-slate-200'
                }`}>
                  {paymentStatus === 'PENDING' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div>
                  <p className="font-black text-slate-900 mb-0.5 flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${paymentStatus === 'PENDING' ? 'text-amber-500' : 'text-slate-400'}`} />
                    Payment Pending
                  </p>
                  <p className="text-xs font-medium text-slate-500">The service is done, but the payment will be settled later.</p>
                </div>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3 mb-8">
              <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5" />
              <p className="text-[10px] font-bold text-slate-500 leading-normal uppercase tracking-tight">
                This action will notify the client and move the booking to your "Completed" records.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 px-6 border-2 border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
              >
                Go Back
              </button>
              <button
                disabled={loading}
                onClick={() => onConfirm(paymentStatus)}
                className="flex-[2] py-4 px-6 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm Completion
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CompleteServiceModal;
