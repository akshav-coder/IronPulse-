import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const TrainerDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [assignedClients, setAssignedClients] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrainerDashboardData = useCallback(async () => {
    try {
      const gymId = user?.gym_id || (typeof user?.gym_id === 'object' ? (user?.gym_id as any)?._id : null) || '66810a6bb8c4d284724b01ab';
      const [membersRes, classesRes] = await Promise.all([
        client.get(`/members/gym/${gymId}`).catch(() => ({ data: [] })),
        client.get('/classes').catch(() => ({ data: [] })),
      ]);

      const allMembers = Array.isArray(membersRes.data) ? membersRes.data : [];
      const trainerIdStr = (user?.id || user?._id || '').toString();

      const myClients = allMembers.filter((m: any) => {
        const trainerObj = m.assigned_trainer_id;
        const assignedId = (typeof trainerObj === 'object' ? trainerObj?._id || trainerObj?.id : trainerObj || '').toString();
        return assignedId === trainerIdStr;
      });

      const allClasses = Array.isArray(classesRes.data) ? classesRes.data : [];
      const myClasses = allClasses.filter((c: any) => {
        const trainerObj = c.trainer_id;
        const classTrainerId = (typeof trainerObj === 'object' ? trainerObj?._id || trainerObj?.id : trainerObj || '').toString();
        return classTrainerId === trainerIdStr;
      });

      setAssignedClients(myClients);
      setClasses(myClasses);
    } catch (err) {
      console.error('Error fetching trainer dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTrainerDashboardData();
  }, [fetchTrainerDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrainerDashboardData();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-black text-[#1F2937]">Trainer Hub</Text>
            <Text className="text-xs text-slate-500 mt-0.5">Welcome, {user?.name || 'Coach'} 🏋️‍♂️</Text>
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
            <Text className="text-xs text-slate-500 mt-3">Loading trainer dashboard...</Text>
          </View>
        ) : (
          <View className="space-y-4">

            {/* Banner Card */}
            <View className="bg-indigo-600 rounded-3xl p-6 shadow-md shadow-indigo-600/20">
              <Text className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Assigned Members</Text>
              <Text className="text-white text-3xl font-black mt-2">{assignedClients.length} Active Clients</Text>
              <Text className="text-indigo-100 text-xs mt-1">Guiding athletes & managing progress</Text>
            </View>

            {/* Quick Metrics Grid */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Clients</Text>
                <Text className="text-2xl font-black text-slate-800 mt-1">{assignedClients.length}</Text>
                <Text className="text-[10px] text-emerald-600 font-semibold mt-1">Active Roster</Text>
              </View>

              <View className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Group Sessions</Text>
                <Text className="text-2xl font-black text-slate-800 mt-1">{classes.length}</Text>
                <Text className="text-[10px] text-indigo-600 font-semibold mt-1">Classes Instructed</Text>
              </View>
            </View>

            {/* Management Shortcuts */}
            <View className="mt-2">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Trainer Shortcuts</Text>
              
              <View className="space-y-2.5">
                <TouchableOpacity
                  onPress={() => navigation.navigate('TrainerWorkouts', { screen: 'CreateWorkoutPlan' })}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex-row items-center justify-between active:bg-slate-50"
                >
                  <View className="flex-row items-center space-x-3">
                    <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center">
                      <Text className="text-orange-600 font-bold text-base">🏋️</Text>
                    </View>
                    <View>
                      <Text className="text-slate-800 font-bold text-sm">Create Workout Plan</Text>
                      <Text className="text-slate-400 text-xs">Build & assign custom workout routine</Text>
                    </View>
                  </View>
                  <Text className="text-slate-400 text-base">›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('TrainerDiets', { screen: 'CreateDietPlan' })}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex-row items-center justify-between active:bg-slate-50"
                >
                  <View className="flex-row items-center space-x-3">
                    <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center">
                      <Text className="text-emerald-600 font-bold text-base">🥗</Text>
                    </View>
                    <View>
                      <Text className="text-slate-800 font-bold text-sm">Create Diet Plan</Text>
                      <Text className="text-slate-400 text-xs">Set target calories & daily meal plan</Text>
                    </View>
                  </View>
                  <Text className="text-slate-400 text-base">›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('TrainerClientsTab')}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex-row items-center justify-between active:bg-slate-50"
                >
                  <View className="flex-row items-center space-x-3">
                    <View className="w-10 h-10 rounded-xl bg-indigo-50 items-center justify-center">
                      <Text className="text-indigo-600 font-bold text-base">👥</Text>
                    </View>
                    <View>
                      <Text className="text-slate-800 font-bold text-sm">My Client Roster</Text>
                      <Text className="text-slate-400 text-xs">View assigned athletes & details</Text>
                    </View>
                  </View>
                  <Text className="text-slate-400 text-base">›</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrainerDashboardScreen;
