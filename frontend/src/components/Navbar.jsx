import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, LogOut, LayoutDashboard, History, User, Users, CreditCard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const renderRoleLinks = () => {
    if (!user) return null;

    if (user.role === 'owner') {
      return (
        <>
          <Link
            to="/owner-dashboard"
            className={`nav-link ${isActive('/owner-dashboard') ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/owner/members"
            className={`nav-link ${isActive('/owner/members') ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>Members</span>
          </Link>
          <Link
            to="/owner/payments"
            className={`nav-link ${isActive('/owner/payments') ? 'active' : ''}`}
          >
            <CreditCard size={18} />
            <span>Payments</span>
          </Link>
        </>
      );
    }

    if (user.role === 'trainer') {
      return (
        <>
          <Link
            to="/trainer-dashboard"
            className={`nav-link ${isActive('/trainer-dashboard') ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/trainer/members"
            className={`nav-link ${isActive('/trainer/members') ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>My Clients</span>
          </Link>
        </>
      );
    }

    // Default 'member' links
    return (
      <>
        <Link
          to="/"
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/workouts"
          className={`nav-link ${isActive('/workouts') ? 'active' : ''}`}
        >
          <History size={18} />
          <span>Workouts</span>
        </Link>
        <Link
          to="/profile"
          className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
        >
          <User size={18} />
          <span>My Profile</span>
        </Link>
      </>
    );
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <Dumbbell size={28} style={{ stroke: 'url(#logo-grad)' }} />
          <span>IRON PULSE</span>
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </svg>
        </Link>

        {user ? (
          <nav className="nav-links">
            {renderRoleLinks()}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginLeft: '1rem',
                paddingLeft: '1rem',
                borderLeft: '1px solid var(--border-color)',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  fontWeight: 500,
                }}
              >
                <User size={16} className="text-gradient" />
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                title="Logout"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        ) : (
          <nav className="nav-links">
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Get Started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
