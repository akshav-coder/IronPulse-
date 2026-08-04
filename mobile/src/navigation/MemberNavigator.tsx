import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MemberDashboardScreen from '../screens/member/MemberDashboardScreen';
import MemberWorkoutPlanScreen from '../screens/member/MemberWorkoutPlanScreen';
import MemberDietPlanScreen from '../screens/member/MemberDietPlanScreen';
import MemberClassScheduleScreen from '../screens/member/MemberClassScheduleScreen';
import MemberProfileScreen from '../screens/member/MemberProfileScreen';

const Stack = createNativeStackNavigator();

const MemberNavigator = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workouts' | 'diet' | 'classes' | 'profile'>('dashboard');
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {activeTab === 'dashboard' && (
            <Stack.Screen name="MemberDashboard">
              {(props) => (
                <MemberDashboardScreen
                  {...props}
                  navigation={{
                    ...props.navigation,
                    navigate: (screen: string) => {
                      if (screen === 'Workouts') setActiveTab('workouts');
                      else if (screen === 'Diet') setActiveTab('diet');
                      else if (screen === 'Classes') setActiveTab('classes');
                      else if (screen === 'Profile') setActiveTab('profile');
                    },
                  }}
                />
              )}
            </Stack.Screen>
          )}

          {activeTab === 'workouts' && (
            <Stack.Screen name="MemberWorkouts" component={MemberWorkoutPlanScreen} />
          )}

          {activeTab === 'diet' && (
            <Stack.Screen name="MemberDiet" component={MemberDietPlanScreen} />
          )}

          {activeTab === 'classes' && (
            <Stack.Screen name="MemberClasses" component={MemberClassScheduleScreen} />
          )}

          {activeTab === 'profile' && (
            <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
          )}
        </Stack.Navigator>
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
        <View className="flex-row py-2 px-2 justify-around items-center">
          <TouchableOpacity
            onPress={() => setActiveTab('dashboard')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-lg">🔥</Text>
            <Text className={`text-[10px] font-bold mt-0.5 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Hub
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
            onPress={() => setActiveTab('diet')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-lg">🥗</Text>
            <Text className={`text-[10px] font-bold mt-0.5 ${activeTab === 'diet' ? 'text-emerald-600' : 'text-slate-400'}`}>
              Diet Plan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('classes')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-lg">🎟️</Text>
            <Text className={`text-[10px] font-bold mt-0.5 ${activeTab === 'classes' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Classes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('profile')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-lg">👤</Text>
            <Text className={`text-[10px] font-bold mt-0.5 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MemberNavigator;
