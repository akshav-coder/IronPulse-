import React, { useState } from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigate as navigateRef } from './navigationRef';
import BottomTabBar, { TabItem } from '../components/BottomTabBar';

import MemberDashboardScreen from '../screens/member/MemberDashboardScreen';
import MemberWorkoutPlanScreen from '../screens/member/MemberWorkoutPlanScreen';
import MemberWorkoutLogScreen from '../screens/member/MemberWorkoutLogScreen';
import MemberDietPlanScreen from '../screens/member/MemberDietPlanScreen';
import MemberMealLogScreen from '../screens/member/MemberMealLogScreen';
import MemberClassScheduleScreen from '../screens/member/MemberClassScheduleScreen';
import MemberFeedScreen from '../screens/member/MemberFeedScreen';
import MemberChatScreen from '../screens/member/MemberChatScreen';
import MemberProfileScreen from '../screens/member/MemberProfileScreen';
import MemberQRCodeScreen from '../screens/member/MemberQRCodeScreen';
import MemberProgressScreen from '../screens/member/MemberProgressScreen';
import LeaderboardScreen from '../screens/shared/LeaderboardScreen';

const Stack = createNativeStackNavigator();

// Every screen is registered ONCE in a single, always-mounted Stack.Navigator.
// A previous version conditionally mounted/unmounted whole Stack.Navigator
// instances (or swapped a shared navigator's screen set) based on tab state —
// react-navigation's internal NavigationStateContext expects a nested
// navigator to be registered as an actual Stack.Screen, not rendered as a
// free-floating component; doing otherwise throws "Couldn't find a
// navigation context" the moment you navigate to a sibling screen. The
// custom bottom tab bar below drives navigation via a ref instead of
// controlling which screens exist.
type Section = 'dashboard' | 'workouts' | 'diet' | 'classes' | 'feed' | 'chat' | 'profile';

const SECTION_HOME_SCREEN: Record<Section, string> = {
  dashboard: 'MemberDashboard',
  workouts: 'MemberWorkouts',
  diet: 'MemberDiet',
  classes: 'MemberClasses',
  feed: 'MemberFeed',
  chat: 'MemberChat',
  profile: 'MemberProfile',
};

const TAB_ITEMS: TabItem[] = [
  { key: 'dashboard', label: 'Hub', icon: '🔥' },
  { key: 'workouts', label: 'Workouts', icon: '💪' },
  { key: 'diet', label: 'Diet Plan', icon: '🥗', activeColor: 'text-emerald-600' },
  { key: 'classes', label: 'Classes', icon: '🎟️' },
  { key: 'feed', label: 'Feed', icon: '📰' },
  { key: 'chat', label: 'Chat', icon: '💬' },
  { key: 'profile', label: 'Profile', icon: '👤' },
];

const MemberNavigator = () => {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  const goToSection = (section: Section) => {
    setActiveSection(section);
    navigateRef(SECTION_HOME_SCREEN[section]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MemberDashboard" component={MemberDashboardScreen} />
          <Stack.Screen name="MemberWorkouts" component={MemberWorkoutPlanScreen} />
          <Stack.Screen name="MemberWorkoutLog" component={MemberWorkoutLogScreen} />
          <Stack.Screen name="MemberDiet" component={MemberDietPlanScreen} />
          <Stack.Screen name="MemberMealLog" component={MemberMealLogScreen} />
          <Stack.Screen name="MemberClasses" component={MemberClassScheduleScreen} />
          <Stack.Screen name="MemberFeed" component={MemberFeedScreen} />
          <Stack.Screen name="MemberChat" component={MemberChatScreen} />
          <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
          <Stack.Screen name="MemberQRCode" component={MemberQRCodeScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="MemberProgress" component={MemberProgressScreen} />
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

export default MemberNavigator;
