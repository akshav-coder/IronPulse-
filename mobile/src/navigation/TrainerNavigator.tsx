import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TrainerDashboardScreen from '../screens/trainer/TrainerDashboardScreen';
import TrainerMemberListScreen from '../screens/trainer/TrainerMemberListScreen';
import TrainerMemberDetailScreen from '../screens/trainer/TrainerMemberDetailScreen';
import TrainerWorkoutPlanScreen from '../screens/trainer/TrainerWorkoutPlanScreen';
import TrainerCreateWorkoutPlanScreen from '../screens/trainer/TrainerCreateWorkoutPlanScreen';
import TrainerDietPlanScreen from '../screens/trainer/TrainerDietPlanScreen';
import TrainerCreateDietPlanScreen from '../screens/trainer/TrainerCreateDietPlanScreen';

const Stack = createNativeStackNavigator();

const ClientsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TrainerClientList" component={TrainerMemberListScreen} />
    <Stack.Screen name="TrainerClientDetail" component={TrainerMemberDetailScreen} />
  </Stack.Navigator>
);

const WorkoutsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TrainerWorkoutList" component={TrainerWorkoutPlanScreen} />
    <Stack.Screen name="CreateWorkoutPlan" component={TrainerCreateWorkoutPlanScreen} />
  </Stack.Navigator>
);

const DietsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TrainerDietList" component={TrainerDietPlanScreen} />
    <Stack.Screen name="CreateDietPlan" component={TrainerCreateDietPlanScreen} />
  </Stack.Navigator>
);

const TrainerNavigator = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'workouts' | 'diets'>('dashboard');
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <TrainerDashboardScreen
            navigation={{
              navigate: (screen: string, params?: any) => {
                if (screen === 'TrainerClientsTab') {
                  setActiveTab('clients');
                } else if (screen === 'TrainerWorkouts') {
                  setActiveTab('workouts');
                } else if (screen === 'TrainerDiets') {
                  setActiveTab('diets');
                }
              },
            }}
          />
        )}
        {activeTab === 'clients' && <ClientsStack />}
        {activeTab === 'workouts' && <WorkoutsStack />}
        {activeTab === 'diets' && <DietsStack />}
      </View>

      {/* Safe Area Dynamic Bottom Tab Bar */}
      <View
        style={{
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
        }}
      >
        <View className="flex-row py-2 px-3 justify-around items-center">
          <TouchableOpacity
            onPress={() => setActiveTab('dashboard')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-lg">🏋️‍♂️</Text>
            <Text className={`text-[10px] font-bold mt-0.5 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('clients')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-lg">👥</Text>
            <Text className={`text-[10px] font-bold mt-0.5 ${activeTab === 'clients' ? 'text-indigo-600' : 'text-slate-400'}`}>
              My Clients
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('workouts')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-lg">💪</Text>
            <Text className={`text-[10px] font-bold mt-0.5 ${activeTab === 'workouts' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Workouts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('diets')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-lg">🥗</Text>
            <Text className={`text-[10px] font-bold mt-0.5 ${activeTab === 'diets' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Diet Plans
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default TrainerNavigator;
