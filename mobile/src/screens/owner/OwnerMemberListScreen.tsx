import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const OwnerMemberListScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchMembers = useCallback(async () => {
    try {
      const gymId = user?.gym_id || (typeof user?.gym_id === 'object' ? (user?.gym_id as any)?._id : null) || '66810a6bb8c4d284724b01ab';
      const res = await client.get(`/members/gym/${gymId}`);
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch member list:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  const filteredMembers = members.filter((m) => {
    const name = m.user_id?.name || m.name || '';
    const email = m.user_id?.email || m.email || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return m.status === 'active';
    if (statusFilter === 'pending_approval') return m.status === 'pending_approval' || m.status === 'pending';
    if (statusFilter === 'pending_payment') return m.status === 'pending_payment';
    if (statusFilter === 'inactive') return m.status === 'inactive';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Active' };
      case 'pending_approval':
      case 'pending':
        return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Pending Approval' };
      case 'pending_payment':
        return { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', label: 'Pending Payment' };
      default:
        return { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', label: status || 'Inactive' };
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-1 px-5 pt-4">

        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-black text-[#1F2937]">Members</Text>
            <Text className="text-xs text-slate-500 mt-0.5">{members.length} Total Enrolled</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('PendingSignups')}
            className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl flex-row items-center space-x-1"
          >
            <Text className="text-amber-800 text-xs font-bold">Pending Approvals ⚡</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TextInput
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm mb-3 shadow-sm"
          placeholder="Search member name or email..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />

        {/* Status Filters */}
        <View className="flex-row gap-2 mb-4">
          {['all', 'active', 'pending_approval', 'pending_payment'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-full border ${
                statusFilter === filter
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text
                className={`text-[10px] font-bold capitalize ${
                  statusFilter === filter ? 'text-white' : 'text-slate-600'
                }`}
              >
                {filter.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <FlatList
            data={filteredMembers}
            keyExtractor={(item) => item._id || item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
            ListEmptyComponent={
              <View className="py-12 items-center">
                <Text className="text-slate-400 text-sm">No members found matching filter.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const badge = getStatusBadge(item.status);
              const name = item.user_id?.name || item.name || 'Member';
              const email = item.user_id?.email || item.email || '';
              const plan = item.plan_name || item.membership_plan || 'No Plan Selected';

              return (
                <TouchableOpacity
                  onPress={() => navigation.navigate('MemberDetail', { memberId: item._id || item.id })}
                  className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-sm flex-row items-center justify-between active:bg-slate-50"
                >
                  <View className="flex-row items-center space-x-3 flex-1 pr-2">
                    <View className="w-11 h-11 rounded-full bg-indigo-100 items-center justify-center">
                      <Text className="text-indigo-700 font-extrabold text-base">
                        {name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-slate-800 text-sm" numberOfLines={1}>{name}</Text>
                      <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>{email}</Text>
                      <Text className="text-slate-500 text-[10px] font-semibold mt-1">Plan: {plan}</Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <View className={`px-2.5 py-1 rounded-full border ${badge.bg}`}>
                      <Text className={`text-[10px] font-bold ${badge.text}`}>{badge.label}</Text>
                    </View>
                    <Text className="text-slate-400 text-xs mt-2">›</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

      </View>
    </SafeAreaView>
  );
};

export default OwnerMemberListScreen;
