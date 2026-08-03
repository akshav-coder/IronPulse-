import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [memberStatus, setMemberStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMemberStatus = async (currentUser) => {
    if (currentUser && currentUser.role === 'member') {
      try {
        const res = await API.get('/members/profile/me');
        setMemberStatus(res.data.status);
      } catch (err) {
        console.error('Failed to fetch member status:', err);
        setMemberStatus(null);
      }
    } else {
      setMemberStatus(null);
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      const normalizedUser = parsedUser ? { ...parsedUser, id: parsedUser.id || parsedUser._id, _id: parsedUser._id || parsedUser.id } : null;
      setUser(normalizedUser);
      fetchMemberStatus(normalizedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.post('/users/login', { email, password });
      const normalizedUser = data ? { ...data, id: data.id || data._id, _id: data._id || data.id } : null;
      setUser(normalizedUser);
      localStorage.setItem('userInfo', JSON.stringify(normalizedUser));
      await fetchMemberStatus(normalizedUser);
      setLoading(false);
      return normalizedUser;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password, gymId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.post('/users/register', { name, email, password, gym_id: gymId });
      const normalizedUser = data ? { ...data, id: data.id || data._id, _id: data._id || data.id } : null;
      setUser(normalizedUser);
      localStorage.setItem('userInfo', JSON.stringify(normalizedUser));
      await fetchMemberStatus(normalizedUser);
      setLoading(false);
      return normalizedUser;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    setMemberStatus(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        memberStatus,
        setMemberStatus,
        loading,
        error,
        login,
        register,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
