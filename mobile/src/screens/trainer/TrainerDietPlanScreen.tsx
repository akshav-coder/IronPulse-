import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_MASTER_PLANS = [
  {
    id: 'diet-master-1',
    name: 'Balanced Carb-Cycling Plan',
    tag: 'Monday – Saturday',
    description: 'Alternates between low-carb and high-carb days to maximize fat loss while preserving muscle.',
    daySubtitles: {
      Monday: 'Low Carb Focus',
      Tuesday: 'High Carb Day',
      Wednesday: 'Low Carb Focus',
      Thursday: 'High Carb Day',
      Friday: 'Low Carb Focus',
      Saturday: 'High Carb Refeed',
    },
    exercises: [
      { day_of_week: 'Monday', meal_name: 'Scrambled Eggs & Avocado', calories: 350, protein: 22, carbs: 3, fat: 28 },
      { day_of_week: 'Monday', meal_name: 'Grilled Chicken & Broccoli', calories: 450, protein: 45, carbs: 10, fat: 12 },
      { day_of_week: 'Tuesday', meal_name: 'Oats with Honey & Banana', calories: 500, protein: 20, carbs: 80, fat: 8 },
      { day_of_week: 'Tuesday', meal_name: 'Chicken Rice & Black Beans Bowl', calories: 750, protein: 48, carbs: 95, fat: 12 },
      { day_of_week: 'Wednesday', meal_name: 'Keto Whey Protein Shake', calories: 300, protein: 30, carbs: 5, fat: 15 },
      { day_of_week: 'Thursday', meal_name: 'Cream of Rice & Protein Powder', calories: 450, protein: 35, carbs: 65, fat: 5 },
      { day_of_week: 'Friday', meal_name: 'Chicken Caesar Salad', calories: 550, protein: 38, carbs: 8, fat: 38 },
      { day_of_week: 'Saturday', meal_name: 'Protein Pancakes with Syrup', calories: 550, protein: 32, carbs: 85, fat: 6 },
    ],
  },
  {
    id: 'diet-master-2',
    name: 'High Protein Clean Bulk',
    tag: 'Monday – Saturday',
    description: 'High calorie, macro-dense nutrition routine designed for clean muscle gains and lifting performance.',
    daySubtitles: {
      Monday: 'Clean Muscle Builder',
      Tuesday: 'Clean Muscle Builder',
      Wednesday: 'Clean Muscle Builder',
      Thursday: 'Clean Muscle Builder',
      Friday: 'Clean Muscle Builder',
      Saturday: 'High Calorie Strength Load',
    },
    exercises: [
      { day_of_week: 'Monday', meal_name: 'Oats with Whey & Peanut Butter', calories: 550, protein: 35, carbs: 60, fat: 15 },
      { day_of_week: 'Monday', meal_name: 'Grilled Chicken & Rice Bowl', calories: 750, protein: 50, carbs: 85, fat: 18 },
      { day_of_week: 'Tuesday', meal_name: 'Salmon Fillet & Quinoa Salad', calories: 800, protein: 45, carbs: 75, fat: 28 },
      { day_of_week: 'Wednesday', meal_name: 'Sweet Potatoes & Grilled Chicken', calories: 700, protein: 48, carbs: 80, fat: 12 },
      { day_of_week: 'Thursday', meal_name: 'Banana Protein Pancakes', calories: 500, protein: 32, carbs: 65, fat: 8 },
      { day_of_week: 'Friday', meal_name: 'Beef Meatballs & Pasta', calories: 850, protein: 55, carbs: 100, fat: 20 },
      { day_of_week: 'Saturday', meal_name: 'Salmon Fillet with Rice', calories: 800, protein: 48, carbs: 80, fat: 22 },
    ],
  },
  {
    id: 'diet-master-3',
    name: 'Keto Weight Loss Split',
    tag: 'Monday – Saturday',
    description: 'High fat, ultra-low carb ketogenic schedule to promote ketosis and efficient fat loss.',
    daySubtitles: {
      Monday: 'High Fat Ketosis',
      Tuesday: 'High Fat Ketosis',
      Wednesday: 'High Fat Ketosis',
      Thursday: 'High Fat Ketosis',
      Friday: 'High Fat Ketosis',
      Saturday: 'High Fat Ketosis',
    },
    exercises: [
      { day_of_week: 'Monday', meal_name: 'Bulletproof Coffee & Boiled Eggs', calories: 350, protein: 12, carbs: 1, fat: 32 },
      { day_of_week: 'Monday', meal_name: 'Grilled Ribeye & Asparagus', calories: 800, protein: 55, carbs: 2, fat: 64 },
      { day_of_week: 'Tuesday', meal_name: 'Bacon & Cheddar Omelette', calories: 450, protein: 28, carbs: 2, fat: 38 },
      { day_of_week: 'Wednesday', meal_name: 'Pork Chops & Buttered Broccoli', calories: 700, protein: 45, carbs: 4, fat: 56 },
      { day_of_week: 'Thursday', meal_name: 'Shrimp Zucchini Noodles', calories: 450, protein: 35, carbs: 6, fat: 32 },
      { day_of_week: 'Friday', meal_name: 'Caesar Salad with Avocado', calories: 600, protein: 35, carbs: 5, fat: 48 },
      { day_of_week: 'Saturday', meal_name: 'Bunless Bacon Cheeseburger', calories: 750, protein: 48, carbs: 4, fat: 60 },
    ],
  },
];

const toIdString = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return (val._id || val.id || val.user_id || '').toString();
  }
  return String(val);
};

const TrainerDietPlanScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'master' | 'assigned'>('master');

  const [masterPlans, setMasterPlans] = useState<any[]>(DEFAULT_MASTER_PLANS);
  const [assignedMembers, setAssignedMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Assign Modal State
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedPlanToAssign, setSelectedPlanToAssign] = useState<any>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Client Routine Inspector State
  const [inspectMemberId, setInspectMemberId] = useState<string>('');
  const [memberPlanItems, setMemberPlanItems] = useState<any[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const gymId = user?.gym_id || (typeof user?.gym_id === 'object' ? (user?.gym_id as any)?._id : null) || '66810a6bb8c4d284724b01ab';
      const res = await client.get(`/members/gym/${gymId}`);
      const allMembers = Array.isArray(res.data) ? res.data : [];
      const trainerIdStr = toIdString(user);

      const myClients = allMembers.filter((m: any) => {
        const assignedId = toIdString(m.assigned_trainer_id);
        return assignedId && trainerIdStr && assignedId === trainerIdStr;
      });

      setAssignedMembers(myClients);
      if (myClients.length > 0 && !selectedMemberId) {
        setSelectedMemberId(myClients[0]._id || myClients[0].id);
      }
    } catch (err) {
      console.error('Error fetching assigned members:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, selectedMemberId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  const handleOpenAssignModal = (plan: any) => {
    setSelectedPlanToAssign(plan);
    if (assignedMembers.length > 0) {
      setSelectedMemberId(assignedMembers[0]._id || assignedMembers[0].id);
    }
    setAssignModalVisible(true);
  };

  const handleConfirmAssignPlan = async () => {
    if (!selectedPlanToAssign || !selectedMemberId) return;
    setAssigning(true);
    setSuccessMsg('');
    try {
      const mealsWithSubtitles = selectedPlanToAssign.exercises.map((m: any) => ({
        ...m,
        food_items: m.meal_name,
        day_subtitle:
          m.day_subtitle ||
          (selectedPlanToAssign.daySubtitles && selectedPlanToAssign.daySubtitles[m.day_of_week]) ||
          'Nutrition Focus',
      }));

      await client.post('/diet-plans/assign-bulk', {
        member_id: selectedMemberId,
        meals: mealsWithSubtitles,
      });

      const clientObj = assignedMembers.find((m) => (m._id || m.id) === selectedMemberId);
      const clientName = clientObj?.user_id?.name || clientObj?.name || 'Client';

      setSuccessMsg(`Assigned "${selectedPlanToAssign.name}" to ${clientName}!`);
      setAssignModalVisible(false);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Error assigning diet plan:', err);
    } finally {
      setAssigning(false);
    }
  };

  const fetchMemberDiet = async (memberId: string) => {
    setInspectMemberId(memberId);
    if (!memberId) return;
    setLoadingPlan(true);
    try {
      const res = await client.get(`/diet-plans/member/${memberId}`);
      setMemberPlanItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching member diet:', err);
    } finally {
      setLoadingPlan(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-1 px-5 pt-4">

        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-black text-[#1F2937]">Diet Planner</Text>
            <Text className="text-xs text-slate-500 mt-0.5">Design & assign meal plans to clients</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateDietPlan')}
            className="bg-emerald-600 px-3 py-2 rounded-xl shadow-sm"
          >
            <Text className="text-white text-xs font-bold">+ Custom Meal</Text>
          </TouchableOpacity>
        </View>

        {successMsg ? (
          <View className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl mb-4">
            <Text className="text-emerald-800 text-xs font-bold">✅ {successMsg}</Text>
          </View>
        ) : null}

        {/* Section Tabs */}
        <View className="flex-row bg-slate-200 p-1 rounded-2xl mb-4">
          <TouchableOpacity
            onPress={() => setActiveTab('master')}
            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'master' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-bold ${activeTab === 'master' ? 'text-emerald-700' : 'text-slate-500'}`}>
              Master Templates ({masterPlans.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('assigned')}
            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'assigned' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-bold ${activeTab === 'assigned' ? 'text-emerald-700' : 'text-slate-500'}`}>
              Client Meal Plans
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: MASTER DIET TEMPLATES */}
        {activeTab === 'master' && (
          <FlatList
            data={masterPlans}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />}
            renderItem={({ item }) => (
              <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-4 shadow-sm">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <View className="bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full self-start mb-1.5">
                      <Text className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider">🥗 {item.tag}</Text>
                    </View>
                    <Text className="font-extrabold text-slate-800 text-base">{item.name}</Text>
                  </View>
                </View>

                <Text className="text-slate-500 text-xs mb-3">{item.description}</Text>

                {/* Day-by-Day Meal Roster */}
                <View className="bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-4 space-y-2">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Weekly Macro Breakdown</Text>
                  {DAYS_OF_WEEK.map((day) => {
                    const dayMeals = item.exercises.filter((ex: any) => ex.day_of_week === day);
                    const daySub = item.daySubtitles?.[day] || 'Nutrition Focus';

                    return (
                      <View key={day} className="flex-row justify-between items-center py-1 border-b border-slate-200/50 last:border-0">
                        <View className="flex-1 pr-2">
                          <Text className="text-xs font-bold text-slate-800">{day}</Text>
                          <Text className="text-[10px] text-emerald-600 font-semibold">{daySub}</Text>
                        </View>
                        <Text className="text-[10px] font-bold text-slate-400">{dayMeals.length} Meals</Text>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity
                  onPress={() => handleOpenAssignModal(item)}
                  className="bg-emerald-600 py-3 rounded-xl items-center shadow-sm"
                >
                  <Text className="text-white font-bold text-xs">Assign Plan to Client 🥗</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* TAB 2: CLIENT MEAL PLAN INSPECTOR */}
        {activeTab === 'assigned' && (
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Client to Inspect Diet</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {assignedMembers.map((m) => {
                  const mName = m.user_id?.name || m.name || 'Client';
                  const mId = m._id || m.id;
                  const isSel = inspectMemberId === mId;

                  return (
                    <TouchableOpacity
                      key={mId}
                      onPress={() => fetchMemberDiet(mId)}
                      className={`px-4 py-2 rounded-2xl border ${isSel ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-200'}`}
                    >
                      <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-700'}`}>{mName}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {loadingPlan ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#059669" />
              </View>
            ) : !inspectMemberId ? (
              <View className="py-16 items-center">
                <Text className="text-slate-400 text-xs">Tap a client above to view their prescribed Monday–Saturday meal schedule.</Text>
              </View>
            ) : memberPlanItems.length === 0 ? (
              <View className="py-16 items-center">
                <Text className="text-slate-400 text-xs">No diet plan assigned to this client yet.</Text>
              </View>
            ) : (
              <View className="space-y-3">
                {DAYS_OF_WEEK.map((day) => {
                  const dayMeals = memberPlanItems.filter((m) => (m.day_of_week || 'Monday').toLowerCase() === day.toLowerCase());

                  return (
                    <View key={day} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                      <Text className="font-extrabold text-emerald-600 text-sm mb-2">🥗 {day}</Text>
                      {dayMeals.length === 0 ? (
                        <Text className="text-slate-400 text-xs italic">Flexible Nutrition Day</Text>
                      ) : (
                        <View className="space-y-1.5">
                          {dayMeals.map((m, idx) => (
                            <View key={idx} className="bg-slate-50 p-2.5 rounded-xl flex-row justify-between items-center">
                              <View className="flex-1 pr-2">
                                <Text className="font-bold text-slate-800 text-xs">{m.food_items || m.meal_name}</Text>
                                <Text className="text-slate-400 text-[10px]">{m.notes || 'Custom Meal'}</Text>
                              </View>
                              <Text className="text-emerald-600 font-bold text-xs">{m.calories || 300} kcal</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}

      </View>

      {/* ASSIGN PLAN MODAL */}
      <Modal visible={assignModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-bold text-slate-800 mb-1">Assign Diet Plan</Text>
            <Text className="text-xs text-emerald-600 font-semibold mb-4">{selectedPlanToAssign?.name}</Text>

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Target Client *</Text>
            {assignedMembers.length === 0 ? (
              <Text className="text-amber-600 text-xs mb-4">No active clients assigned to your profile yet.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <View className="flex-row gap-2">
                  {assignedMembers.map((m) => {
                    const mName = m.user_id?.name || m.name || 'Client';
                    const mId = m._id || m.id;
                    const isSel = selectedMemberId === mId;

                    return (
                      <TouchableOpacity
                        key={mId}
                        onPress={() => setSelectedMemberId(mId)}
                        className={`px-4 py-2.5 rounded-2xl border ${isSel ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-200'}`}
                      >
                        <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-700'}`}>{mName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={handleConfirmAssignPlan}
              disabled={assigning || assignedMembers.length === 0}
              className="bg-emerald-600 py-3.5 rounded-xl items-center"
            >
              {assigning ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-sm">Confirm Diet Assignment 🥗</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setAssignModalVisible(false)} className="py-3 items-center mt-1">
              <Text className="text-slate-400 font-bold text-xs">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TrainerDietPlanScreen;
