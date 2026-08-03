import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, Sparkles, CheckSquare, Trash } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (Array.isArray(res.data)) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside to close dropdown popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      // Update state locally
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHr > 0) return `${diffHr}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
  };

  return (
    <header className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex justify-between items-center z-30 w-full">
      {/* Brand Workspace Title */}
      <div>
        <h1 className="text-sm font-semibold tracking-wider text-slate-400 capitalize">
          {user?.role} Workspace
        </h1>
      </div>

      {/* Profile & Notifications */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {/* Notification Bell */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors bg-slate-900 border border-slate-800 rounded-lg"
          aria-label="Toggle notifications dropdown"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-extrabold flex items-center justify-center rounded-full animate-pulse border border-slate-950">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Popover Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[480px]">
            {/* Dropdown Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-xs text-slate-100 uppercase tracking-wider">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase transition-colors"
                >
                  <CheckSquare size={12} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-grow divide-y divide-slate-850">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No notifications to show.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 flex gap-3 transition-colors ${
                      n.is_read ? 'bg-slate-900/10' : 'bg-slate-850/30'
                    }`}
                  >
                    {/* Read/Unread Dot indicator */}
                    <div className="mt-1">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          n.is_read ? 'bg-slate-700/60' : 'bg-indigo-500 animate-pulse'
                        }`}
                      />
                    </div>

                    <div className="flex-grow space-y-1.5">
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {n.message}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500">
                          {getRelativeTime(n.created_date || n.createdAt)}
                        </span>
                        {!n.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(n._id)}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 uppercase transition-colors"
                            title="Mark as Read"
                          >
                            <Check size={11} />
                            <span>Mark read</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
