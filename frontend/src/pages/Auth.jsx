import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, AlertTriangle, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const { user, login, register, error, setError } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError(null);
  }, [activeTab, setError]);

  useEffect(() => {
    if (user) {
      if (user.role === 'owner') {
        navigate('/owner-dashboard');
      } else if (user.role === 'trainer') {
        navigate('/trainer-dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || (activeTab === 'signup' && !name)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let loggedUser;
      if (activeTab === 'login') {
        loggedUser = await login(email, password);
      } else {
        // Signups will register as general member by default, linking a dummy/blank gymId 
        // which can be assigned by owners. In production this would select gym.
        loggedUser = await register(name, email, password, '66810a6bb8c4d284724b01ab'); // dummy gym ID
      }
      
      if (loggedUser && loggedUser.role === 'owner') {
        navigate('/owner-dashboard');
      } else if (loggedUser && loggedUser.role === 'trainer') {
        navigate('/trainer-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      // Handled by Context setError
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3">
            <Dumbbell size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide">
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">IRON PULSE</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Build strength. Track progress. Achieve goals.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeTab === 'login' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeTab === 'signup' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-5">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={activeTab === 'signup'}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 pr-10 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-6 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? (
              <span>Processing...</span>
            ) : activeTab === 'login' ? (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;