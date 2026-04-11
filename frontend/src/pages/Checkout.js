import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import { Zap, CreditCard, ShieldCheck, CheckCircle2, ArrowLeft, Wallet } from 'lucide-react';

const Checkout = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [offlineLoading, setOfflineLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [configMessage, setConfigMessage] = useState('');
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const insuranceFee = 29; // Flat insurance fee in INR

  useEffect(() => {
    const load = async () => {
      try {
        const [bookingData, config] = await Promise.all([
          bookingService.getById(bookingId),
          paymentService.getConfig()
        ]);
        setBooking(bookingData);
        setRazorpayEnabled(config.razorpayEnabled);
        setConfigMessage(config.message || '');
      } catch (err) {
        setError('Failed to load checkout details. Please go back and try again.');
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [bookingId]);

  // Redirect to bookings after success
  useEffect(() => {
    if (paymentSuccess) {
      const t = setTimeout(() => navigate('/my-bookings'), 2800);
      return () => clearTimeout(t);
    }
  }, [paymentSuccess, navigate]);

  const handleRazorpayPayment = async () => {
    if (!window.Razorpay) {
      setError('Razorpay SDK not loaded. Please try the Pay After Service option below.');
      return;
    }
    setPayLoading(true);
    setError(null);
    try {
      const orderData = await paymentService.createRazorpayOrder(Number(bookingId));

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'ProxiSense',
        description: `Payment for ${booking?.service?.title || 'Service'}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            setPayLoading(true);
            await paymentService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setPaymentSuccess(true);
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed. Contact support.');
            setPayLoading(false);
          }
        },
        prefill: {
          name: booking?.customerName || '',
          email: booking?.customerEmail || 'customer@example.com',
        },
        theme: { color: '#4F46E5' },
        modal: {
          ondismiss: () => setPayLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(response.error.description || 'Payment failed. Please try again.');
        setPayLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment. Try Pay After Service.');
      setPayLoading(false);
    }
  };

  const handleOfflinePayment = async () => {
    setOfflineLoading(true);
    setError(null);
    try {
      await paymentService.createOfflinePayment(Number(bookingId));
      setPaymentSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to select Pay After Service. Please try again.');
      setOfflineLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Loading Checkout…</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center shadow-premium border border-slate-100">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Checkout Error</h2>
          <p className="text-slate-500 font-medium mb-8">{error}</p>
          <button onClick={() => navigate('/my-bookings')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative w-28 h-28 mx-auto">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
            <div className="relative w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-200">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">Booking Confirmed!</h2>
            <p className="text-slate-500 font-medium text-lg">Your service has been successfully booked. Redirecting you now…</p>
          </div>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = booking?.totalPrice ?? 0;
  const basePrice = booking?.basePrice ?? 0;
  const platformFee = booking?.platformFee ?? 0;

  // ── Main Checkout UI ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 pb-20 pt-28">
      <div className="container mx-auto px-4 max-w-2xl">

        {/* Back */}
        <button
          onClick={() => navigate('/my-bookings')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Bookings
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-600 px-4 py-1.5 rounded-full mb-4 text-xs font-black uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> Secure Checkout
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Review &amp; <span className="text-primary-600">Pay</span>
          </h1>
        </div>

        {/* Service Summary */}
        {booking && (
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium mb-6">
            <div className="flex items-center gap-5 pb-6 border-b border-slate-50 mb-6">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                <img
                  src={booking.service?.imageUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=200'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-black text-slate-900 text-lg leading-tight">{booking.service?.title || 'Service'}</p>
                <p className="text-sm font-bold text-slate-400 mt-1">{booking.service?.category}</p>
              </div>
            </div>

            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Pricing Breakdown</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center px-1">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                  Service Payout
                </span>
                <span className="font-black text-slate-900 font-mono">₹{(basePrice * 0.90).toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />
                  Platform Support
                </span>
                <span className="font-black text-slate-900 font-mono">₹{platformFee}</span>
              </div>
              {booking.isEmergency && (
                <div className="flex justify-between items-center bg-red-50 p-4 rounded-2xl border border-red-100">
                  <span className="flex items-center gap-2 text-sm font-bold text-red-600">
                    <Zap className="w-4 h-4" /> Emergency Surge (1.5×)
                  </span>
                  <span className="font-black text-red-600">+₹{(basePrice - basePrice / 1.5).toFixed(0)}</span>
                </div>
              )}
            </div>

            {/* Insurance Option */}
            <div className={`p-4 rounded-2xl border-2 transition-all mb-8 ${includeInsurance ? 'bg-indigo-50 border-indigo-200 ring-4 ring-indigo-50/50' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox" 
                    checked={includeInsurance}
                    onChange={(e) => setIncludeInsurance(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded-lg focus:ring-indigo-500 border-slate-300"
                  />
                  <div>
                    <p className="font-black text-slate-900 text-sm flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-indigo-600" />
                       Safety Insurance
                    </p>
                    <p className="text-[10px] font-bold text-indigo-600 opacity-70">Guarantees accidental damage protection up to ₹10,000</p>
                  </div>
                </div>
                <span className="font-black text-indigo-700 font-mono">₹{insuranceFee}</span>
              </label>
            </div>

            <div className="h-px bg-slate-100 mb-5" />
            <div className="flex justify-between items-center px-1">
              <div>
                <span className="text-xl font-black text-slate-900">Total Due</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">all taxes included</p>
              </div>
              <span className="text-4xl font-black text-primary-600 drop-shadow-sm">₹{totalPrice + (includeInsurance ? insuranceFee : 0)}</span>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-2xl mb-6 flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {/* Payment Actions */}
        <div className="space-y-4">
        {/* Razorpay */}
        {razorpayEnabled ? (
          <button
            type="button"
            onClick={handleRazorpayPayment}
            disabled={payLoading || offlineLoading}
            className="w-full bg-[#3399cc] hover:bg-[#2b86b3] disabled:opacity-60 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-blue-200 transition-all active:scale-[0.98] ring-4 ring-white"
          >
            {payLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay Online · ₹{totalPrice}
              </>
            )}
          </button>
        ) : (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl text-center">
            <p className="text-amber-700 font-black text-sm mb-1 uppercase tracking-tight">Online Payment Unavailable</p>
            <p className="text-amber-600 font-bold text-[11px] uppercase tracking-widest">— Use Cash or UPI After Service —</p>
          </div>
        )}

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Offline / Pay After Service */}
          <button
            type="button"
            onClick={handleOfflinePayment}
            disabled={payLoading || offlineLoading}
            className="w-full bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-700 py-5 rounded-3xl font-black flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-slate-300 transition-all active:scale-[0.98]"
          >
            {offlineLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                Confirming…
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 text-slate-400" />
                Pay After Service (Cash / UPI)
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 font-medium px-4">
            Secured with 256-bit encryption · ProxiSense&nbsp;AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
