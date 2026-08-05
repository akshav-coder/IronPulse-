import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';

const MemberMealLogScreen = ({ navigation }: any) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      const res = await client.get('/diet-logs');
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching diet logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const handleLogMeal = async () => {
    if (!title.trim() || !calories) {
      Alert.alert('Missing info', 'Please enter a meal name and calories.');
      return;
    }
    setSubmitting(true);
    try {
      await client.post('/diet-logs', {
        title: title.trim(),
        calories: Number(calories),
        protein: Number(protein || 0),
        carbs: Number(carbs || 0),
        fat: Number(fat || 0),
      });
      setTitle('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      fetchLogs();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to log meal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete entry?', 'This nutrition log will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await client.delete(`/diet-logs/${id}`);
            setLogs((prev) => prev.filter((l) => l._id !== id));
          } catch (err) {
            console.error('Error deleting diet log:', err);
          }
        },
      },
    ]);
  };

  const totals = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + (l.calories || 0),
      protein: acc.protein + (l.protein || 0),
      carbs: acc.carbs + (l.carbs || 0),
      fat: acc.fat + (l.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        {navigation?.goBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-2">
            <Text className="text-indigo-600 font-bold text-sm">← Back</Text>
          </TouchableOpacity>
        )}
        <Text className="text-2xl font-black text-[#1F2937]">Log a Meal</Text>
        <Text className="text-xs text-slate-500 mt-0.5">Track custom meals and daily nutrition totals</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />}
      >
        {/* Log Meal Form */}
        <View className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm mb-4">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">New Entry</Text>

          <TextInput
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm mb-3"
            placeholder="Meal name (e.g. Grilled Chicken Bowl)"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />

          <View className="flex-row gap-3 mb-3">
            <TextInput
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm"
              placeholder="Calories"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={calories}
              onChangeText={setCalories}
            />
            <TextInput
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm"
              placeholder="Protein (g)"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={protein}
              onChangeText={setProtein}
            />
          </View>

          <View className="flex-row gap-3 mb-4">
            <TextInput
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm"
              placeholder="Carbs (g)"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={carbs}
              onChangeText={setCarbs}
            />
            <TextInput
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm"
              placeholder="Fat (g)"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={fat}
              onChangeText={setFat}
            />
          </View>

          <TouchableOpacity
            onPress={handleLogMeal}
            disabled={submitting}
            className="bg-emerald-600 rounded-2xl py-3.5 items-center active:bg-emerald-700"
            style={{ opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-sm">Log Meal</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Daily Totals */}
        <View className="bg-emerald-600 rounded-3xl p-5 mb-4 shadow-md shadow-emerald-600/20">
          <Text className="text-emerald-200 text-xs font-bold uppercase tracking-wider">Total Logged</Text>
          <Text className="text-white text-3xl font-black mt-1">
            {totals.calories.toLocaleString()} <Text className="text-sm font-bold">kcal</Text>
          </Text>
          <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-white/20">
            <View className="items-center">
              <Text className="text-emerald-100 text-[10px] uppercase font-bold">Protein</Text>
              <Text className="text-white text-sm font-black mt-0.5">{totals.protein}g</Text>
            </View>
            <View className="items-center">
              <Text className="text-emerald-100 text-[10px] uppercase font-bold">Carbs</Text>
              <Text className="text-white text-sm font-black mt-0.5">{totals.carbs}g</Text>
            </View>
            <View className="items-center">
              <Text className="text-emerald-100 text-[10px] uppercase font-bold">Fat</Text>
              <Text className="text-white text-sm font-black mt-0.5">{totals.fat}g</Text>
            </View>
          </View>
        </View>

        {/* Log List */}
        {loading ? (
          <View className="py-16 items-center justify-center">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : logs.length === 0 ? (
          <View className="bg-white border border-slate-200 rounded-3xl p-8 items-center shadow-sm">
            <Text className="text-slate-400 text-xs text-center">No meals logged yet. Use the form above to log your first meal.</Text>
          </View>
        ) : (
          <View className="space-y-2.5">
            {logs.map((log) => (
              <View
                key={log._id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-row justify-between items-center"
              >
                <View className="flex-1 pr-2">
                  <Text className="font-extrabold text-slate-800 text-sm">{log.title}</Text>
                  <Text className="text-slate-400 text-[10px] mt-1">
                    🔥 {log.calories} kcal · P: {log.protein}g · C: {log.carbs}g · F: {log.fat}g
                  </Text>
                  <Text className="text-slate-300 text-[10px] mt-1">
                    {new Date(log.createdAt).toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(log._id)} className="p-2">
                  <Text className="text-rose-500 text-xs font-bold">Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MemberMealLogScreen;
