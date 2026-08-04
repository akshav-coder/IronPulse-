import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }: any) => {
  const { login, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      // Error is stored in context and shown
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 py-12">
            
            {/* Header / Brand */}
            <View className="items-center mb-10">
              <View className="w-16 h-16 rounded-2xl bg-[#4F46E5] items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
                <Text className="text-white text-3xl font-black">IP</Text>
              </View>
              <Text className="text-3xl font-extrabold text-[#1F2937] tracking-wider">
                IRON PULSE
              </Text>
              <Text className="text-[#64748B] text-xs mt-1">
                Build strength. Track progress. Achieve goals.
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <Text className="text-red-700 text-xs font-semibold">{error}</Text>
              </View>
            )}

            {/* Form */}
            <View className="space-y-4">
              <View>
                <Text className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-2">Email Address</Text>
                <TextInput
                  className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-slate-800 text-sm"
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                />
              </View>

              <View>
                <Text className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-2">Password</Text>
                <TextInput
                  className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-slate-800 text-sm"
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  autoCapitalize="none"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className="bg-[#4F46E5] rounded-xl py-3.5 items-center justify-center shadow-lg shadow-indigo-500/20 mt-4 active:bg-[#4338CA]"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-sm">Sign In</Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mt-6">
                <Text className="text-xs text-[#64748B]">Don't have an account? </Text>
                <TouchableOpacity onPress={() => { setError(null); navigation.navigate('Register'); }}>
                  <Text className="text-xs font-bold text-[#4F46E5]">Register</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
