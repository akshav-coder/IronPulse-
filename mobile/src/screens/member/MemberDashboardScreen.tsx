import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const MemberDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [todayWorkout, setTodayWorkout] = useState<any[]>([]);
  const [todayDiet, setTodayDiet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMemberDashboardData = useCallback(async () => {
    try {
      const profileRes = await client.get('/members/profile/me').catch(() => null);
      const memberObj = profileRes?.data || null;
      setProfile(memberObj);

      const memberId = memberObj?._id || memberObj?.id;
      if (memberId) {
        const [workoutRes, dietRes] = await Promise.all([
          client.get(`/workout-plans/member/${memberId}`).catch(() => ({ data: [] })),
          client.get(`/diet-plans/member/${memberId}`).catch(() => ({ data: [] })),
        ]);

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[new Date().getDay()];

        const allWorkouts = Array.isArray(workoutRes.data) ? workoutRes.data : [];
        const todayW = allWorkouts.filter((w: any) => (w.day || w.day_of_week || '').toLowerCase() === todayName.toLowerCase());

        const allDiets = Array.isArray(dietRes.data) ? dietRes.data : [];
        const todayD = allDiets.filter((d: any) => (d.day || d.day_of_week || '').toLowerCase() === todayName.toLowerCase());

        setTodayWorkout(todayW.length > 0 ? todayW : allWorkouts.slice(0, 3));
        setTodayDiet(todayD.length > 0 ? todayD : allDiets.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching member dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMemberDashboardData();
  }, [fetchMemberDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMemberDashboardData();
  };

  const planName = profile?.plan_name || profile?.membership_plan || 'Active Membership';
  const trainerName = profile?.assigned_trainer_id?.name || 'Personal Coach';
  const trainerEmail = profile?.assigned_trainer_id?.email || 'Contact Gym Reception';

  // Calculate days remaining
  let daysRemaining = 30;
  if (profile?.expiry_date) {
    const exp = new Date(profile.expiry_date).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((exp - now) / (1000 * 3600 * 24));
    daysRemaining = diffDays > 0 ? diffDays : 0;
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-black text-[#1F2937]">Member Hub</Text>
            <Text className="text-xs text-slate-500 mt-0.5">Welcome back, {user?.name || 'Athlete'} 🔥</Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            className="px-3 py-1.5 bg-slate-200 rounded-lg active:bg-slate-300"
          >
            <Text className="text-xs font-bold text-slate-700">Logout</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text className="text-xs text-slate-500 mt-3">Loading member dashboard...</Text>
          </View>
        ) : (
          <View className="space-y-4">

            {/* Membership Status Card */}
            <View className="bg-gradient-to-r bg-[#4F46E5] rounded-3xl p-6 shadow-md shadow-indigo-600/20">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Active Subscription</Text>
                  <Text className="text-white text-2xl font-black mt-1">{planName}</Text>
                </View>
                <View className="bg-white/20 px-3 py-1 rounded-full border border-white/30">
                  <Text className="text-white text-[10px] font-bold uppercase">Active Member</Text>
                </View>
              </View>

              <View className="mt-4 pt-3 border-t border-white/20 flex-row justify-between items-center">
                <Text className="text-indigo-100 text-xs font-semibold">Validity Remaining:</Text>
                <Text className="text-white text-sm font-black">{daysRemaining} Days Left</Text>
              </View>
            </View>

            {/* Assigned Trainer Card */}
            <View className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-row items-center justify-between">
              <View className="flex-row items-center space-x-3 flex-1">
                <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center">
                  <Text className="text-indigo-700 font-black text-lg">🏋️‍♂️</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Personal Coach</Text>
                  <Text className="font-extrabold text-slate-800 text-sm mt-0.5">{trainerName}</Text>
                  <Text className="text-slate-400 text-xs" numberOfLines={1}>{trainerEmail}</Text>
                </View>
              </View>
            </View>

            {/* Today's Workout Quick Card */}
            <View className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Workout Routine</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Workouts')}>
                  <Text className="text-indigo-600 text-xs font-bold">View Schedule ›</Text>
                </TouchableOpacity>
              </View>

              {todayWorkout.length === 0 ? (
                <Text className="text-slate-400 text-xs py-3 text-center">Rest day! No exercises assigned for today.</Text>
              ) : (
                <View className="space-y-2">
                  {todayWorkout.slice(0, 3).map((item, idx) => (
                    <View key={idx} className="bg-slate-50 p-3 rounded-xl flex-row justify-between items-center">
                      <Text className="font-bold text-slate-800 text-xs">{item.exercise || item.exercise_name}</Text>
                      <Text className="text-indigo-600 font-bold text-xs">{item.sets || 3} sets × {item.reps || 10} reps</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Today's Diet Quick Card */}
            <View className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Nutrition & Meals</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Diet')}>
                  <Text className="text-emerald-700 text-xs font-bold">View Meal Plan ›</Text>
                </TouchableOpacity>
              </View>

              {todayDiet.length === 0 ? (
                <Text className="text-slate-400 text-xs py-3 text-center">No specific meal plan assigned for today.</Text>
              ) : (
                <View className="space-y-2">
                  {todayDiet.slice(0, 3).map((item, idx) => (
                    <View key={idx} className="bg-slate-50 p-3 rounded-xl flex-row justify-between items-center">
                      <View className="flex-1 pr-2">
                        <Text className="font-bold text-slate-800 text-xs">{item.food_items || item.meal_name}</Text>
                        <Text className="text-slate-400 text-[10px]">{item.notes || 'Custom Meal'}</Text>
                      </View>
                      <Text className="text-emerald-600 font-bold text-xs">{item.calories || 300} kcal</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MemberDashboardScreen;
