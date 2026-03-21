import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import { Zap } from 'lucide-react';
import api from '../services/api';

const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || '';

function StripeForm({ clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/bookings',
          receipt_email: undefined,
        },
      });
      if (err) {
        setError(err.message || 'Payment failed');
      } else {
        onSuccess?.();
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={!stripe || loading} className="btn-primary w-full">
        {loading ? 'Processing…' : 'Pay with Card'}
      </button>
    </form>
  );
}

const Checkout = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [config, setConfig] = useState(null);
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookingData, configData] = await Promise.all([
          bookingService.getById(bookingId),
          api.get('/payments/config').then((r) => r.data),
        ]);
        setBooking(bookingData);
        setConfig(configData);
      } catch (err) {
        setError('Failed to load checkout');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  const createStripeIntent = async () => {
    try {
      const data = await paymentService.createStripeIntent(Number(bookingId));
      setStripeClientSecret(data.clientSecret);
      setPaypalOrderId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create payment');
    }
  };

  const createPayPalOrder = async () => {
    try {
      const data = await paymentService.createPayPalOrder(Number(bookingId));
      setPaypalOrderId(data.orderId);
      setStripeClientSecret(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create PayPal order');
    }
  };

  const handlePayPalApprove = async (data) => {
    try {
      await paymentService.capturePayPalOrder(data.orderID);
      setPaymentSuccess(true);
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'PayPal capture failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">{error}</p>
        <button type="button" onClick={() => navigate('/bookings')} className="btn-primary mt-4">
          Back to Bookings
        </button>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="relative w-24 h-24 mx-auto">
             <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
             <div className="relative w-full h-full bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
             </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Payment Successful!</h2>
            <p className="text-slate-500 font-medium">Your booking has been confirmed. Redirecting you to your bookings...</p>
          </div>
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleRazorpayPayment = async () => {
    if (!window.Razorpay) {
      setError("Razorpay SDK not loaded. Please check your internet connection.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const orderData = await paymentService.createRazorpayOrder(Number(bookingId));
      
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: "INR",
        name: "ProxiSense",
        description: `Payment for ${booking?.service?.title}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            setLoading(true);
            await paymentService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            setPaymentSuccess(true);
            setTimeout(() => navigate('/bookings'), 2500);
          } catch (err) {
            console.error("Verification error:", err);
            setError(err.response?.data?.message || "Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        prefill: {
          name: booking?.user?.fullName || "",
          email: booking?.user?.email || "",
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: () => {
             setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(response.error.description || "Payment failed");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Order creation error:", err);
      setError(err.response?.data?.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  const amount = booking?.service?.price;
  const stripePromise = config?.stripePublishableKey ? loadStripe(config.stripePublishableKey) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <h1 className="text-3xl font-black mb-6 tracking-tight text-slate-800">Complete Payment</h1>
        
        {booking && (
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-premium mb-8">
             <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Pricing Breakdown</h2>
             <div className="space-y-3 mb-6">
                {/* Worker Earnings */}
                <div className="flex justify-between text-sm font-bold">
                   <span className="text-slate-600 flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                     Worker Earnings (85%)
                   </span>
                   <span className="text-emerald-700">₹{booking.basePrice ? (booking.basePrice * 0.85).toFixed(0) : (booking.service?.price * 0.85).toFixed(0)}</span>
                </div>
                {/* Platform Fee */}
                <div className="flex justify-between text-sm font-bold">
                   <span className="text-slate-600 flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block"></span>
                     Platform Fee (15% + fixed)
                   </span>
                   <span className="text-indigo-700">₹{booking.platformFee || 50}</span>
                </div>
                {booking.isEmergency && (
                   <div className="flex justify-between text-sm font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 mt-2">
                      <span className="flex items-center gap-1.5"><Zap className="w-4 h-4"/> Emergency Surge (1.5x)</span>
                      <span>+₹{(booking.basePrice - Number(booking.service?.price)).toFixed(2)}</span>
                   </div>
                )}
             </div>
             <div className="h-px bg-slate-100 mb-4"></div>
             <div className="flex justify-between text-3xl font-black text-slate-900">
                <span>Total Due</span>
                <span className="text-primary-600">₹{booking.totalPrice}</span>
             </div>
             {/* Guarantee Badge */}
             <div className="mt-6 flex items-center gap-3 bg-green-50 border border-green-100 p-4 rounded-2xl">
                <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                   <p className="text-xs font-black text-green-800 uppercase tracking-wider">ProxiSense Protect</p>
                   <p className="text-xs text-green-700 font-medium">Full refund if work quality doesn't meet standards. No questions asked.</p>
                </div>
             </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {!stripeClientSecret && !paypalOrderId && (
          <div className="card space-y-4">
            {config?.razorpayEnabled && (
              <button 
                type="button" 
                onClick={handleRazorpayPayment} 
                disabled={loading}
                className="w-full bg-[#3399cc] hover:bg-[#2b86b3] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <img src="https://razorpay.com/favicon.png" alt="RZP" className="w-5 h-5" />
                    Pay with Razorpay
                  </>
                )}
              </button>
            )}
            
            {config?.stripeEnabled && (
              <button type="button" onClick={createStripeIntent} className="btn-primary w-full opacity-60">
                Pay with Card (Stripe)
              </button>
            )}
            
            {config?.paypalEnabled && PAYPAL_CLIENT_ID && (
              <button type="button" onClick={createPayPalOrder} className="btn-secondary w-full opacity-60">
                Pay with PayPal
              </button>
            )}

            {!config?.stripeEnabled && !config?.paypalEnabled && !config?.razorpayEnabled && (
              <p className="text-gray-500">No payment methods configured. Contact support.</p>
            )}
          </div>
        )}

        {stripeClientSecret && stripePromise && (
          <div className="card">
            <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
              <StripeForm onSuccess={() => setPaymentSuccess(true)} />
            </Elements>
            <button
              type="button"
              onClick={() => setStripeClientSecret(null)}
              className="mt-4 text-gray-600 text-sm hover:underline"
            >
              Choose another method
            </button>
          </div>
        )}

        {paypalOrderId && PAYPAL_CLIENT_ID && (
          <div className="card">
            <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
              <PayPalButtons
                createOrder={() => Promise.resolve(paypalOrderId)}
                onApprove={({ orderID }) => handlePayPalApprove({ orderID })}
                onError={(err) => setError(err?.message || 'PayPal error')}
              />
            </PayPalScriptProvider>
            <button
              type="button"
              onClick={() => setPaypalOrderId(null)}
              className="mt-4 text-gray-600 text-sm hover:underline"
            >
              Choose another method
            </button>
          </div>
        )}

        <button type="button" onClick={() => navigate('/bookings')} className="text-gray-600 mt-6 hover:underline">
          Back to Bookings
        </button>
      </div>
    </div>
  );
};

export default Checkout;
