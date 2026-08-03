import React, { createContext, useState, useContext } from 'react';
import API from '../api';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkouts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get('/workouts');
      setWorkouts(data);
      setLoading(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch workouts';
      setError(errMsg);
      setLoading(false);
    }
  };

  const createWorkout = async (workoutData) => {
    setError(null);
    try {
      const { data } = await API.post('/workouts', workoutData);
      setWorkouts((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to create workout';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const updateWorkout = async (id, workoutData) => {
    setError(null);
    try {
      const { data } = await API.put(`/workouts/${id}`, workoutData);
      setWorkouts((prev) =>
        prev.map((workout) => (workout._id === id ? data : workout))
      );
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update workout';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const deleteWorkout = async (id) => {
    setError(null);
    try {
      await API.delete(`/workouts/${id}`);
      setWorkouts((prev) => prev.filter((workout) => workout._id !== id));
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete workout';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        loading,
        error,
        fetchWorkouts,
        createWorkout,
        updateWorkout,
        deleteWorkout,
        setError,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkouts = () => useContext(WorkoutContext);
export default WorkoutContext;
