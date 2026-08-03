import React, { useState, useEffect } from 'react';
import API from '../api';
import { User, Calendar, Shield, Clock, CreditCard, Award, Mail, Phone, ExternalLink } from 'lucide-react';

const MemberProfile = () => {
  const [member, setMember] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState(null);
  
  // Tabs: 'profile', 'attendance', 'payments'
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setLoading(true);
        const memberRes = await API.get('/members/profile/me');
        const memberData = memberRes.data;
        setMember(memberData);

        const [attendanceRes, paymentsRes] = await Promise.all([
          API.get(`/attendance/member/${memberData._id}`),
          API.get(`/payments/member/${memberData._id}`),
        ]);

        setAttendance(attendanceRes.data);
        setPayments(paymentsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch personal member profile');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, []);

  // Dynamically load Razorpay SDK script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayOnline = async (payment) => {
    setPayingId(payment._id);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert('Razorpay Checkout SDK failed to load. Please verify your connection.');
      setPayingId(null);
      return;
    }

    try {
      // 1. Request Razorpay Order credentials from backend
      const res = await API.post(`/payments/${payment._id}/razorpay-order`);
      const { order_id, amount, currency, key_id } = res.data;

      // 2. Configure Razorpay checkout options
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'IronPulse Fitness Center',
        description: 'Settlement of Gym Membership Invoices',
        order_id: order_id,
        handler: async function (response) {
          try {
            // 3. Verify Razorpay transaction signatures on backend
            await API.post('/payments/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_id: payment._id,
            });

            alert('Payment processed and verified successfully!');
            // Refresh payments invoices statement list
            const refreshRes = await API.get(`/payments/member/${member._id}`);
            setPayments(refreshRes.data);
          } catch (err) {
            console.error('Payment signature check failed:', err);
            alert('Verification failed. If balance was deducted, contact admin with Payment ID: ' + response.razorpay_payment_id);
          }
        },
        prefill: {
          name: member.user_id?.name || '',
          email: member.user_id?.email || '',
          contact: member.user_id?.phone || '',
        },
        theme: {
          color: '#FBAB57', // Accent orange from design theme
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Checkout initiation failed:', err);
      alert(err.response?.data?.message || 'Failed to initiate Razorpay order checkout');
    } finally {
      setPayingId(null);
    }
  };

  if (loading) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading your profile data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white">
          My <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Gym Profile</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          View your membership credentials, check-in history, and payment invoices.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-6 max-w-md">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'profile' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <User size={16} />
          <span>Profile Details</span>
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'attendance' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Clock size={16} />
          <span>Attendance</span>
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'payments' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <CreditCard size={16} />
          <span>Invoices</span>
        </button>
      </div>

      {/* Tab Panels - Card container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-lg">
        
        {/* Tab 1: Profile Details */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/25">
                {member?.user_id?.name ? member.user_id.name.charAt(0) : 'M'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">{member?.user_id?.name}</h3>
                <div className="flex flex-wrap gap-3 items-center mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${
                    member?.status === 'active' 
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
                      : 'text-red-400 bg-red-500/10 border-red-500/30'
                  }`}>
                    {member?.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    Member since {new Date(member?.join_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800/80 pt-6">
              <div className="space-y-4">
                <div>
                  <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</span>
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Mail size={16} className="text-indigo-400" />
                    <span>{member?.user_id?.email}</span>
                  </div>
                </div>
                {member?.user_id?.phone && (
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</span>
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <Phone size={16} className="text-indigo-400" />
                      <span>{member.user_id.phone}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Membership Plan</span>
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Shield size={16} className="text-indigo-400" />
                    <span>{member?.plan_name}</span>
                  </div>
                </div>
                {member?.assigned_trainer_id && (
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Assigned Trainer</span>
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <Award size={16} className="text-indigo-400" />
                      <span>{member.assigned_trainer_id.name}</span>
                    </div>
                  </div>
                )}
                {member?.assigned_dietitian_id && (
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Assigned Dietitian</span>
                    <div className="flex items-center gap-2 text-emerald-300 font-medium">
                      <Award size={16} className="text-emerald-400" />
                      <span>{member.assigned_dietitian_id.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Attendance Logs */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-100 mb-2">Check-in Sessions</h3>
            {attendance.length === 0 ? (
              <div className="text-sm text-slate-500 py-4">No attendance sessions tracked yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attendance.map((log) => {
                  const checkIn = new Date(log.check_in_time);
                  const checkOut = log.check_out_time ? new Date(log.check_out_time) : null;
                  const durationMins = checkOut ? Math.round((checkOut - checkIn) / (1000 * 60)) : null;

                  return (
                    <div key={log._id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-semibold text-slate-200">
                          {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider border ${
                          checkOut 
                            ? 'text-slate-500 bg-slate-500/10 border-slate-500/20' 
                            : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        }`}>
                          {checkOut ? 'Completed' : 'Active'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-400 space-y-1">
                        <div>Check In: {checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div>Check Out: {checkOut ? checkOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                      </div>

                      {durationMins !== null && (
                        <div className="text-xs font-semibold text-indigo-400 mt-1">
                          Duration: {durationMins} mins
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Payment Statements */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-100 mb-2">Billing Invoices</h3>
            {payments.length === 0 ? (
              <div className="text-sm text-slate-500 py-4">No billing statements available.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {payments.map((p) => (
                  <div key={p._id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Amount Due</div>
                        <div className="text-lg font-extrabold text-slate-200">₹{p.amount}</div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider border ${
                        p.status === 'paid' 
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                          : 'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1 border-t border-slate-900 pt-3 flex flex-col gap-1">
                      <div>Due Date: {new Date(p.due_date).toLocaleDateString()}</div>
                      <div>Payment Date: {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '—'}</div>
                      <div className="capitalize">Method: {p.payment_method}</div>
                      
                      {p.status !== 'paid' && (
                        <button
                          onClick={() => handlePayOnline(p)}
                          disabled={payingId === p._id}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 uppercase transition-colors border border-indigo-500/30 px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 mt-3 w-full cursor-pointer disabled:opacity-50"
                        >
                          <ExternalLink size={12} />
                          <span>{payingId === p._id ? 'Opening Checkout...' : 'Pay Online'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default MemberProfile;
