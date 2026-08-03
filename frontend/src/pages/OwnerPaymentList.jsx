import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Search, PlusCircle, CheckCircle } from 'lucide-react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/dark.css';

const OwnerPaymentList = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Payment form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [method, setMethod] = useState('cash');
  const [submitting, setSubmitting] = useState(false);

  const gymId = user?.gym_id;

  const fetchData = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const [paymentsRes, membersRes] = await Promise.all([
        API.get(`/payments/gym/${gymId}`),
        API.get(`/members/gym/${gymId}`),
      ]);
      setPayments(paymentsRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payment ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gymId]);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!memberId || !amount || !dueDate) {
      alert('Please fill out all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/payments', {
        member_id: memberId,
        amount: Number(amount),
        due_date: dueDate,
        status,
        payment_method: method,
      });

      setMemberId('');
      setAmount('');
      setDueDate('');
      setStatus('pending');
      setMethod('cash');
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (paymentId) => {
    try {
      await API.put(`/payments/${paymentId}/status`, {
        status: 'paid',
        payment_date: new Date(),
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update invoice status');
    }
  };

  const filteredPayments = payments.filter((p) =>
    (p.member_id?.user_id?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && payments.length === 0) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading billing ledger...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white">
            Payment <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Ledger</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Audit dues, issue gym invoices, and update billing transaction logs.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Search member name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200">
            <PlusCircle size={16} />
            <span>Add Invoice</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Add Payment Form */}
      {showAddForm && (
        <form onSubmit={handleAddPayment} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg mb-8 max-w-2xl">
          <h3 className="text-base font-bold text-slate-100 mb-4">Log Gym Invoice / Payment</h3>
          
          <div className="form-group mb-4">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Gym Member</label>
            <select
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.user_id?.name} ({m.user_id?.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Billing Amount (₹)</label>
              <input
                type="number"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="50"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
              <Flatpickr
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                value={dueDate}
                onChange={([date]) => setDueDate(date ? date.toISOString().split('T')[0] : '')}
                options={{ dateFormat: 'Y-m-d', disableMobile: true }}
                placeholder="Select due date"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Invoice Status</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment Method</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI Account</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 disabled:opacity-50">
              {submitting ? 'Logging...' : 'Issue Invoice'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Ledger Table (Owner dashboard/views are table-based) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        {filteredPayments.length === 0 ? (
          <div className="text-sm text-slate-500 py-8 text-center">No recorded transactions found in ledger.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Pay Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="border-b border-slate-950 hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-200">{p.member_id?.user_id?.name || 'Unknown Member'}</div>
                      <div className="text-xs text-slate-500">{p.member_id?.user_id?.email}</div>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-200">₹{p.amount}</td>
                    <td className="py-4 px-4 text-slate-400">{new Date(p.due_date).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-slate-500">
                      {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 px-4 uppercase text-xs text-slate-500">{p.payment_method}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                        p.status === 'paid' 
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                          : 'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {p.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(p._id)}
                          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-2.5 py-1 rounded text-xs transition-colors"
                          title="Record payment"
                        >
                          <CheckCircle size={12} />
                          <span>Paid</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerPaymentList;
