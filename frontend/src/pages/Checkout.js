import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
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
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Payment successful!</h2>
        <p className="text-slate-500 font-bold">Your booking is now confirmed. Redirecting…</p>
      </div>
    );
  }

  const handleRazorpayPayment = async () => {
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
            setTimeout(() => navigate('/bookings'), 2000);
          } catch (err) {
            setError(err.response?.data?.message || "Payment verification failed");
          } finally {
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
        setError(response.error.description);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      // Don't set loading false here because rzp is async popup
    }
  };

  const amount = booking?.service?.price;
  const stripePromise = config?.stripePublishableKey ? loadStripe(config.stripePublishableKey) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <h1 className="text-2xl font-bold mb-2">Checkout</h1>
        <p className="text-gray-600 mb-6">
          {booking?.service?.title} — ${amount}
        </p>
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
