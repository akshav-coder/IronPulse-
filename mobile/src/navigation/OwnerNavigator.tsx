import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import OwnerMemberListScreen from '../screens/owner/OwnerMemberListScreen';
import OwnerMemberDetailScreen from '../screens/owner/OwnerMemberDetailScreen';
import OwnerPendingSignupsScreen from '../screens/owner/OwnerPendingSignupsScreen';
import OwnerPaymentListScreen from '../screens/owner/OwnerPaymentListScreen';
import OwnerPlanListScreen from '../screens/owner/OwnerPlanListScreen';
import OwnerStaffListScreen from '../screens/owner/OwnerStaffListScreen';
import OwnerClassScheduleScreen from '../screens/owner/OwnerClassScheduleScreen';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'payments' | 'staff'>('dashboard');

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <OwnerDashboardScreen
            navigation={{
              navigate: (screen: string, params?: any) => {
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
      </View>

      {/* Custom Bottom Tab Bar */}
      <SafeAreaView style={{ backgroundColor: '#FFFFFF' }}>
        <View className="flex-row border-t border-slate-200 bg-white py-2 px-3 justify-around items-center">
          <TouchableOpacity
            onPress={() => setActiveTab('dashboard')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-lg">📊</Text>
            <Text className={`text-[10px] font-bold mt-0.5 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('members')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-lg">👥</Text>
            <Text className={`text-[10px] font-bold mt-0.5 ${activeTab === 'members' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Members
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('payments')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-lg">💳</Text>
            <Text className={`text-[10px] font-bold mt-0.5 ${activeTab === 'payments' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Payments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('staff')}
            className="items-center py-1 flex-1"
          >
            <Text className="text-lg">👨‍🏫</Text>
            <Text className={`text-[10px] font-bold mt-0.5 ${activeTab === 'staff' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Staff
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default OwnerNavigator;
