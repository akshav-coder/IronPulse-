import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const toIdString = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return (val._id || val.id || val.user_id || '').toString();
  }
  return String(val);
};

const TrainerCreateDietPlanScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const { preselectedMemberId } = route.params || {};

  const [clients, setClients] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [mealName, setMealName] = useState('Breakfast');
  const [foodItems, setFoodItems] = useState('');
  const [calories, setCalories] = useState('450');
  const [protein, setProtein] = useState('30');
  const [carbs, setCarbs] = useState('45');
  const [fats, setFats] = useState('10');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchClients = useCallback(async () => {
    try {
      const gymId = user?.gym_id || (typeof user?.gym_id === 'object' ? (user?.gym_id as any)?._id : null) || '66810a6bb8c4d284724b01ab';
      const res = await client.get(`/members/gym/${gymId}`);
      const allMembers = Array.isArray(res.data) ? res.data : [];
      const trainerIdStr = toIdString(user);

      const myClients = allMembers.filter((m: any) => {
        const assignedId = toIdString(m.assigned_trainer_id);
        return assignedId && trainerIdStr && assignedId === trainerIdStr;
      });

      setClients(myClients);
      if (preselectedMemberId) {
        setSelectedMemberId(preselectedMemberId);
      } else if (myClients.length > 0) {
        setSelectedMemberId(myClients[0]._id || myClients[0].id);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, [user, preselectedMemberId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSaveMeal = async () => {
    if (!selectedMemberId || !foodItems.trim()) return;
    setSubmitting(true);
    setSuccessMsg('');
    try {
      await client.post('/diet-plans', {
        member_id: selectedMemberId,
        meal_name: mealName,
        food_items: foodItems.trim(),
        calories: parseInt(calories, 10) || 300,
        protein: parseInt(protein, 10) || 20,
        carbs: parseInt(carbs, 10) || 30,
        fats: parseInt(fats, 10) || 10,
        notes: notes.trim(),
      });

      setSuccessMsg('Meal plan item added & assigned!');
      setFoodItems('');
      setNotes('');
    } catch (err) {
      console.error('Error assigning meal plan:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}>

        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-3">
          <Text className="text-emerald-700 font-bold text-sm">‹ Back</Text>
        </TouchableOpacity>

        <View className="mb-4">
          <Text className="text-2xl font-black text-[#1F2937]">Create Diet Meal</Text>
          <Text className="text-xs text-slate-500 mt-0.5">Assign nutrition & macro targets to client</Text>
        </View>

        {successMsg ? (
          <View className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-4">
            <Text className="text-emerald-800 text-xs font-bold">{successMsg}</Text>
          </View>
        ) : null}

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : (
          <View className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            
            {/* Select Client */}
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Client *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {clients.map((c) => {
                    const cName = c.user_id?.name || c.name || 'Client';
                    const cId = c._id || c.id;
                    const isSel = selectedMemberId === cId;
                    return (
                      <TouchableOpacity
                        key={cId}
                        onPress={() => setSelectedMemberId(cId)}
                        className={`px-3.5 py-2 rounded-xl border ${isSel ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-200'}`}
                      >
                        <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-700'}`}>{cName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Meal Type */}
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Meal Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner', 'Pre-Workout'].map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setMealName(m)}
                      className={`px-3 py-1.5 rounded-full border ${mealName === m ? 'bg-slate-800 border-slate-800' : 'bg-slate-100 border-slate-200'}`}
                    >
                      <Text className={`text-[10px] font-bold ${mealName === m ? 'text-white' : 'text-slate-600'}`}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Food Items */}
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Food Items & Portions *</Text>
              <TextInput
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm"
                placeholder="e.g. 4 Egg whites, 1 cup oats, 1 banana"
                value={foodItems}
                onChangeText={setFoodItems}
              />
            </View>

            {/* Macros */}
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Calories</Text>
                <TextInput
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                  placeholder="450"
                  keyboardType="numeric"
                  value={calories}
                  onChangeText={setCalories}
                />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Protein (g)</Text>
                <TextInput
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                  placeholder="30"
                  keyboardType="numeric"
                  value={protein}
                  onChangeText={setProtein}
                />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Carbs (g)</Text>
                <TextInput
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                  placeholder="45"
                  keyboardType="numeric"
                  value={carbs}
                  onChangeText={setCarbs}
                />
              </View>
            </View>

            {/* Meal Instructions */}
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Meal Notes / Instructions</Text>
              <TextInput
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm"
                placeholder="e.g. Consume 30 mins before workout"
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <TouchableOpacity
              onPress={handleSaveMeal}
              disabled={submitting}
              className="bg-emerald-600 py-3.5 rounded-xl items-center mt-2"
            >
              {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-sm">Assign Meal to Client</Text>}
            </TouchableOpacity>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default TrainerCreateDietPlanScreen;
