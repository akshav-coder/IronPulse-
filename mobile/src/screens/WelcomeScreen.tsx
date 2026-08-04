import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const WelcomeScreen = () => {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-1 justify-between px-6 py-12">
        
        {/* Empty placeholder header to balance spacing */}
        <View />

        {/* Welcome Card */}
        <View className="bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-sm items-center space-y-6">
          <View className="w-20 h-20 rounded-full bg-[#4F46E5] items-center justify-center shadow-lg shadow-indigo-500/20">
            <Text className="text-white text-3xl font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>

          <View className="items-center space-y-2">
            <Text className="text-2xl font-black text-[#1F2937] text-center">
              Welcome, {user?.name || 'User'}!
            </Text>
            
            <View className="flex-row items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
              <Text className="text-[#4F46E5] text-[10px] font-bold uppercase tracking-wider capitalize">
                {user?.role || 'Member'}
              </Text>
            </View>
          </View>

          <Text className="text-[#64748B] text-xs text-center leading-relaxed max-w-[240px]">
            Your session is verified successfully. Real dashboard views will be integrated shortly.
          </Text>
        </View>

        {/* Logout Button */}
        <View className="space-y-4">
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loading}
            className="border border-[#E2E8F0] bg-white rounded-xl py-3.5 items-center justify-center shadow-sm active:bg-slate-50"
          >
            {loading ? (
              <ActivityIndicator color="#4F46E5" />
            ) : (
              <Text className="text-[#1F2937] font-bold text-sm">Sign Out</Text>
            )}
          </TouchableOpacity>
          
          <Text className="text-center text-[10px] text-slate-400">
            IronPulse Fitness Center © 2026
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
