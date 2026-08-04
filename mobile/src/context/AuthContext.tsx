import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';

export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  gym_id: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const userInfoStr = await SecureStore.getItemAsync('userInfo');
        if (userInfoStr) {
          const parsedUser = JSON.parse(userInfoStr) as User;
          const normalizedUser = parsedUser ? { ...parsedUser, id: parsedUser.id || parsedUser._id, _id: parsedUser._id || parsedUser.id } : null;
          setUser(normalizedUser);
        }
      } catch (e) {
        console.error('Failed to restore user session:', e);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.post('/users/login', { email, password });
      const data = response.data;
      const normalizedUser = data ? { ...data, id: data.id || data._id, _id: data._id || data.id } : null;
      
      setUser(normalizedUser);
      if (normalizedUser) {
        await SecureStore.setItemAsync('userInfo', JSON.stringify(normalizedUser));
        if (normalizedUser.token) {
          await SecureStore.setItemAsync('userToken', normalizedUser.token);
        }
      }
      return normalizedUser;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      // Signups default to general member, linking the backend dummy gym ID
      const dummyGymId = '66810a6bb8c4d284724b01ab';
      const response = await client.post('/users/register', {
        name,
        email,
        password,
        gym_id: dummyGymId,
        phone: phone || '',
      });
      const data = response.data;
      const normalizedUser = data ? { ...data, id: data.id || data._id, _id: data._id || data.id } : null;

      setUser(normalizedUser);
      if (normalizedUser) {
        await SecureStore.setItemAsync('userInfo', JSON.stringify(normalizedUser));
        if (normalizedUser.token) {
          await SecureStore.setItemAsync('userToken', normalizedUser.token);
        }
      }
      return normalizedUser;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await SecureStore.deleteItemAsync('userInfo');
      await SecureStore.deleteItemAsync('userToken');
      setUser(null);
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setLoading(false);
    }
  };

  const role = user ? user.role : null;

  return (
    <AuthContext.Provider value={{ user, role, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
