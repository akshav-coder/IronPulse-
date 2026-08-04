import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';

const OwnerPlanListScreen = ({ navigation }: any) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [name, setName] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      // Owner fetches all plans including inactive ones
      const res = await client.get('/plans/all');
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching plans:', err);
      // Fallback
      try {
        const fallbackRes = await client.get('/plans');
        setPlans(Array.isArray(fallbackRes.data) ? fallbackRes.data : []);
      } catch (e) {
        console.error('Fallback plans error:', e);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlans();
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setDurationDays('30');
    setPrice('');
    setDescription('');
    setModalVisible(true);
  };

  const openEditModal = (plan: any) => {
    setEditingPlan(plan);
    setName(plan.name || '');
    setDurationDays(String(plan.duration_days || 30));
    setPrice(String(plan.price || ''));
    setDescription(plan.description || '');
    setModalVisible(true);
  };

  const handleSavePlan = async () => {
    if (!name.trim() || !price || !durationDays) return;
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        duration_days: parseInt(durationDays, 10),
        price: parseFloat(price),
        description: description.trim(),
      };

      if (editingPlan) {
        await client.put(`/plans/${editingPlan._id || editingPlan.id}`, payload);
      } else {
        await client.post('/plans', payload);
      }

      setModalVisible(false);
      await fetchPlans();
    } catch (err) {
      console.error('Error saving plan:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (plan: any) => {
    try {
      await client.put(`/plans/${plan._id || plan.id}`, { is_active: !plan.is_active });
      await fetchPlans();
    } catch (err) {
      console.error('Error toggling plan active state:', err);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-1 px-5 pt-4">

        {/* Navigation Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-3">
          <Text className="text-indigo-600 font-bold text-sm">‹ Back to Payments</Text>
        </TouchableOpacity>

        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-black text-[#1F2937]">Membership Plans</Text>
            <Text className="text-xs text-slate-500 mt-0.5">Manage signup tiers & prices in ₹</Text>
          </View>
          <TouchableOpacity
            onPress={openCreateModal}
            className="bg-[#4F46E5] px-3.5 py-2 rounded-xl shadow-sm"
          >
            <Text className="text-white text-xs font-bold">+ Create Plan</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <FlatList
            data={plans}
            keyExtractor={(item) => item._id || item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
            ListEmptyComponent={
              <View className="py-16 items-center">
                <Text className="text-slate-400 text-sm">No membership plans created yet.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isActive = item.is_active !== false;

              return (
                <View className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="font-extrabold text-slate-800 text-lg">{item.name}</Text>
                      <Text className="text-xs text-slate-400 mt-0.5">{item.duration_days} Days Validity</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xl font-black text-indigo-600">₹{(item.price || 0).toLocaleString('en-IN')}</Text>
                      <View className={`mt-1 px-2.5 py-0.5 rounded-full border ${isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-200'}`}>
                        <Text className={`text-[10px] font-bold ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                          {isActive ? 'Active Plan' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {item.description ? (
                    <Text className="text-slate-600 text-xs mt-2 bg-slate-50 p-2.5 rounded-xl">{item.description}</Text>
                  ) : null}

                  <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-slate-100">
                    <View className="flex-row items-center space-x-2">
                      <Text className="text-xs text-slate-400 font-semibold">Active Enrollment:</Text>
                      <Switch
                        value={isActive}
                        onValueChange={() => handleToggleActive(item)}
                        trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                        thumbColor={isActive ? '#4F46E5' : '#94A3B8'}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={() => openEditModal(item)}
                      className="bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-xl"
                    >
                      <Text className="text-indigo-600 text-xs font-bold">Edit Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}

      </View>

      {/* Plan Form Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-bold text-slate-800 mb-4">
              {editingPlan ? 'Edit Membership Plan' : 'Create New Plan'}
            </Text>

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Plan Name *</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm mb-3"
              placeholder="e.g. 3 Month Pro"
              value={name}
              onChangeText={setName}
            />

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duration (Days) *</Text>
                <TextInput
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm"
                  placeholder="90"
                  keyboardType="numeric"
                  value={durationDays}
                  onChangeText={setDurationDays}
                />
              </View>

              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price (₹) *</Text>
                <TextInput
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm"
                  placeholder="4500"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            </View>

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Feature Summary</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm mb-4"
              placeholder="e.g. Includes full gym access & trainer check-ins"
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity
              onPress={handleSavePlan}
              disabled={submitting}
              className="bg-[#4F46E5] py-3.5 rounded-xl items-center"
            >
              {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-sm">Save Plan</Text>}
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

export default OwnerPlanListScreen;
