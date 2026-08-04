import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView, Modal, TextInput, ScrollView } from 'react-native';
import client from '../../api/client';

const OwnerPaymentListScreen = ({ navigation }: any) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Manual payment modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await client.get('/payments');
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchFormData = useCallback(async () => {
    try {
      const [membersRes, plansRes] = await Promise.all([
        client.get('/members'),
        client.get('/plans'),
      ]);
      setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
      setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
    } catch (err) {
      console.error('Error fetching modal options:', err);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchFormData();
  }, [fetchPayments, fetchFormData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const handleRecordPayment = async () => {
    if (!selectedMemberId || !amount) return;
    setSubmitting(true);
    try {
      await client.post('/payments', {
        member_id: selectedMemberId,
        plan_id: selectedPlanId || null,
        amount: parseFloat(amount),
        payment_method: 'cash',
        status: 'paid',
      });
      setModalVisible(false);
      setAmount('');
      await fetchPayments();
    } catch (err) {
      console.error('Error recording payment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'paid') return p.status === 'paid';
    if (statusFilter === 'pending') return p.status === 'pending';
    return true;
  });

  const totalCollected = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-1 px-5 pt-4">

        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-black text-[#1F2937]">Payments & Revenue</Text>
            <Text className="text-xs text-slate-500 mt-0.5">Transaction audit log</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('OwnerPlans')}
            className="bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-xl"
          >
            <Text className="text-indigo-600 text-xs font-bold">Membership Plans 💳</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View className="bg-emerald-600 rounded-3xl p-5 mb-4 shadow-md shadow-emerald-600/20 flex-row justify-between items-center">
          <View>
            <Text className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Total Collection</Text>
            <Text className="text-white text-2xl font-black mt-1">₹{totalCollected.toLocaleString('en-IN')}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-white/20 border border-white/30 px-3 py-2 rounded-xl"
          >
            <Text className="text-white text-xs font-bold">+ Log Cash Payment</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View className="flex-row gap-2 mb-4">
          {['all', 'paid', 'pending'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-full border ${
                statusFilter === filter ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'
              }`}
            >
              <Text className={`text-[10px] font-bold capitalize ${statusFilter === filter ? 'text-white' : 'text-slate-600'}`}>
                {filter} Payments
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment History List */}
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <FlatList
            data={filteredPayments}
            keyExtractor={(item) => item._id || item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
            ListEmptyComponent={
              <View className="py-12 items-center">
                <Text className="text-slate-400 text-sm">No payment records found.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const memberName = item.member_id?.user_id?.name || item.member_id?.name || item.member_name || 'Member';
              const isPaid = item.status === 'paid';
              const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'Recent';
              const method = (item.payment_method || 'Razorpay').toUpperCase();

              return (
                <View className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-sm flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-3 flex-1">
                    <View className={`w-10 h-10 rounded-xl items-center justify-center ${isPaid ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      <Text className="text-base font-bold">{isPaid ? '✓' : '⏳'}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-slate-800 text-sm" numberOfLines={1}>{memberName}</Text>
                      <Text className="text-slate-400 text-[10px] mt-0.5">{method} • {dateStr}</Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className={`font-black text-sm ${isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                      ₹{(item.amount || 0).toLocaleString('en-IN')}
                    </Text>
                    <Text className="text-slate-400 text-[10px] capitalize mt-0.5">{item.status || 'paid'}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}

      </View>

      {/* Manual Cash Payment Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-bold text-slate-800 mb-4">Record Cash Payment</Text>

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Member *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {members.map((m) => {
                  const name = m.user_id?.name || m.name || 'Member';
                  const id = m._id || m.id;
                  const isSel = selectedMemberId === id;
                  return (
                    <TouchableOpacity
                      key={id}
                      onPress={() => setSelectedMemberId(id)}
                      className={`px-3 py-2 rounded-xl border ${isSel ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-200'}`}
                    >
                      <Text className={`text-xs font-bold ${isSel ? 'text-indigo-700' : 'text-slate-700'}`}>{name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount (₹) *</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm mb-4"
              placeholder="e.g. 1500"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TouchableOpacity
              onPress={handleRecordPayment}
              disabled={submitting}
              className="bg-[#4F46E5] py-3.5 rounded-xl items-center"
            >
              {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-sm">Save Payment</Text>}
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

export default OwnerPaymentListScreen;
