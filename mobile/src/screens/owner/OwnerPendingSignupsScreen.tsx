import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';

const OwnerPendingSignupsScreen = ({ navigation }: any) => {
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [membersRes, staffRes] = await Promise.all([
        client.get('/members'),
        client.get('/staff'),
      ]);

      const allMembers = Array.isArray(membersRes.data) ? membersRes.data : [];
      setPendingMembers(allMembers.filter((m) => m.status === 'pending_approval' || m.status === 'pending'));

      const staffList = Array.isArray(staffRes.data) ? staffRes.data : [];
      setTrainers(staffList.filter((s) => s.role === 'trainer' || s.user_id?.role === 'trainer'));
    } catch (err) {
      console.error('Error fetching pending signups:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openApproveModal = (memberId: string) => {
    setSelectedMemberId(memberId);
    setSelectedTrainerId(trainers[0]?._id || trainers[0]?.id || '');
    setModalVisible(true);
  };

  const handleApprove = async () => {
    if (!selectedMemberId) return;
    setProcessingId(selectedMemberId);
    setModalVisible(false);
    try {
      await client.put(`/members/${selectedMemberId}/approve`, {
        assigned_trainer_id: selectedTrainerId || null,
        status: 'active',
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to approve member signup:', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-1 px-5 pt-4">

        {/* Navigation Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-3">
          <Text className="text-indigo-600 font-bold text-sm">‹ Back</Text>
        </TouchableOpacity>

        <View className="mb-4">
          <Text className="text-2xl font-black text-[#1F2937]">Pending Registrations</Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            Review members who completed payment & assign trainers
          </Text>
        </View>

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <FlatList
            data={pendingMembers}
            keyExtractor={(item) => item._id || item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
            ListEmptyComponent={
              <View className="py-16 items-center">
                <Text className="text-4xl mb-2">🎉</Text>
                <Text className="text-slate-700 font-bold text-sm">No Pending Registrations!</Text>
                <Text className="text-slate-400 text-xs mt-1">All member signups are reviewed and assigned.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const name = item.user_id?.name || item.name || 'Member';
              const email = item.user_id?.email || item.email || '';
              const plan = item.plan_name || item.membership_plan || 'Selected Plan';

              return (
                <View className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-sm">
                  <View className="flex-row justify-between items-start mb-3">
                    <View>
                      <Text className="font-extrabold text-slate-800 text-base">{name}</Text>
                      <Text className="text-slate-400 text-xs mt-0.5">{email}</Text>
                    </View>
                    <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <Text className="text-emerald-700 text-[10px] font-bold">Payment Complete ✓</Text>
                    </View>
                  </View>

                  <View className="bg-slate-50 p-3 rounded-xl mb-3 flex-row justify-between items-center">
                    <Text className="text-xs text-slate-500 font-semibold">Purchased Plan:</Text>
                    <Text className="text-xs font-black text-indigo-600">{plan}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => openApproveModal(item._id || item.id)}
                    disabled={processingId === (item._id || item.id)}
                    className="bg-[#4F46E5] py-3 rounded-xl items-center justify-center shadow-sm"
                  >
                    {processingId === (item._id || item.id) ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold text-xs">Assign Trainer & Approve</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}

      </View>

      {/* Trainer Selection Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-bold text-slate-800 mb-2">Approve Signup</Text>
            <Text className="text-xs text-slate-500 mb-4">Choose a trainer to assign to this member:</Text>

            {trainers.map((t) => {
              const trainerName = t.user_id?.name || t.name || 'Trainer';
              const trainerId = t.user_id?._id || t._id || t.id;
              const isSelected = selectedTrainerId === trainerId;

              return (
                <TouchableOpacity
                  key={trainerId}
                  onPress={() => setSelectedTrainerId(trainerId)}
                  className={`py-3 px-4 rounded-xl border mb-2 flex-row justify-between items-center ${
                    isSelected ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-200'
                  }`}
                >
                  <Text className={`font-bold text-sm ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>
                    {trainerName}
                  </Text>
                  {isSelected && <Text className="text-indigo-600 text-xs font-bold">Selected ✓</Text>}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={handleApprove}
              className="bg-[#4F46E5] py-3.5 rounded-xl items-center mt-4"
            >
              <Text className="text-white font-bold text-sm">Confirm Approval</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="py-3 items-center mt-1"
            >
              <Text className="text-slate-400 font-bold text-xs">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default OwnerPendingSignupsScreen;
