import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_DAY_SUBTITLES: Record<string, string> = {
  Monday: 'Chest & Triceps Focus',
  Tuesday: 'Back & Biceps Focus',
  Wednesday: 'Legs & Abs Focus',
  Thursday: 'Shoulders & Arms Focus',
  Friday: 'Upper Body Hypertrophy',
  Saturday: 'Lower Body & Calves Focus',
};

const MemberWorkoutPlanScreen = () => {
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [workoutItems, setWorkoutItems] = useState<any[]>([]);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkoutPlan = useCallback(async () => {
    try {
      const profileRes = await client.get('/members/profile/me').catch(() => null);
      const memberId = profileRes?.data?._id || profileRes?.data?.id;

      if (memberId) {
        const res = await client.get(`/workout-plans/member/${memberId}`).catch(() => ({ data: [] }));
        setWorkoutItems(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Error fetching workout plan:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkoutPlan();
  }, [fetchWorkoutPlan]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkoutPlan();
  };

  const toggleCheckOff = (idKey: string) => {
    setCompletedItems((prev) => ({ ...prev, [idKey]: !prev[idKey] }));
  };

  const dayExercises = workoutItems.filter((ex) => (ex.day || ex.day_of_week || 'Monday').toLowerCase() === selectedDay.toLowerCase());
  const daySubtitle = dayExercises.find((ex) => ex.day_subtitle)?.day_subtitle || DEFAULT_DAY_SUBTITLES[selectedDay] || 'Workout Focus';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
      >
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-black text-[#1F2937]">My Workout Plan</Text>
          <Text className="text-xs text-slate-500 mt-0.5">Prescribed Monday–Saturday workout routines</Text>
        </View>

        {/* Day Selector Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {DAYS_OF_WEEK.map((d) => {
              const isSel = selectedDay === d;
              return (
                <TouchableOpacity
                  key={d}
                  onPress={() => setSelectedDay(d)}
                  className={`px-4 py-2.5 rounded-2xl border ${isSel ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
                >
                  <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-700'}`}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Day Muscle Focus Banner */}
        <View className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">📅 {selectedDay} Target Focus</Text>
            <Text className="text-slate-800 font-extrabold text-base mt-0.5">{daySubtitle}</Text>
          </View>
          <Text className="text-2xl">💪</Text>
        </View>

        {/* Exercises List */}
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : dayExercises.length === 0 ? (
          <View className="bg-white border border-slate-200 rounded-3xl p-8 items-center py-16 shadow-sm">
            <Text className="text-4xl mb-2">🧘‍♂️</Text>
            <Text className="text-slate-800 font-extrabold text-base">Rest & Recovery Day</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">No prescribed exercises for {selectedDay}. Focus on hydration & muscle recovery!</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {dayExercises.map((item, idx) => {
              const itemKey = item._id || item.id || `${selectedDay}-${idx}`;
              const isChecked = !!completedItems[itemKey];

              return (
                <TouchableOpacity
                  key={itemKey}
                  onPress={() => toggleCheckOff(itemKey)}
                  className={`border rounded-2xl p-4 shadow-sm flex-row items-center justify-between ${isChecked ? 'bg-emerald-50/70 border-emerald-200' : 'bg-white border-slate-200'}`}
                >
                  <View className="flex-row items-center space-x-3 flex-1 pr-2">
                    <View className={`w-6 h-6 rounded-lg border items-center justify-center ${isChecked ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300 bg-white'}`}>
                      {isChecked ? <Text className="text-white text-xs font-black">✓</Text> : null}
                    </View>

                    <View className="flex-1">
                      <Text className={`font-extrabold text-sm ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {item.exercise || item.exercise_name}
                      </Text>
                      {item.notes ? (
                        <Text className="text-slate-400 text-[10px] mt-0.5">{item.notes}</Text>
                      ) : null}
                    </View>
                  </View>

                  <View className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
                    <Text className="text-indigo-700 text-xs font-bold">{item.sets || 3} × {item.reps || 10}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MemberWorkoutPlanScreen;
