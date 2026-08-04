import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import OwnerMemberListScreen from '../screens/owner/OwnerMemberListScreen';
import OwnerMemberDetailScreen from '../screens/owner/OwnerMemberDetailScreen';
import OwnerPendingSignupsScreen from '../screens/owner/OwnerPendingSignupsScreen';
import OwnerPaymentListScreen from '../screens/owner/OwnerPaymentListScreen';
import OwnerPlanListScreen from '../screens/owner/OwnerPlanListScreen';
import OwnerStaffListScreen from '../screens/owner/OwnerStaffListScreen';
import OwnerClassScheduleScreen from '../screens/owner/OwnerClassScheduleScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MembersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MemberList" component={OwnerMemberListScreen} />
    <Stack.Screen name="MemberDetail" component={OwnerMemberDetailScreen} />
    <Stack.Screen name="PendingSignups" component={OwnerPendingSignupsScreen} />
  </Stack.Navigator>
);

const PaymentsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OwnerPayments" component={OwnerPaymentListScreen} />
    <Stack.Screen name="OwnerPlans" component={OwnerPlanListScreen} />
  </Stack.Navigator>
);

const StaffStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OwnerStaff" component={OwnerStaffListScreen} />
    <Stack.Screen name="OwnerClasses" component={OwnerClassScheduleScreen} />
  </Stack.Navigator>
);

const OwnerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={OwnerDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="MembersTab"
        component={MembersStack}
        options={{
          tabBarLabel: 'Members',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="PaymentsTab"
        component={PaymentsStack}
        options={{
          tabBarLabel: 'Payments',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>💳</Text>,
        }}
      />
      <Tab.Screen
        name="StaffTab"
        component={StaffStack}
        options={{
          tabBarLabel: 'Staff',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👨‍🏫</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export default OwnerNavigator;
