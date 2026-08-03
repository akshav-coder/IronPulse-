import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, LogOut, LayoutDashboard, User, Users, CreditCard, Shield, Calendar, Award, Apple, DollarSign, MessageCircle, MessageSquare, Upload, Scale, Activity } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
    ${isActive(path) 
      ? 'bg-indigo-600 text-white' 
      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}
  `;

  const renderRoleLinks = () => {
    if (!user) return null;

    if (user.role === 'owner') {
      return (
        <nav className="flex flex-col gap-2 mt-2">
          <Link to="/owner-dashboard" className={linkClass('/owner-dashboard')}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/owner/members" className={linkClass('/owner/members')}>
            <Users size={18} />
            <span>Members Directory</span>
          </Link>
          <Link to="/owner/import" className={linkClass('/owner/import')}>
            <Upload size={18} />
            <span>Bulk CSV Import</span>
          </Link>
          <Link to="/owner/staff" className={linkClass('/owner/staff')}>
            <Shield size={18} />
            <span>Staff Directory</span>
          </Link>
          <Link to="/owner/payments" className={linkClass('/owner/payments')}>
            <CreditCard size={18} />
            <span>Billing Ledger</span>
          </Link>
          <Link to="/owner/revenue" className={linkClass('/owner/revenue')}>
            <DollarSign size={18} />
            <span>Revenue Ledger</span>
          </Link>
          <Link to="/feed" className={linkClass('/feed')}>
            <MessageSquare size={18} />
            <span>Community Feed</span>
          </Link>
        </nav>
      );
    }

    if (user.role === 'trainer') {
      return (
        <nav className="flex flex-col gap-2 mt-2">
          <Link to="/trainer-dashboard" className={linkClass('/trainer-dashboard')}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/trainer/members" className={linkClass('/trainer/members')}>
            <Users size={18} />
            <span>My Clients</span>
          </Link>
          <Link to="/trainer/workout-plans" className={linkClass('/trainer/workout-plans')}>
            <Dumbbell size={18} />
            <span>Workout Plans</span>
          </Link>
          <Link to="/trainer/diet-plans" className={linkClass('/trainer/diet-plans')}>
            <Apple size={18} />
            <span>Diet Plans</span>
          </Link>
          <Link to="/progress" className={linkClass('/progress')}>
            <Scale size={18} />
            <span>Progress Log</span>
          </Link>
          <Link to="/chat" className={linkClass('/chat')}>
            <MessageCircle size={18} />
            <span>Messenger</span>
          </Link>
          <Link to="/feed" className={linkClass('/feed')}>
            <MessageSquare size={18} />
            <span>Community Feed</span>
          </Link>
        </nav>
      );
    }

    // Member links
    return (
      <nav className="flex flex-col gap-2 mt-2">
        <Link to="/" className={linkClass('/')}>
          <LayoutDashboard size={18} />
          <span>My Dashboard</span>
        </Link>
        <Link to="/workouts" className={linkClass('/workouts')}>
          <Activity size={18} />
          <span>Workout Tracker</span>
        </Link>
        <Link to="/workout-plan" className={linkClass('/workout-plan')}>
          <Dumbbell size={18} />
          <span>My Workout Plan</span>
        </Link>
        <Link to="/diet-tracker" className={linkClass('/diet-tracker')}>
          <Apple size={18} />
          <span>Diet Tracker</span>
        </Link>
        <Link to="/diet-plan" className={linkClass('/diet-plan')}>
          <Calendar size={18} />
          <span>My Diet Plan</span>
        </Link>
        <Link to="/progress" className={linkClass('/progress')}>
          <Scale size={18} />
          <span>My Progress</span>
        </Link>
        <Link to="/chat" className={linkClass('/chat')}>
          <MessageCircle size={18} />
          <span>Messenger</span>
        </Link>
        <Link to="/feed" className={linkClass('/feed')}>
          <MessageSquare size={18} />
          <span>Community Feed</span>
        </Link>
        <Link to="/profile" className={linkClass('/profile')}>
          <User size={18} />
          <span>My Profile</span>
        </Link>
      </nav>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen fixed top-0 left-0 p-4 z-40">
      {/* Pinned Logo (Does not scroll) */}
      <div className="flex items-center gap-2 px-3 py-4 border-b border-slate-800/80 flex-shrink-0">
        <Dumbbell size={24} className="text-indigo-500" />
        <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          PULSE
        </span>
      </div>

      {/* Scrollable Navigation Items */}
      <div className="flex-grow overflow-y-auto my-4 pr-1 sidebar-scroll">
        {renderRoleLinks()}
      </div>

      {/* Pinned Footer (Profile photo, name, and logout icon in a row) */}
      <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between gap-3 flex-shrink-0 w-full">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-sm text-white flex-shrink-0 shadow-md">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-semibold text-xs text-slate-200 truncate" title={user?.name}>
              {user?.name}
            </h4>
            <span className="text-[10px] text-slate-500 capitalize block truncate">
              {user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200 flex-shrink-0 cursor-pointer"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
