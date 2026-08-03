import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Check, LogOut, ArrowRight, IndianRupee } from 'lucide-react';

const RegisterPlanPayment = () => {
  const { user, logout, setMemberStatus } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await API.get('/plans');
        setPlans(res.data);
        if (res.data.length > 0) {
          setSelectedPlanId(res.data[0]._id);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch membership plans. Please try again.');
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedPlanId) return;
    setPaymentProcessing(true);
    setError('');

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError('Razorpay Checkout SDK failed to load. Please verify your connection.');
      setPaymentProcessing(false);
      return;
    }

    try {
      // 1. Create order on backend
      const orderRes = await API.post('/payments/create-order', { plan_id: selectedPlanId });
      const { order_id, amount, currency, key_id } = orderRes.data;

      // 2. Configure Razorpay options
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'IronPulse Fitness Center',
        description: `Membership registration plan purchase`,
        order_id: order_id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#4F46E5', // Indigo accent
        },
        handler: async function (response) {
          try {
            // 3. Verify Razorpay transaction
            const verifyRes = await API.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: selectedPlanId,
            });

            // 4. Update state inside auth context to unlock
            if (verifyRes.data?.member?.status) {
              setMemberStatus(verifyRes.data.member.status);
            }
            alert('Payment verified and membership activated! Awaiting coach approval.');
          } catch (err) {
            console.error('Payment signature check failed:', err);
            setError('Verification failed. If money was deducted, please contact support.');
          } finally {
            setPaymentProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentProcessing(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Failed to initiate Razorpay order:', err);
      setError(err.response?.data?.message || 'Initiating payment failed. Please try again.');
      setPaymentProcessing(false);
    }
  };

  const selectedPlan = plans.find((p) => p._id === selectedPlanId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] py-12 px-4 sm:px-6 lg:px-8 relative flex flex-col justify-between">
      {/* Logout corner button */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-all rounded-lg text-xs font-semibold shadow-sm hover:shadow"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full my-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Choose your <span className="text-indigo-600">IronPulse</span> Plan
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Get started by picking a membership plan. Pay securely online via Razorpay to activate your signup request.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center shadow-sm max-w-lg mx-auto">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isSelected = plan._id === selectedPlanId;
            return (
              <div
                key={plan._id}
                onClick={() => setSelectedPlanId(plan._id)}
                className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                  isSelected ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                    Selected
                  </span>
                )}

                <div className="space-y-2">
                  <h3 className="text-md font-bold text-slate-900">{plan.name}</h3>
                  <div className="flex items-baseline text-slate-900">
                    <span className="text-3xl font-extrabold tracking-tight">₹{plan.price}</span>
                    <span className="ml-1 text-xs text-slate-500">/ {plan.duration_days} days</span>
                  </div>
                  {plan.description && (
                    <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
                      {plan.description}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <span
                    className={`w-full flex items-center justify-center gap-1 py-2 px-4 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-indigo-550 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected ? <Check size={14} /> : null}
                    {isSelected ? 'Selected Plan' : 'Select Plan'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Plan Summary Banner & Pay Button */}
        {selectedPlan && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Checkout Summary</span>
              <h4 className="text-lg font-bold text-slate-900">{selectedPlan.name} Membership</h4>
              <p className="text-xs text-slate-500">Duration: {selectedPlan.duration_days} Days — Price: ₹{selectedPlan.price}</p>
            </div>

            <button
              onClick={handlePayment}
              disabled={paymentProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {paymentProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Pay & Join
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-[10px] text-slate-400 py-6">
        IronPulse Fitness Center © 2026. All payments are processed and verified securely.
      </div>
    </div>
  );
};

export default RegisterPlanPayment;
