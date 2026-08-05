import React, { useState } from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabBar, { TabItem } from '../components/BottomTabBar';

import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import OwnerMemberListScreen from '../screens/owner/OwnerMemberListScreen';
import OwnerMemberDetailScreen from '../screens/owner/OwnerMemberDetailScreen';
import OwnerPendingSignupsScreen from '../screens/owner/OwnerPendingSignupsScreen';
import OwnerPaymentListScreen from '../screens/owner/OwnerPaymentListScreen';
import OwnerPlanListScreen from '../screens/owner/OwnerPlanListScreen';
import OwnerStaffListScreen from '../screens/owner/OwnerStaffListScreen';
import OwnerClassScheduleScreen from '../screens/owner/OwnerClassScheduleScreen';
import TrainerScanQRScreen from '../screens/trainer/TrainerScanQRScreen';
import LeaderboardScreen from '../screens/shared/LeaderboardScreen';
import { navigate as navigateRef } from './navigationRef';

const Stack = createNativeStackNavigator();

// Every screen is registered ONCE in a single, always-mounted Stack.Navigator
// (see MemberNavigator.tsx for why — a nested Stack.Navigator rendered as a
// free-floating component instead of an actual Stack.Screen throws
// "Couldn't find a navigation context" the moment you navigate into it).
type Section = 'dashboard' | 'members' | 'payments' | 'staff' | 'scan';

const SECTION_HOME_SCREEN: Record<Section, string> = {
  dashboard: 'OwnerDashboard',
  members: 'MemberList',
  payments: 'OwnerPayments',
  staff: 'OwnerStaff',
  scan: 'OwnerScanQR',
};

const TAB_ITEMS: TabItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'members', label: 'Members', icon: '👥' },
  { key: 'payments', label: 'Payments', icon: '💳' },
  { key: 'staff', label: 'Staff', icon: '👨‍🏫' },
  { key: 'scan', label: 'Scan QR', icon: '📷' },
];

const OwnerNavigator = () => {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  const goToSection = (section: Section) => {
    setActiveSection(section);
    navigateRef(SECTION_HOME_SCREEN[section]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
          <Stack.Screen name="MemberList" component={OwnerMemberListScreen} />
          <Stack.Screen name="MemberDetail" component={OwnerMemberDetailScreen} />
          <Stack.Screen name="PendingSignups" component={OwnerPendingSignupsScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="OwnerPayments" component={OwnerPaymentListScreen} />
          <Stack.Screen name="OwnerPlans" component={OwnerPlanListScreen} />
          <Stack.Screen name="OwnerStaff" component={OwnerStaffListScreen} />
          <Stack.Screen name="OwnerClasses" component={OwnerClassScheduleScreen} />
          <Stack.Screen name="OwnerScanQR" component={TrainerScanQRScreen} />
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

export default OwnerNavigator;
