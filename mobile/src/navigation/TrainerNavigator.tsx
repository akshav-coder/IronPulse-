import React, { useState } from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabBar, { TabItem } from '../components/BottomTabBar';

import TrainerDashboardScreen from '../screens/trainer/TrainerDashboardScreen';
import TrainerMemberListScreen from '../screens/trainer/TrainerMemberListScreen';
import TrainerMemberDetailScreen from '../screens/trainer/TrainerMemberDetailScreen';
import TrainerWorkoutPlanScreen from '../screens/trainer/TrainerWorkoutPlanScreen';
import TrainerCreateWorkoutPlanScreen from '../screens/trainer/TrainerCreateWorkoutPlanScreen';
import TrainerDietPlanScreen from '../screens/trainer/TrainerDietPlanScreen';
import TrainerCreateDietPlanScreen from '../screens/trainer/TrainerCreateDietPlanScreen';
import TrainerScanQRScreen from '../screens/trainer/TrainerScanQRScreen';
import LeaderboardScreen from '../screens/shared/LeaderboardScreen';
import { navigate as navigateRef } from './navigationRef';

const Stack = createNativeStackNavigator();

// Every screen is registered ONCE in a single, always-mounted Stack.Navigator
// (see MemberNavigator.tsx for why — a nested Stack.Navigator rendered as a
// free-floating component instead of an actual Stack.Screen throws
// "Couldn't find a navigation context" the moment you navigate into it).
type Section = 'dashboard' | 'clients' | 'workouts' | 'diets' | 'scan';

const SECTION_HOME_SCREEN: Record<Section, string> = {
  dashboard: 'TrainerDashboard',
  clients: 'TrainerClientList',
  workouts: 'TrainerWorkoutList',
  diets: 'TrainerDietList',
  scan: 'TrainerScanQR',
};

const TAB_ITEMS: TabItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏋️‍♂️' },
  { key: 'clients', label: 'My Clients', icon: '👥' },
  { key: 'workouts', label: 'Workouts', icon: '💪' },
  { key: 'diets', label: 'Diet Plans', icon: '🥗' },
  { key: 'scan', label: 'Scan QR', icon: '📷' },
];

const TrainerNavigator = () => {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  const goToSection = (section: Section) => {
    setActiveSection(section);
    navigateRef(SECTION_HOME_SCREEN[section]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="TrainerDashboard" component={TrainerDashboardScreen} />
          <Stack.Screen name="TrainerClientList" component={TrainerMemberListScreen} />
          <Stack.Screen name="TrainerClientDetail" component={TrainerMemberDetailScreen} />
          <Stack.Screen name="CreateWorkoutPlan" component={TrainerCreateWorkoutPlanScreen} />
          <Stack.Screen name="CreateDietPlan" component={TrainerCreateDietPlanScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="TrainerWorkoutList" component={TrainerWorkoutPlanScreen} />
          <Stack.Screen name="TrainerDietList" component={TrainerDietPlanScreen} />
          <Stack.Screen name="TrainerScanQR" component={TrainerScanQRScreen} />
        </Stack.Navigator>
      </View>

      <BottomTabBar
        items={TAB_ITEMS}
        activeKey={activeSection}
        onSelect={(key) => goToSection(key as Section)}
      />
    </View>
  );
};

export default TrainerNavigator;
