import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

type LeaderboardEntry = {
  rank: number;
  member_id: string;
  name: string;
  monthlyCheckIns: number;
  currentStreak: number;
  topBadge?: { emoji: string; label: string } | null;
};

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const LeaderboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const gymId = user?.gym_id || (typeof user?.gym_id === 'object' ? (user?.gym_id as any)?._id : null);
      if (!gymId) return;
      const res = await client.get(`/gamification/leaderboard/${gymId}`);
      setEntries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        {navigation?.goBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-2">
            <Text className="text-indigo-600 font-bold text-sm">← Back</Text>
          </TouchableOpacity>
        )}
        <Text className="text-2xl font-black text-[#1F2937]">This Month's Leaderboard</Text>
        <Text className="text-xs text-slate-500 mt-0.5">Ranked by days checked in this month</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
        >
          {entries.length === 0 ? (
            <Text className="text-slate-400 text-xs text-center py-10">No check-ins logged yet this month.</Text>
          ) : (
            <View className="space-y-2.5">
              {entries.map((entry) => {
                return (
                  <View
                    key={entry.member_id}
                    className={`bg-white border rounded-2xl p-4 flex-row items-center shadow-sm ${
                      entry.rank <= 3 ? 'border-amber-200' : 'border-slate-200'
                    }`}
                  >
                    <View className="w-10 items-center">
                      <Text className="text-lg font-black text-slate-700">
                        {RANK_MEDALS[entry.rank] || `#${entry.rank}`}
                      </Text>
                    </View>

                    <View className="flex-1 ml-2">
                      <Text className="font-extrabold text-slate-800 text-sm">{entry.name}</Text>
                      <Text className="text-slate-400 text-[11px] mt-0.5">
                        {entry.monthlyCheckIns} day{entry.monthlyCheckIns === 1 ? '' : 's'} this month · 🔥{' '}
                        {entry.currentStreak} day streak
                      </Text>
                    </View>

                    {entry.topBadge && (
                      <View className="items-center ml-2">
                        <Text className="text-xl">{entry.topBadge.emoji}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default LeaderboardScreen;
