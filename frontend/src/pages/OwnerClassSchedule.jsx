import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Edit2, Trash2, Calendar, Search, X } from 'lucide-react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/dark.css';

const OwnerClassSchedule = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Class form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [className, setClassName] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit class state
  const [editingId, setEditingId] = useState(null);
  const [editClassName, setEditClassName] = useState('');
  const [editTrainerId, setEditTrainerId] = useState('');
  const [editScheduleTime, setEditScheduleTime] = useState('');
  const [editCapacity, setEditCapacity] = useState('');

  const gymId = user?.gym_id;

  const fetchData = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const [classesRes, trainersRes] = await Promise.all([
        API.get(`/classes/gym/${gymId}`),
        API.get(`/staff/gym/${gymId}`),
      ]);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
      setTrainers(Array.isArray(trainersRes.data) ? trainersRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch schedule logs');
      setClasses([]);
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gymId]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!className || !trainerId || !scheduleTime || !capacity) {
      alert('Please fill out all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/classes', {
        class_name: className,
        trainer_id: trainerId,
        schedule_time: scheduleTime,
        capacity: Number(capacity),
      });

      setClassName('');
      setTrainerId('');
      setScheduleTime('');
      setCapacity('');
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule class session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateClass = async (id) => {
    if (!editClassName || !editTrainerId || !editScheduleTime || !editCapacity) {
      alert('Please fill out all required fields');
      return;
    }

    try {
      await API.put(`/classes/${id}`, {
        class_name: editClassName,
        trainer_id: editTrainerId,
        schedule_time: editScheduleTime,
        capacity: Number(editCapacity),
      });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update scheduled class details');
    }
  };

  const handleDeleteClass = async (id, name) => {
    if (window.confirm(`Are you sure you want to cancel and delete class "${name}"?`)) {
      try {
        await API.delete(`/classes/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete class');
      }
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setEditClassName(c.class_name);
    setEditTrainerId(c.trainer_id?._id || '');
    
    // Format ISO date string to datetime-local input format (YYYY-MM-DDThh:mm)
    const d = new Date(c.schedule_time);
    const tzoffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
    setEditScheduleTime(localISOTime);
    
    setEditCapacity(c.capacity);
  };

  const filteredClasses = Array.isArray(classes)
    ? classes.filter((c) =>
        (c.class_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.trainer_id?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading && classes.length === 0) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading schedule ledger...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white">
            Class <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Schedule</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Schedule new workouts, assign trainers, and track session capacities.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Search classes or coaches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200">
            <PlusCircle size={16} />
            <span>Schedule Class</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Add Class Form Card */}
      {showAddForm && (
        <form onSubmit={handleCreateClass} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg mb-8 max-w-2xl">
          <h3 className="text-base font-bold text-slate-100 mb-4">Schedule Fitness Session</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Class Name</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g., CrossFit Circuit, Hatha Yoga"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Assign Trainer</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                value={trainerId}
                onChange={(e) => setTrainerId(e.target.value)}
                required
              >
                <option value="">-- Select Trainer --</option>
                {trainers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Schedule Date & Time</label>
              <Flatpickr
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                value={scheduleTime}
                onChange={([date]) => setScheduleTime(date ? date.toISOString().slice(0, 16) : '')}
                options={{ enableTime: true, dateFormat: 'Y-m-d H:i', time_24hr: true, disableMobile: true }}
                placeholder="Select date and time"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Max Capacity</label>
              <input
                type="number"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="20"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 disabled:opacity-50">
              {submitting ? 'Scheduling...' : 'Schedule Class'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Schedule Table (Owner views are table-based) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        {filteredClasses.length === 0 ? (
          <div className="text-sm text-slate-500 py-8 text-center">No classes scheduled.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Class Session</th>
                  <th className="py-3 px-4">Assigned Trainer</th>
                  <th className="py-3 px-4">Scheduled Date & Time</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((c) => (
                  <tr key={c._id} className="border-b border-slate-950 hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-200">
                      {editingId === c._id ? (
                        <input
                          type="text"
                          className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 text-xs w-48 focus:outline-none focus:border-indigo-500"
                          value={editClassName}
                          onChange={(e) => setEditClassName(e.target.value)}
                        />
                      ) : (
                        <span>{c.class_name}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      {editingId === c._id ? (
                        <select
                          className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                          value={editTrainerId}
                          onChange={(e) => setEditTrainerId(e.target.value)}
                        >
                          <option value="">-- Select Trainer --</option>
                          {trainers.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>{c.trainer_id?.name || 'Unassigned'}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      {editingId === c._id ? (
                        <Flatpickr
                          className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                          value={editScheduleTime}
                          onChange={([date]) => setEditScheduleTime(date ? date.toISOString().slice(0, 16) : '')}
                          options={{ enableTime: true, dateFormat: 'Y-m-d H:i', time_24hr: true, disableMobile: true }}
                          placeholder="Select date and time"
                        />
                      ) : (
                        <span>
                          {new Date(c.schedule_time).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          at{' '}
                          {new Date(c.schedule_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      {editingId === c._id ? (
                        <input
                          type="number"
                          className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 text-xs w-20 focus:outline-none focus:border-indigo-500"
                          value={editCapacity}
                          onChange={(e) => setEditCapacity(e.target.value)}
                          min="1"
                        />
                      ) : (
                        <span>{c.capacity} members</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {editingId === c._id ? (
                          <>
                            <button
                              onClick={() => handleUpdateClass(c._id)}
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
                              onClick={() => startEdit(c)}
                              className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                              title="Edit Class Details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteClass(c._id, c.class_name)}
                              className="p-1.5 rounded-lg bg-slate-850 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                              title="Cancel Session"
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

export default OwnerClassSchedule;
