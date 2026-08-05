import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MemberDietPlanScreen = ({ navigation }: any) => {
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [dietItems, setDietItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDietPlan = useCallback(async () => {
    try {
      const profileRes = await client.get('/members/profile/me').catch(() => null);
      const memberId = profileRes?.data?._id || profileRes?.data?.id;

      if (memberId) {
        const res = await client.get(`/diet-plans/member/${memberId}`).catch(() => ({ data: [] }));
        setDietItems(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Error fetching diet plan:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDietPlan();
  }, [fetchDietPlan]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDietPlan();
  };

  const dayMeals = dietItems.filter((m) => (m.day || m.day_of_week || 'Monday').toLowerCase() === selectedDay.toLowerCase());

  // Calculate day totals
  const totalCalories = dayMeals.reduce((acc, m) => acc + (parseInt(m.calories, 10) || 0), 0);
  const totalProtein = dayMeals.reduce((acc, m) => acc + (parseInt(m.protein, 10) || 0), 0);
  const totalCarbs = dayMeals.reduce((acc, m) => acc + (parseInt(m.carbs, 10) || 0), 0);
  const totalFats = dayMeals.reduce((acc, m) => acc + (parseInt(m.fat || m.fats, 10) || 0), 0);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />}
      >
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-black text-[#1F2937]">My Diet Plan</Text>
          <Text className="text-xs text-slate-500 mt-0.5">Prescribed daily meal schedule & nutrition targets</Text>
        </View>

        {/* Log Meal Entry Point */}
        <TouchableOpacity
          onPress={() => navigation.navigate('MemberMealLog')}
          className="bg-emerald-600 rounded-2xl py-4 items-center shadow-sm active:bg-emerald-700 flex-row justify-center mb-4"
        >
          <Text className="text-white font-bold text-sm">📝  Log a Meal</Text>
        </TouchableOpacity>

        {/* Day Selector Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {DAYS_OF_WEEK.map((d) => {
              const isSel = selectedDay === d;
              return (
                <TouchableOpacity
                  key={d}
                  onPress={() => setSelectedDay(d)}
                  className={`px-4 py-2.5 rounded-2xl border ${isSel ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-200'}`}
                >
                  <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-700'}`}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Macro Summary Card */}
        <View className="bg-emerald-600 rounded-3xl p-5 mb-4 shadow-md shadow-emerald-600/20">
          <Text className="text-emerald-200 text-xs font-bold uppercase tracking-wider">🥗 {selectedDay} Target Macro Summary</Text>
          <Text className="text-white text-3xl font-black mt-1">{totalCalories || 1800} <Text className="text-sm font-bold">kcal</Text></Text>

          <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-white/20">
            <View className="items-center">
              <Text className="text-emerald-100 text-[10px] uppercase font-bold">Protein</Text>
              <Text className="text-white text-sm font-black mt-0.5">{totalProtein || 120}g</Text>
            </View>
            <View className="items-center">
              <Text className="text-emerald-100 text-[10px] uppercase font-bold">Carbs</Text>
              <Text className="text-white text-sm font-black mt-0.5">{totalCarbs || 180}g</Text>
            </View>
            <View className="items-center">
              <Text className="text-emerald-100 text-[10px] uppercase font-bold">Fats</Text>
              <Text className="text-white text-sm font-black mt-0.5">{totalFats || 50}g</Text>
            </View>
          </View>
        </View>

        {/* Meals List */}
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : dayMeals.length === 0 ? (
          <View className="bg-white border border-slate-200 rounded-3xl p-8 items-center py-16 shadow-sm">
            <Text className="text-4xl mb-2">🍎</Text>
            <Text className="text-slate-800 font-extrabold text-base">Flexible Nutrition</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">No specific meal plan assigned for {selectedDay}. Follow your core daily calorie target!</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {dayMeals.map((item, idx) => (
              <View key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-row justify-between items-center">
                <View className="flex-1 pr-2">
                  <View className="bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full self-start mb-1">
                    <Text className="text-emerald-700 text-[10px] font-bold uppercase">{item.meal_name || 'Meal'}</Text>
                  </View>
                  <Text className="font-extrabold text-slate-800 text-sm">{item.food_items || 'Meal Item'}</Text>
                  {item.notes ? (
                    <Text className="text-slate-400 text-[10px] mt-0.5">{item.notes}</Text>
                  ) : null}
                </View>

                <View className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                  <Text className="text-slate-800 text-xs font-bold">{item.calories || 300} kcal</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MemberDietPlanScreen;
