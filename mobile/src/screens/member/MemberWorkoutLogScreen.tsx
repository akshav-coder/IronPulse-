import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const MemberWorkoutLogScreen = ({ navigation }: any) => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [load, setLoad] = useState('');
  const [reps, setReps] = useState('');
  const [duration, setDuration] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLoad, setEditLoad] = useState('');
  const [editReps, setEditReps] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchWorkouts = useCallback(async () => {
    try {
      const res = await client.get('/workouts');
      setWorkouts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching workouts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  };

  const handleLogWorkout = async () => {
    if (!title.trim() || !load || !reps || !duration) {
      Alert.alert('Missing info', 'Please fill in exercise name, load, reps, and duration.');
      return;
    }
    setSubmitting(true);
    try {
      await client.post('/workouts', {
        title: title.trim(),
        load: Number(load),
        reps: Number(reps),
        duration: Number(duration),
      });
      setTitle('');
      setLoad('');
      setReps('');
      setDuration('');
      fetchWorkouts();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to log workout');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (workout: any) => {
    setEditingId(workout._id);
    setEditTitle(workout.title);
    setEditLoad(String(workout.load));
    setEditReps(String(workout.reps));
    setEditDuration(String(workout.duration));
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    if (!editTitle.trim() || !editLoad || !editReps || !editDuration) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }
    setSavingEdit(true);
    try {
      const res = await client.put(`/workouts/${id}`, {
        title: editTitle.trim(),
        load: Number(editLoad),
        reps: Number(editReps),
        duration: Number(editDuration),
      });
      setWorkouts((prev) => prev.map((w) => (w._id === id ? res.data : w)));
      setEditingId(null);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update workout');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete workout?', `"${title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await client.delete(`/workouts/${id}`);
            setWorkouts((prev) => prev.filter((w) => w._id !== id));
          } catch (err) {
            console.error('Error deleting workout:', err);
          }
        },
      },
    ]);
  };

  const totals = workouts.reduce(
    (acc, w) => ({
      sessions: acc.sessions + 1,
      volume: acc.volume + (w.load || 0) * (w.reps || 0),
      duration: acc.duration + (w.duration || 0),
    }),
    { sessions: 0, volume: 0, duration: 0 }
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        {navigation?.goBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-2">
            <Text className="text-indigo-600 font-bold text-sm">← Back</Text>
          </TouchableOpacity>
        )}
        <Text className="text-2xl font-black text-[#1F2937]">Log a Workout</Text>
        <Text className="text-xs text-slate-500 mt-0.5">Track exercise sessions and lifetime totals</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
      >
        {/* Log Workout Form */}
        <View className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm mb-4">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">New Entry</Text>

          <TextInput
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm mb-3"
            placeholder="Exercise name (e.g. Bench Press)"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />

          <View className="flex-row gap-3 mb-3">
            <TextInput
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm"
              placeholder="Load (kg)"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={load}
              onChangeText={setLoad}
            />
            <TextInput
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm"
              placeholder="Reps"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={reps}
              onChangeText={setReps}
            />
          </View>

          <TextInput
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm mb-4"
            placeholder="Duration (mins)"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />

          <TouchableOpacity
            onPress={handleLogWorkout}
            disabled={submitting}
            className="bg-indigo-600 rounded-2xl py-3.5 items-center active:bg-indigo-700"
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-bold text-sm">Log Workout</Text>}
          </TouchableOpacity>
        </View>

        {/* Totals */}
        <View className="bg-indigo-600 rounded-3xl p-5 mb-4 shadow-md shadow-indigo-600/20">
          <Text className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Lifetime Totals</Text>
          <View className="flex-row justify-between items-center mt-3">
            <View className="items-center">
              <Text className="text-white text-xl font-black">{totals.sessions}</Text>
              <Text className="text-indigo-100 text-[10px] uppercase font-bold mt-0.5">Sessions</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-black">{totals.volume.toLocaleString()}</Text>
              <Text className="text-indigo-100 text-[10px] uppercase font-bold mt-0.5">kg Volume</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-black">{totals.duration}</Text>
              <Text className="text-indigo-100 text-[10px] uppercase font-bold mt-0.5">Minutes</Text>
            </View>
          </View>
        </View>

        {/* Workout List */}
        {loading ? (
          <View className="py-16 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : workouts.length === 0 ? (
          <View className="bg-white border border-slate-200 rounded-3xl p-8 items-center shadow-sm">
            <Text className="text-slate-400 text-xs text-center">No workouts logged yet. Use the form above to log your first session.</Text>
          </View>
        ) : (
          <View className="space-y-2.5">
            {workouts.map((w) => {
              const isEditing = editingId === w._id;
              return (
                <View key={w._id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  {isEditing ? (
                    <View>
                      <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm mb-2"
                        value={editTitle}
                        onChangeText={setEditTitle}
                        placeholder="Exercise name"
                      />
                      <View className="flex-row gap-2 mb-2">
                        <TextInput
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm"
                          value={editLoad}
                          onChangeText={setEditLoad}
                          keyboardType="numeric"
                          placeholder="Load"
                        />
                        <TextInput
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm"
                          value={editReps}
                          onChangeText={setEditReps}
                          keyboardType="numeric"
                          placeholder="Reps"
                        />
                        <TextInput
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm"
                          value={editDuration}
                          onChangeText={setEditDuration}
                          keyboardType="numeric"
                          placeholder="Mins"
                        />
                      </View>
                      <View className="flex-row justify-end gap-2">
                        <TouchableOpacity onPress={cancelEdit} className="px-3 py-1.5 rounded-lg bg-slate-100">
                          <Text className="text-slate-600 text-xs font-bold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => saveEdit(w._id)}
                          disabled={savingEdit}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600"
                        >
                          <Text className="text-white text-xs font-bold">{savingEdit ? 'Saving...' : 'Save'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1 pr-2">
                        <View className="flex-row items-center">
                          <Text className="font-extrabold text-slate-800 text-sm mr-1.5">{w.title}</Text>
                          {w.plan_id ? (
                            <View className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full">
                              <Text className="text-indigo-700 text-[8px] font-bold uppercase">From Plan</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text className="text-slate-400 text-[10px] mt-1">
                          🏋️ {w.load} kg · 🔁 {w.reps} reps · ⏱ {w.duration} mins · {formatTimeAgo(w.createdAt)}
                        </Text>
                      </View>
                      <View className="flex-row">
                        <TouchableOpacity onPress={() => startEdit(w)} className="p-2">
                          <Text className="text-slate-400 text-xs font-bold">Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(w._id, w.title)} className="p-2">
                          <Text className="text-rose-500 text-xs font-bold">Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MemberWorkoutLogScreen;
