import React, { useState, useEffect } from 'react';
import API from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, AlertCircle, Calendar, CreditCard, Layers } from 'lucide-react';

const OwnerRevenueReport = () => {
  const [revenueData, setRevenueData] = useState({
    monthlyRevenue: [],
    methodRevenue: [],
    pendingTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRevenueReport = async () => {
      try {
        setLoading(true);
        const res = await API.get('/dashboard/owner-revenue/report');
        setRevenueData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load revenue statements');
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueReport();
  }, []);

  // Calculate cumulative paid revenue
  const totalPaidRevenue = revenueData.monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0);

  if (loading) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading financial statements...</div>
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

  // Custom tooltips matching dark theme colors
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl text-xs">
          <p className="font-bold text-slate-300 mb-1">{`Month: ${label}`}</p>
          <p className="font-extrabold text-indigo-400">{`Revenue: ₹${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">
          Revenue <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Ledger & Reports</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Monitor your facility monthly incomes, billing methods breakdown, and outstanding arrears.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
            <IndianRupee size={22} />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Gross Incomes Paid</span>
            <span className="text-2xl font-black text-slate-100">₹{totalPaidRevenue.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-red-600/10 text-red-400 border border-red-500/20 rounded-lg">
            <AlertCircle size={22} />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Outstanding Dues</span>
            <span className="text-2xl font-black text-slate-100">₹{revenueData.pendingTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg">
            <Layers size={22} />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Audited Transactions</span>
            <span className="text-2xl font-black text-slate-100">{revenueData.monthlyRevenue.length} Months</span>
          </div>
        </div>
      </div>

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Bar Chart (takes 2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={16} className="text-indigo-400" />
              Monthly Incomes Trend
            </h3>
          </div>

          <div className="w-full h-80">
            {revenueData.monthlyRevenue.length === 0 ? (
              <div className="h-full flex-center text-xs text-slate-500">No monthly metrics compiled.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" vertical={false} />
                  <XAxis dataKey="month" stroke="#8c8c8c" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8c8c8c" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#333333', opacity: 0.4 }} />
                  <Bar dataKey="revenue" fill="#FBAB57" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Payment Methods Split */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={16} className="text-indigo-400" />
              Payment Channels Split
            </h3>
          </div>

          {revenueData.methodRevenue.length === 0 ? (
            <div className="flex-grow flex-center text-xs text-slate-500">No payment channels audited.</div>
          ) : (
            <div className="flex-grow flex flex-col justify-center divide-y divide-slate-850">
              {revenueData.methodRevenue.map((item) => (
                <div key={item.method} className="py-3.5 flex justify-between items-center text-sm">
                  <span className="capitalize font-semibold text-slate-400">{item.method.replace('_', ' ')}</span>
                  <span className="font-extrabold text-slate-200">₹{item.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Audit Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Layers size={16} className="text-indigo-400" />
          Financial Statement Logs
        </h3>

        {revenueData.monthlyRevenue.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-8">No billing records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Billing Period</th>
                  <th className="py-3 px-4">Transactions status</th>
                  <th className="py-3 px-4 text-right">Settled Revenue</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.monthlyRevenue.map((item) => (
                  <tr key={item.month} className="border-b border-slate-850 hover:bg-slate-800/10 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-300">{item.month}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                        AUDITED
                      </span>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-100 text-right">₹{item.revenue.toLocaleString()}</td>
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

export default OwnerRevenueReport;
