import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const TrainerDietPlanScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [assignedMembers, setAssignedMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMembersForDiet = useCallback(async () => {
    try {
      const gymId = user?.gym_id || (typeof user?.gym_id === 'object' ? (user?.gym_id as any)?._id : null) || '66810a6bb8c4d284724b01ab';
      const res = await client.get(`/members/gym/${gymId}`);
      const allMembers = Array.isArray(res.data) ? res.data : [];
      const trainerIdStr = (user?.id || user?._id || '').toString();

      const myClients = allMembers.filter((m: any) => {
        const trainerObj = m.assigned_trainer_id;
        const assignedId = (typeof trainerObj === 'object' ? trainerObj?._id || trainerObj?.id : trainerObj || '').toString();
        return assignedId === trainerIdStr;
      });

      setAssignedMembers(myClients);
    } catch (err) {
      console.error('Error fetching members for diet plans:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMembersForDiet();
  }, [fetchMembersForDiet]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembersForDiet();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-1 px-5 pt-4">

        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-black text-[#1F2937]">Diet Plans</Text>
            <Text className="text-xs text-slate-500 mt-0.5">Meal plans & calorie targets for clients</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateDietPlan')}
            className="bg-emerald-600 px-3.5 py-2 rounded-xl shadow-sm"
          >
            <Text className="text-white text-xs font-bold">+ Create Diet</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <FlatList
            data={assignedMembers}
            keyExtractor={(item) => item._id || item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
            ListEmptyComponent={
              <View className="py-16 items-center">
                <Text className="text-slate-400 text-sm">No clients assigned yet.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const name = item.user_id?.name || item.name || 'Client';
              const email = item.user_id?.email || item.email || '';

              return (
                <View className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-sm flex-row justify-between items-center">
                  <View className="flex-1 pr-2">
                    <Text className="font-extrabold text-slate-800 text-sm">{name}</Text>
                    <Text className="text-slate-400 text-xs mt-0.5">{email}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('CreateDietPlan', { preselectedMemberId: item._id || item.id })}
                    className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl"
                  >
                    <Text className="text-emerald-700 text-xs font-bold">Assign Diet 🥗</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}

      </View>
    </SafeAreaView>
  );
};

export default TrainerDietPlanScreen;
