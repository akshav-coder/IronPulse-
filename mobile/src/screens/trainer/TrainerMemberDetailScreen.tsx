import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';

const TrainerMemberDetailScreen = ({ route, navigation }: any) => {
  const { memberId } = route.params || {};
  const [member, setMember] = useState<any>(null);
  const [workoutPlan, setWorkoutPlan] = useState<any[]>([]);
  const [dietPlan, setDietPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientDetails = useCallback(async () => {
    try {
      const [memberRes, workoutRes, dietRes] = await Promise.all([
        client.get(`/members/${memberId}`),
        client.get(`/workout-plans/member/${memberId}`).catch(() => ({ data: [] })),
        client.get(`/diet-plans/member/${memberId}`).catch(() => ({ data: [] })),
      ]);

      setMember(memberRes.data);
      setWorkoutPlan(Array.isArray(workoutRes.data) ? workoutRes.data : []);
      setDietPlan(Array.isArray(dietRes.data) ? dietRes.data : []);
    } catch (err) {
      console.error('Error fetching client details:', err);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchClientDetails();
  }, [fetchClientDetails]);

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  const name = member?.user_id?.name || member?.name || 'Client Details';
  const email = member?.user_id?.email || member?.email || 'N/A';
  const phone = member?.user_id?.phone || member?.phone || 'Not provided';
  const planName = member?.plan_name || member?.membership_plan || 'Active Membership';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}>

        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
          <Text className="text-indigo-600 font-bold text-sm">‹ Back to Clients</Text>
        </TouchableOpacity>

        {/* Client Profile Header Card */}
        <View className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm items-center mb-4">
          <View className="w-16 h-16 rounded-full bg-indigo-100 items-center justify-center mb-3">
            <Text className="text-indigo-700 text-2xl font-black">{name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text className="text-xl font-extrabold text-slate-800 text-center">{name}</Text>
          <Text className="text-xs text-slate-400 mt-0.5">{email}</Text>
          
          <View className="mt-3 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
            <Text className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
              {planName} • Active
            </Text>
          </View>
        </View>

        {/* Assigned Workout Plan Overview */}
        <View className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Workout Plan</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateWorkoutPlan', { preselectedMemberId: memberId })}
              className="bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl"
            >
              <Text className="text-indigo-600 text-xs font-bold">+ Assign New</Text>
            </TouchableOpacity>
          </View>

          {workoutPlan.length === 0 ? (
            <Text className="text-slate-400 text-xs py-3 text-center">No active workout plan assigned.</Text>
          ) : (
            <View className="space-y-2">
              {workoutPlan.slice(0, 4).map((item, idx) => (
                <View key={idx} className="bg-slate-50 p-3 rounded-xl flex-row justify-between items-center">
                  <View>
                    <Text className="font-bold text-slate-800 text-xs">{item.exercise || item.exercise_name}</Text>
                    <Text className="text-slate-400 text-[10px] mt-0.5">{item.day || 'Day 1'} • {item.sets || 3} sets × {item.reps || 10} reps</Text>
                  </View>
                  <Text className="text-indigo-600 font-bold text-xs">💪</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Assigned Diet Plan Overview */}
        <View className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Diet Plan</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateDietPlan', { preselectedMemberId: memberId })}
              className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl"
            >
              <Text className="text-emerald-700 text-xs font-bold">+ Assign New</Text>
            </TouchableOpacity>
          </View>

          {dietPlan.length === 0 ? (
            <Text className="text-slate-400 text-xs py-3 text-center">No active diet plan assigned.</Text>
          ) : (
            <View className="space-y-2">
              {dietPlan.slice(0, 4).map((item, idx) => (
                <View key={idx} className="bg-slate-50 p-3 rounded-xl flex-row justify-between items-center">
                  <View>
                    <Text className="font-bold text-slate-800 text-xs">{item.meal_name || item.meal_type}</Text>
                    <Text className="text-slate-400 text-[10px] mt-0.5">{item.food_items || 'Custom Meal'}</Text>
                  </View>
                  <Text className="text-emerald-600 font-bold text-xs">{item.calories || 300} kcal</Text>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default TrainerMemberDetailScreen;
