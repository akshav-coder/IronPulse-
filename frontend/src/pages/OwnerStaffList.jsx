import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Edit2, Trash2, Search, X } from 'lucide-react';

const OwnerStaffList = () => {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Trainer form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('trainer123'); // Default password
  const [submitting, setSubmitting] = useState(false);

  // Edit trainer state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const gymId = user?.gym_id;

  const fetchTrainers = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const res = await API.get(`/staff/gym/${gymId}`);
      console.log('Trainers API response payload:', res.data);
      setTrainers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Trainers API fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch trainers list');
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gymId]);

  const handleCreateTrainer = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Name, Email, and Password are required');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/staff', {
        name,
        email,
        phone,
        password,
      });

      setName('');
      setEmail('');
      setPhone('');
      setPassword('trainer123');
      setShowAddForm(false);
      fetchTrainers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add trainer profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTrainer = async (id) => {
    if (!editName || !editEmail) {
      alert('Name and Email are required');
      return;
    }

    try {
      await API.put(`/staff/${id}`, {
        name: editName,
        email: editEmail,
        phone: editPhone,
      });
      setEditingId(null);
      fetchTrainers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save modifications');
    }
  };

  const handleDeleteTrainer = async (id, trainerName) => {
    if (window.confirm(`Are you sure you want to delete trainer "${trainerName}"? This removes login credentials and unassigns them from all members.`)) {
      try {
        await API.delete(`/staff/${id}`);
        fetchTrainers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete trainer');
      }
    }
  };

  const startEdit = (trainer) => {
    setEditingId(trainer._id);
    setEditName(trainer.name);
    setEditEmail(trainer.email);
    setEditPhone(trainer.phone || '');
  };

  const filteredTrainers = Array.isArray(trainers)
    ? trainers.filter((t) =>
        (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading && trainers.length === 0) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading staff directory...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white">
            Staff <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Directory</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Register and manage your gym trainers and coaches.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200">
            <PlusCircle size={16} />
            <span>Add Trainer</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Add Trainer Form Card */}
      {showAddForm && (
        <form onSubmit={handleCreateTrainer} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg mb-8 max-w-2xl">
          <h3 className="text-base font-bold text-slate-100 mb-4">Register Trainer</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Trainer Name</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Diana Prince"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="diana@pulse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="555-019-2831"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 disabled:opacity-50">
              {submitting ? 'Registering...' : 'Register Trainer'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Staff Table Card (Owner views are table-based) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        {filteredTrainers.length === 0 ? (
          <div className="text-sm text-slate-500 py-8 text-center">No trainers registered in your gym.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Trainer Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrainers.map((trainer) => (
                  <tr key={trainer._id} className="border-b border-slate-950 hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-200">
                      {editingId === trainer._id ? (
                        <input
                          type="text"
                          className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 text-xs w-40 focus:outline-none focus:border-indigo-500"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      ) : (
                        <span>{trainer.name}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      {editingId === trainer._id ? (
                        <input
                          type="email"
                          className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 text-xs w-52 focus:outline-none focus:border-indigo-500"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                        />
                      ) : (
                        <span>{trainer.email}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      {editingId === trainer._id ? (
                        <input
                          type="text"
                          className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 text-xs w-36 focus:outline-none focus:border-indigo-500"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                        />
                      ) : (
                        <span>{trainer.phone || '—'}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {editingId === trainer._id ? (
                          <>
                            <button
                              onClick={() => handleUpdateTrainer(trainer._id)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-2.5 py-1 rounded text-xs transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-medium px-2.5 py-1 rounded text-xs transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(trainer)}
                              className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                              title="Edit Trainer Details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteTrainer(trainer._id, trainer.name)}
                              className="p-1.5 rounded-lg bg-slate-850 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                              title="Delete trainer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
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

export default OwnerStaffList;
