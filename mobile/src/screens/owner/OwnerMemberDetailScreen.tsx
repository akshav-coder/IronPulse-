import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Modal } from 'react-native';
import client from '../../api/client';

const OwnerMemberDetailScreen = ({ route, navigation }: any) => {
  const { memberId } = route.params || {};
  const [member, setMember] = useState<any>(null);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trainerModalVisible, setTrainerModalVisible] = useState(false);

  const fetchMemberDetail = useCallback(async () => {
    try {
      const res = await client.get(`/members/${memberId}`);
      setMember(res.data);
    } catch (err) {
      console.error('Failed to fetch member details:', err);
    }
  }, [memberId]);

  const fetchTrainers = useCallback(async () => {
    try {
      const res = await client.get('/staff');
      const staffList = Array.isArray(res.data) ? res.data : [];
      setTrainers(staffList.filter((s) => s.role === 'trainer' || s.user_id?.role === 'trainer'));
    } catch (err) {
      console.error('Failed to fetch trainers:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchMemberDetail(), fetchTrainers()]);
      setLoading(false);
    };
    init();
  }, [fetchMemberDetail, fetchTrainers]);

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await client.put(`/members/${memberId}`, { status: newStatus });
      await fetchMemberDetail();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignTrainer = async (trainerId: string) => {
    setUpdating(true);
    setTrainerModalVisible(false);
    try {
      await client.put(`/members/${memberId}`, { assigned_trainer_id: trainerId });
      await fetchMemberDetail();
    } catch (err) {
      console.error('Failed to assign trainer:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  const name = member?.user_id?.name || member?.name || 'Member Details';
  const email = member?.user_id?.email || member?.email || 'N/A';
  const phone = member?.user_id?.phone || member?.phone || 'Not provided';
  const planName = member?.plan_name || member?.membership_plan || 'No Active Plan';
  const assignedTrainer = member?.assigned_trainer_id?.name || member?.assigned_trainer_name || 'Unassigned';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        
        {/* Navigation Back Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
          <Text className="text-indigo-600 font-bold text-sm">‹ Back to Members</Text>
        </TouchableOpacity>

        {/* Profile Header Card */}
        <View className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm items-center mb-4">
          <View className="w-16 h-16 rounded-full bg-indigo-100 items-center justify-center mb-3">
            <Text className="text-indigo-700 text-2xl font-black">{name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text className="text-xl font-extrabold text-slate-800 text-center">{name}</Text>
          <Text className="text-xs text-slate-400 mt-0.5">{email}</Text>
          
          <View className="mt-3 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
            <Text className="text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
              Status: {member?.status || 'Active'}
            </Text>
          </View>
        </View>

        {/* Profile Info Card */}
        <View className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 mb-4">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Membership Details</Text>
          
          <View className="flex-row justify-between border-b border-slate-100 pb-2">
            <Text className="text-xs text-slate-500 font-semibold">Enrolled Plan</Text>
            <Text className="text-xs font-bold text-indigo-600">{planName}</Text>
          </View>

          <View className="flex-row justify-between border-b border-slate-100 pb-2">
            <Text className="text-xs text-slate-500 font-semibold">Phone Number</Text>
            <Text className="text-xs font-bold text-slate-800">{phone}</Text>
          </View>

          <View className="flex-row justify-between items-center border-b border-slate-100 pb-2">
            <View>
              <Text className="text-xs text-slate-500 font-semibold">Assigned Trainer</Text>
              <Text className="text-xs font-bold text-slate-800 mt-0.5">{assignedTrainer}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setTrainerModalVisible(true)}
              className="bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl"
            >
              <Text className="text-indigo-600 text-xs font-bold">Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Actions */}
        <View className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Member Actions</Text>
          
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleUpdateStatus('active')}
              disabled={updating}
              className="flex-1 bg-emerald-600 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-bold text-xs">Set Active</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleUpdateStatus('inactive')}
              disabled={updating}
              className="flex-1 bg-slate-200 rounded-xl py-3 items-center"
            >
              <Text className="text-slate-700 font-bold text-xs">Deactivate</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Trainer Selection Modal */}
      <Modal visible={trainerModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-bold text-slate-800 mb-4">Select Assigned Trainer</Text>
            {trainers.map((t) => {
              const trainerName = t.user_id?.name || t.name || 'Trainer';
              const trainerId = t.user_id?._id || t._id || t.id;
              return (
                <TouchableOpacity
                  key={trainerId}
                  onPress={() => handleAssignTrainer(trainerId)}
                  className="py-3 border-b border-slate-100 flex-row justify-between items-center"
                >
                  <Text className="text-slate-800 font-bold text-sm">{trainerName}</Text>
                  <Text className="text-indigo-600 text-xs font-bold">Select ›</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              onPress={() => setTrainerModalVisible(false)}
              className="mt-4 bg-slate-100 py-3 rounded-xl items-center"
            >
              <Text className="text-slate-600 font-bold text-xs">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default OwnerMemberDetailScreen;
