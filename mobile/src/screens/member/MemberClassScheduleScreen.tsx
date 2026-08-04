import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';

const MemberClassScheduleScreen = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookedClassIds, setBookedClassIds] = useState<Record<string, boolean>>({});

  const fetchClasses = useCallback(async () => {
    try {
      const res = await client.get('/classes').catch(() => ({ data: [] }));
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching classes for member:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const handleBookClass = (classId: string) => {
    setBookedClassIds((prev) => ({ ...prev, [classId]: true }));
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-1 px-5 pt-4">

        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-black text-[#1F2937]">Group Classes</Text>
          <Text className="text-xs text-slate-500 mt-0.5">Book your seat in daily workout sessions</Text>
        </View>

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <FlatList
            data={classes}
            keyExtractor={(item) => item._id || item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
            ListEmptyComponent={
              <View className="py-16 items-center">
                <Text className="text-slate-400 text-sm">No group classes scheduled right now.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const classId = item._id || item.id;
              const isBooked = !!bookedClassIds[classId];
              const trainerName = item.trainer_id?.name || item.trainer_name || 'Coach';
              const maxCap = item.max_capacity || 20;
              const bookedCount = (item.booked_count || 0) + (isBooked ? 1 : 0);

              return (
                <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-4 shadow-sm">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 pr-2">
                      <Text className="font-extrabold text-slate-800 text-lg">{item.name}</Text>
                      <Text className="text-xs font-semibold text-indigo-600 mt-0.5">⏰ {item.schedule_time}</Text>
                    </View>
                    <View className="bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                      <Text className="text-indigo-700 text-xs font-bold">{bookedCount}/{maxCap} Seats</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-slate-100">
                    <View className="flex-row items-center space-x-2">
                      <Text className="text-slate-400 text-xs font-semibold">Instructor:</Text>
                      <Text className="text-slate-800 text-xs font-bold">{trainerName}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleBookClass(classId)}
                      disabled={isBooked}
                      className={`px-4 py-2 rounded-xl border ${isBooked ? 'bg-emerald-50 border-emerald-200' : 'bg-indigo-600 border-indigo-600'}`}
                    >
                      <Text className={`text-xs font-bold ${isBooked ? 'text-emerald-700' : 'text-white'}`}>
                        {isBooked ? '✓ Reserved' : 'Book Seat 🎟️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}

      </View>
    </SafeAreaView>
  );
};

export default MemberClassScheduleScreen;
