import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';

const OwnerClassScheduleScreen = ({ navigation }: any) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add Class Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [capacity, setCapacity] = useState('20');
  const [submitting, setSubmitting] = useState(false);

  const fetchClassesData = useCallback(async () => {
    try {
      const [classRes, staffRes] = await Promise.all([
        client.get('/classes'),
        client.get('/staff'),
      ]);
      setClasses(Array.isArray(classRes.data) ? classRes.data : []);
      const staffList = Array.isArray(staffRes.data) ? staffRes.data : [];
      setTrainers(staffList.filter((s) => s.role === 'trainer' || s.user_id?.role === 'trainer'));
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClassesData();
  }, [fetchClassesData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClassesData();
  };

  const handleCreateClass = async () => {
    if (!name.trim() || !scheduleTime.trim()) return;
    setSubmitting(true);
    try {
      await client.post('/classes', {
        name: name.trim(),
        schedule_time: scheduleTime.trim(),
        trainer_id: selectedTrainerId || null,
        max_capacity: parseInt(capacity, 10) || 20,
      });

      setModalVisible(false);
      setName('');
      setScheduleTime('');
      setCapacity('20');
      await fetchClassesData();
    } catch (err) {
      console.error('Error creating class:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-1 px-5 pt-4">

        {/* Navigation Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-3">
          <Text className="text-indigo-600 font-bold text-sm">‹ Back to Staff</Text>
        </TouchableOpacity>

        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-black text-[#1F2937]">Group Classes</Text>
            <Text className="text-xs text-slate-500 mt-0.5">Workout sessions & schedules</Text>
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-[#4F46E5] px-3.5 py-2 rounded-xl shadow-sm"
          >
            <Text className="text-white text-xs font-bold">+ Schedule Class</Text>
          </TouchableOpacity>
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
                <Text className="text-slate-400 text-sm">No group classes scheduled yet.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const trainerName = item.trainer_id?.name || item.trainer_name || 'Assigned Trainer';
              const bookedCount = item.booked_count || 0;
              const maxCap = item.max_capacity || 20;

              return (
                <View className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="font-extrabold text-slate-800 text-lg">{item.name}</Text>
                      <Text className="text-xs font-semibold text-indigo-600 mt-0.5">⏰ {item.schedule_time}</Text>
                    </View>
                    <View className="bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                      <Text className="text-indigo-700 text-xs font-bold">{bookedCount}/{maxCap} Booked</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center space-x-2 mt-3 pt-3 border-t border-slate-100">
                    <Text className="text-slate-400 text-xs font-semibold">Instructor:</Text>
                    <Text className="text-slate-800 text-xs font-bold">{trainerName}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}

      </View>

      {/* Schedule Class Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-bold text-slate-800 mb-4">Schedule New Class</Text>

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Session Title *</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm mb-3"
              placeholder="e.g. Morning HIIT & Core"
              value={name}
              onChangeText={setName}
            />

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Schedule Time *</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm mb-3"
              placeholder="e.g. Mon, Wed, Fri • 07:00 AM"
              value={scheduleTime}
              onChangeText={setScheduleTime}
            />

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Instructor / Trainer</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              <View className="flex-row gap-2">
                {trainers.map((t) => {
                  const tName = t.user_id?.name || t.name || 'Trainer';
                  const tId = t.user_id?._id || t._id || t.id;
                  const isSel = selectedTrainerId === tId;
                  return (
                    <TouchableOpacity
                      key={tId}
                      onPress={() => setSelectedTrainerId(tId)}
                      className={`px-3 py-2 rounded-xl border ${isSel ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-200'}`}
                    >
                      <Text className={`text-xs font-bold ${isSel ? 'text-indigo-700' : 'text-slate-700'}`}>{tName}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Max Capacity</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm mb-4"
              placeholder="20"
              keyboardType="numeric"
              value={capacity}
              onChangeText={setCapacity}
            />

            <TouchableOpacity
              onPress={handleCreateClass}
              disabled={submitting}
              className="bg-[#4F46E5] py-3.5 rounded-xl items-center"
            >
              {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-sm">Save Class</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)} className="py-3 items-center mt-1">
              <Text className="text-slate-400 font-bold text-xs">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default OwnerClassScheduleScreen;
