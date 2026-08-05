import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import OwnerMemberListScreen from '../screens/owner/OwnerMemberListScreen';
import OwnerMemberDetailScreen from '../screens/owner/OwnerMemberDetailScreen';
import OwnerPendingSignupsScreen from '../screens/owner/OwnerPendingSignupsScreen';
import OwnerPaymentListScreen from '../screens/owner/OwnerPaymentListScreen';
import OwnerPlanListScreen from '../screens/owner/OwnerPlanListScreen';
import OwnerStaffListScreen from '../screens/owner/OwnerStaffListScreen';
import OwnerClassScheduleScreen from '../screens/owner/OwnerClassScheduleScreen';
import TrainerScanQRScreen from '../screens/trainer/TrainerScanQRScreen';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'payments' | 'staff' | 'scan'>('dashboard');
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <OwnerDashboardScreen
            navigation={{
              navigate: (screen: string) => {
                if (screen === 'PendingSignups' || screen === 'MembersTab') {
                  setActiveTab('members');
                } else if (screen === 'PaymentsTab' || screen === 'OwnerPlans') {
                  setActiveTab('payments');
                } else if (screen === 'StaffTab' || screen === 'OwnerStaff') {
                  setActiveTab('staff');
                }
              },
            }}
          />
        )}
        {activeTab === 'members' && <MembersStack />}
        {activeTab === 'payments' && <PaymentsStack />}
        {activeTab === 'staff' && <StaffStack />}
        {activeTab === 'scan' && <TrainerScanQRScreen />}
      </View>

      {/* Safe Area Dynamic Bottom Tab Bar */}
      <View
        style={{
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
        }}
      >
        <View className="flex-row px-4 justify-around items-center">
          <TouchableOpacity
            onPress={() => setActiveTab('dashboard')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-2xl mb-1">📊</Text>
            <Text className={`text-xs font-extrabold ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('members')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-2xl mb-1">👥</Text>
            <Text className={`text-xs font-extrabold ${activeTab === 'members' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Members
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('payments')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-2xl mb-1">💳</Text>
            <Text className={`text-xs font-extrabold ${activeTab === 'payments' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Payments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('staff')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-2xl mb-1">👨‍🏫</Text>
            <Text className={`text-xs font-extrabold ${activeTab === 'staff' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Staff
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('scan')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-2xl mb-1">📷</Text>
            <Text className={`text-xs font-extrabold ${activeTab === 'scan' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Scan QR
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default OwnerNavigator;
