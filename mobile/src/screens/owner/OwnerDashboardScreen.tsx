import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface Stats {
  totalMembers: number;
  activeMembers: number;
  pendingApprovals: number;
  monthlyRevenue: number;
  activeTrainers: number;
}

const OwnerDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const gymId = user?.gym_id || (typeof user?.gym_id === 'object' ? (user?.gym_id as any)?._id : null) || '66810a6bb8c4d284724b01ab';
      const [dashRes, membersRes] = await Promise.all([
        client.get(`/dashboard/owner/${gymId}`),
        client.get('/members').catch(() => ({ data: [] })),
      ]);

      const dashData = dashRes.data;
      const allMembers = Array.isArray(membersRes.data) ? membersRes.data : [];
      const pendingCount = allMembers.filter((m: any) => m.status === 'pending_approval' || m.status === 'pending').length;

      setStats({
        totalMembers: dashData.totalMembers || 0,
        activeMembers: dashData.activeMembers || 0,
        pendingApprovals: pendingCount,
        monthlyRevenue: dashData.monthlyRevenue || 0,
        activeTrainers: dashData.activeTrainers || 0,
      });
    } catch (error) {
      console.error('Error fetching owner dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
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
            <Text className="text-2xl font-black text-[#1F2937]">Owner Portal</Text>
            <Text className="text-xs text-slate-500 mt-0.5">Welcome back, {user?.name || 'Owner'} 👋</Text>
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
            <Text className="text-xs text-slate-500 mt-3">Loading dashboard analytics...</Text>
          </View>
        ) : (
          <View className="space-y-4">

            {/* Banner / Monthly Revenue */}
            <View className="bg-[#4F46E5] rounded-3xl p-6 shadow-md shadow-indigo-500/20">
              <Text className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Monthly Revenue</Text>
              <Text className="text-white text-3xl font-black mt-2">
                ₹{(stats?.monthlyRevenue || 0).toLocaleString('en-IN')}
              </Text>
              <View className="flex-row items-center mt-3 bg-indigo-500/30 px-3 py-1.5 rounded-full self-start">
                <Text className="text-indigo-100 text-[10px] font-bold">Updated Live • Indian Rupees</Text>
              </View>
            </View>

            {/* Quick Metrics Grid */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Members</Text>
                <Text className="text-2xl font-black text-slate-800 mt-1">{stats?.totalMembers || 0}</Text>
                <Text className="text-[10px] text-emerald-600 font-semibold mt-1">
                  {stats?.activeMembers || 0} Active
                </Text>
              </View>

              <View className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Trainers</Text>
                <Text className="text-2xl font-black text-slate-800 mt-1">{stats?.activeTrainers || 0}</Text>
                <Text className="text-[10px] text-indigo-600 font-semibold mt-1">Gym Staff</Text>
              </View>
            </View>

            {/* Pending Approvals Alert Card */}
            {stats && stats.pendingApprovals > 0 ? (
              <TouchableOpacity
                onPress={() => navigation.navigate('PendingSignups')}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
              >
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center space-x-2">
                    <View className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <Text className="text-amber-900 font-bold text-sm">
                      {stats.pendingApprovals} Pending Member Signups
                    </Text>
                  </View>
                  <Text className="text-amber-700 text-xs mt-1">
                    Members have paid & are waiting for trainer assignment.
                  </Text>
                </View>
                <View className="bg-amber-500 px-3 py-1.5 rounded-xl">
                  <Text className="text-white text-xs font-bold">Review</Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {/* Quick Action Shortcuts */}
            <View className="mt-2">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Management Shortcuts</Text>
              
              <View className="space-y-2.5">
                <TouchableOpacity
                  onPress={() => navigation.navigate('MembersTab', { screen: 'PendingSignups' })}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex-row items-center justify-between active:bg-slate-50"
                >
                  <View className="flex-row items-center space-x-3">
                    <View className="w-10 h-10 rounded-xl bg-indigo-50 items-center justify-center">
                      <Text className="text-indigo-600 font-bold text-base">📋</Text>
                    </View>
                    <View>
                      <Text className="text-slate-800 font-bold text-sm">Pending Signups</Text>
                      <Text className="text-slate-400 text-xs">Assign trainers & approve registration</Text>
                    </View>
                  </View>
                  <Text className="text-slate-400 text-base">›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('PaymentsTab', { screen: 'OwnerPlans' })}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex-row items-center justify-between active:bg-slate-50"
                >
                  <View className="flex-row items-center space-x-3">
                    <View className="w-10 h-10 rounded-xl bg-teal-50 items-center justify-center">
                      <Text className="text-teal-600 font-bold text-base">💳</Text>
                    </View>
                    <View>
                      <Text className="text-slate-800 font-bold text-sm">Membership Plans</Text>
                      <Text className="text-slate-400 text-xs">Manage durations & prices in ₹</Text>
                    </View>
                  </View>
                  <Text className="text-slate-400 text-base">›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('StaffTab', { screen: 'OwnerStaff' })}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex-row items-center justify-between active:bg-slate-50"
                >
                  <View className="flex-row items-center space-x-3">
                    <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center">
                      <Text className="text-purple-600 font-bold text-base">👨‍🏫</Text>
                    </View>
                    <View>
                      <Text className="text-slate-800 font-bold text-sm">Staff & Trainers</Text>
                      <Text className="text-slate-400 text-xs">Add new trainers & track client load</Text>
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

export default OwnerDashboardScreen;
