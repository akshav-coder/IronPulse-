import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = ({ navigation }: any) => {
  const { register, error, setError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, phone.trim());
    } catch (err) {
      // Error is handled in AuthContext and shown via hooks
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
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-2xl bg-[#4F46E5] items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
                <Text className="text-white text-3xl font-black">IP</Text>
              </View>
              <Text className="text-3xl font-extrabold text-[#1F2937] tracking-wider">
                Create Account
              </Text>
              <Text className="text-[#64748B] text-xs mt-1">
                Register as a member at IronPulse Fitness Center
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
                <Text className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-2">Full Name *</Text>
                <TextInput
                  className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-slate-800 text-sm"
                  placeholder="John Doe"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setError(null);
                  }}
                />
              </View>

              <View>
                <Text className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-2">Email Address *</Text>
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
                <Text className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-2">Phone Number</Text>
                <TextInput
                  className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-slate-800 text-sm"
                  placeholder="+91 XXXXX XXXXX"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    setError(null);
                  }}
                />
              </View>

              <View>
                <Text className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-2">Password *</Text>
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
                onPress={handleRegister}
                disabled={loading}
                className="bg-[#4F46E5] rounded-xl py-3.5 items-center justify-center shadow-lg shadow-indigo-500/20 mt-4 active:bg-[#4338CA]"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-sm">Register</Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mt-6">
                <Text className="text-xs text-[#64748B]">Already have an account? </Text>
                <TouchableOpacity onPress={() => { setError(null); navigation.navigate('Login'); }}>
                  <Text className="text-xs font-bold text-[#4F46E5]">Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
