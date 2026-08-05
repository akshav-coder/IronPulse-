import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const MemberProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkOutStatus, setCheckOutStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);

  const fetchProfileData = useCallback(async () => {
    try {
      const profileRes = await client.get('/members/profile/me').catch(() => null);
      const memberObj = profileRes?.data || null;
      setProfile(memberObj);

      const gymId = user?.gym_id || (typeof user?.gym_id === 'object' ? (user?.gym_id as any)?._id : null) || '66810a6bb8c4d284724b01ab';
      const paymentsRes = await client.get(`/payments/gym/${gymId}`).catch(() => ({ data: [] }));
      const allPayments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];

      const memberUserId = user?.id || user?._id;
      const myPayments = allPayments.filter((p: any) => {
        const pUserId = p.user_id?._id || p.user_id;
        return pUserId && memberUserId && pUserId.toString() === memberUserId.toString();
      });

      setPayments(myPayments);

      const statusRes = await client.get('/attendance/status-self').catch(() => ({ data: { checkedIn: false } }));
      setCheckedIn(!!statusRes.data?.checkedIn);
    } catch (err) {
      console.error('Error fetching member profile:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handleCheckOut = async () => {
    if (!checkedIn) return;
    setCheckingOut(true);
    setCheckOutStatus(null);
    try {
      await client.put('/attendance/check-out-self');
      setCheckedIn(false);
      setCheckOutStatus({ type: 'success', message: 'Checked out successfully. See you next time!' });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Could not check out right now';
      setCheckOutStatus({ type: 'error', message });
    } finally {
      setCheckingOut(false);
    }
  };

  const name = user?.name || profile?.user_id?.name || 'Gym Athlete';
  const email = user?.email || profile?.user_id?.email || '';
  const phone = (user as any)?.phone || profile?.user_id?.phone || 'Not provided';
  const planName = profile?.plan_name || profile?.membership_plan || 'Active Membership';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
      >
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-black text-[#1F2937]">Profile & Account</Text>
          <Text className="text-xs text-slate-500 mt-0.5">Membership details & receipt history</Text>
        </View>

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <View className="space-y-4">

            {/* Profile Avatar Card */}
            <View className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm items-center">
              <View className="w-20 h-20 rounded-full bg-indigo-600 items-center justify-center mb-3 shadow-md shadow-indigo-600/30">
                <Text className="text-white text-3xl font-black">{name.charAt(0).toUpperCase()}</Text>
              </View>

              <Text className="text-xl font-extrabold text-slate-800 text-center">{name}</Text>
              <Text className="text-xs text-slate-400 mt-0.5">{email}</Text>
              <Text className="text-xs text-slate-400 mt-0.5">📞 {phone}</Text>

              <View className="mt-3 px-3.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                <Text className="text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                  Member • {planName}
                </Text>
              </View>
            </View>

            {/* QR Check-in Entry Point */}
            <TouchableOpacity
              onPress={() => navigation.navigate('MemberQRCode')}
              className="bg-indigo-600 rounded-2xl py-4 items-center shadow-sm active:bg-indigo-700 flex-row justify-center"
            >
              <Text className="text-white font-bold text-sm">📱  Show My Check-In QR Code</Text>
            </TouchableOpacity>

            {/* Self Check-Out */}
            <View className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {checkedIn ? "You're currently checked in" : 'Not checked in right now'}
              </Text>
              <TouchableOpacity
                onPress={handleCheckOut}
                disabled={!checkedIn || checkingOut}
                className={`rounded-2xl py-3.5 items-center flex-row justify-center border ${
                  checkedIn ? 'bg-slate-50 border-slate-200 active:bg-slate-100' : 'bg-slate-50 border-slate-100 opacity-40'
                }`}
              >
                {checkingOut ? (
                  <ActivityIndicator color="#4F46E5" />
                ) : (
                  <Text className="text-slate-800 font-bold text-sm">✅  Check Out Now</Text>
                )}
              </TouchableOpacity>
              {checkOutStatus && (
                <Text
                  className={`text-xs text-center mt-2.5 ${
                    checkOutStatus.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {checkOutStatus.message}
                </Text>
              )}
              <Text className="text-[10px] text-slate-400 text-center mt-2">
                Forgot to check out? We'll automatically close your session at the end of the day.
              </Text>
            </View>

            {/* Payment Receipts History */}
            <View className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payment & Receipt History</Text>

              {payments.length === 0 ? (
                <Text className="text-slate-400 text-xs py-3 text-center">No payment receipts logged yet.</Text>
              ) : (
                <View className="space-y-2">
                  {payments.map((item, idx) => (
                    <View key={idx} className="bg-slate-50 p-3 rounded-xl flex-row justify-between items-center">
                      <View>
                        <Text className="font-bold text-slate-800 text-xs">{item.plan_name || 'Membership Renewal'}</Text>
                        <Text className="text-slate-400 text-[10px] uppercase mt-0.5">{item.payment_method || 'Cash / Online'}</Text>
                      </View>
                      <Text className="text-emerald-700 font-extrabold text-xs">
                        ₹{(item.amount || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity
              onPress={logout}
              className="bg-white border border-slate-200 rounded-2xl py-3.5 items-center shadow-sm active:bg-slate-50 mt-2"
            >
              <Text className="text-rose-600 font-bold text-sm">Sign Out of Account</Text>
            </TouchableOpacity>

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MemberProfileScreen;
