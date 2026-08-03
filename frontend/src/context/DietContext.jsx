import React, { createContext, useState, useContext } from 'react';
import API from '../api';

const DietContext = createContext();

export const DietProvider = ({ children }) => {
  const [dietLogs, setDietLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDietLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get('/diet-logs');
      setDietLogs(data);
      setLoading(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch diet logs';
      setError(errMsg);
      setLoading(false);
    }
  };

  const createDietLog = async (logData) => {
    setError(null);
    try {
      const { data } = await API.post('/diet-logs', logData);
      setDietLogs((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to create diet log';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const deleteDietLog = async (id) => {
    setError(null);
    try {
      await API.delete(`/diet-logs/${id}`);
      setDietLogs((prev) => prev.filter((log) => log._id !== id));
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete diet log';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  return (
    <DietContext.Provider
      value={{
        dietLogs,
        loading,
        error,
        fetchDietLogs,
        createDietLog,
        deleteDietLog,
        setError,
      }}
    >
      {children}
    </DietContext.Provider>
  );
};

export const useDiet = () => useContext(DietContext);
export default DietContext;
