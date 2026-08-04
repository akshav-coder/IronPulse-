import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const toIdString = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return (val._id || val.id || val.user_id || '').toString();
  }
  return String(val);
};

const TrainerMemberListScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAssignedClients = useCallback(async () => {
    try {
      const gymId = user?.gym_id || (typeof user?.gym_id === 'object' ? (user?.gym_id as any)?._id : null) || '66810a6bb8c4d284724b01ab';
      const res = await client.get(`/members/gym/${gymId}`);
      const allMembers = Array.isArray(res.data) ? res.data : [];

      const trainerIdStr = toIdString(user);
      const myClients = allMembers.filter((m: any) => {
        const assignedId = toIdString(m.assigned_trainer_id);
        return assignedId && trainerIdStr && assignedId === trainerIdStr;
      });

      setClients(myClients);
    } catch (err) {
      console.error('Error fetching assigned clients:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssignedClients();
  }, [fetchAssignedClients]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignedClients();
  };

  const filteredClients = clients.filter((c) => {
    const name = c.user_id?.name || c.name || '';
    const email = c.user_id?.email || c.email || '';
    return name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-1 px-5 pt-4">

        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-black text-[#1F2937]">My Clients</Text>
          <Text className="text-xs text-slate-500 mt-0.5">{clients.length} Assigned Athletes</Text>
        </View>

        {/* Search Bar */}
        <TextInput
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm mb-4 shadow-sm"
          placeholder="Search client by name or email..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />

        {/* List */}
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <FlatList
            data={filteredClients}
            keyExtractor={(item) => item._id || item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
            ListEmptyComponent={
              <View className="py-16 items-center">
                <Text className="text-slate-400 text-sm">No assigned clients found.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const name = item.user_id?.name || item.name || 'Client';
              const email = item.user_id?.email || item.email || '';
              const plan = item.plan_name || item.membership_plan || 'Active Plan';

              return (
                <TouchableOpacity
                  onPress={() => navigation.navigate('TrainerClientDetail', { memberId: item._id || item.id })}
                  className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-sm flex-row items-center justify-between active:bg-slate-50"
                >
                  <View className="flex-row items-center space-x-3 flex-1 pr-2">
                    <View className="w-11 h-11 rounded-full bg-indigo-100 items-center justify-center">
                      <Text className="text-indigo-700 font-extrabold text-base">
                        {name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-extrabold text-slate-800 text-sm" numberOfLines={1}>{name}</Text>
                      <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>{email}</Text>
                      <Text className="text-indigo-600 text-[10px] font-bold mt-1">Plan: {plan}</Text>
                    </View>
                  </View>

                  <Text className="text-slate-400 text-base">›</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}

      </View>
    </SafeAreaView>
  );
};

export default TrainerMemberListScreen;
