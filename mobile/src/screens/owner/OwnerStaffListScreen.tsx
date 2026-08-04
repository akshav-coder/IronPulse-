import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';

const OwnerStaffListScreen = ({ navigation }: any) => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add Staff Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStaff = useCallback(async () => {
    try {
      const res = await client.get('/staff');
      setStaff(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching staff list:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStaff();
  };

  const handleAddTrainer = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Name, email, and password are required.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const dummyGymId = '66810a6bb8c4d284724b01ab';
      await client.post('/users/register', {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role: 'trainer',
        phone: phone.trim(),
        gym_id: dummyGymId,
      });

      setModalVisible(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      await fetchStaff();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to add trainer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-1 px-5 pt-4">

        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-black text-[#1F2937]">Staff & Trainers</Text>
            <Text className="text-xs text-slate-500 mt-0.5">Gym trainers & roster management</Text>
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-[#4F46E5] px-3.5 py-2 rounded-xl shadow-sm"
          >
            <Text className="text-white text-xs font-bold">+ Add Trainer</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Shortcut to Classes */}
        <TouchableOpacity
          onPress={() => navigation.navigate('OwnerClasses')}
          className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-4 flex-row items-center justify-between shadow-sm"
        >
          <View className="flex-row items-center space-x-3">
            <View className="w-10 h-10 rounded-xl bg-indigo-600 items-center justify-center">
              <Text className="text-white font-bold text-base">🏋️‍♂️</Text>
            </View>
            <View>
              <Text className="text-slate-800 font-bold text-sm">Group Classes Schedule</Text>
              <Text className="text-indigo-700 text-xs">Create & assign group workout sessions</Text>
            </View>
          </View>
          <Text className="text-indigo-600 font-bold text-base">›</Text>
        </TouchableOpacity>

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <FlatList
            data={staff}
            keyExtractor={(item) => item._id || item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
            ListEmptyComponent={
              <View className="py-16 items-center">
                <Text className="text-slate-400 text-sm">No trainers added yet.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const name = item.user_id?.name || item.name || 'Trainer';
              const email = item.user_id?.email || item.email || '';
              const clientCount = item.client_count || item.assigned_members_count || 0;

              return (
                <View className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-sm flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-3 flex-1 pr-2">
                    <View className="w-11 h-11 rounded-full bg-purple-100 items-center justify-center">
                      <Text className="text-purple-700 font-extrabold text-base">
                        {name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-extrabold text-slate-800 text-sm" numberOfLines={1}>{name}</Text>
                      <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>{email}</Text>
                      <Text className="text-indigo-600 text-[10px] font-bold mt-1">Role: Fitness Trainer</Text>
                    </View>
                  </View>

                  <View className="items-end bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                    <Text className="text-xs font-black text-slate-800">{clientCount}</Text>
                    <Text className="text-[10px] text-slate-400 font-semibold">Clients</Text>
                  </View>
                </View>
              );
            }}
          />
        )}

      </View>

      {/* Add Trainer Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-bold text-slate-800 mb-4">Register New Trainer</Text>

            {errorMsg ? (
              <View className="bg-red-50 border border-red-200 p-3 rounded-xl mb-3">
                <Text className="text-red-700 text-xs font-semibold">{errorMsg}</Text>
              </View>
            ) : null}

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name *</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm mb-3"
              placeholder="e.g. Coach David"
              value={name}
              onChangeText={setName}
            />

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address *</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm mb-3"
              placeholder="david@ironpulse.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password *</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm mb-3"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm mb-4"
              placeholder="+91 9876543210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <TouchableOpacity
              onPress={handleAddTrainer}
              disabled={submitting}
              className="bg-[#4F46E5] py-3.5 rounded-xl items-center"
            >
              {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-sm">Save Trainer</Text>}
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

export default OwnerStaffListScreen;
