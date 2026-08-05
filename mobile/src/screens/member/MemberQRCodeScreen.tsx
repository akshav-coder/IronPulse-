import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import client from '../../api/client';

const REFRESH_INTERVAL_MS = 45 * 1000;

const MemberQRCodeScreen = ({ navigation }: any) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchToken = useCallback(async () => {
    try {
      const res = await client.get('/attendance/qr-token');
      setToken(res.data.token);
      setError(null);
    } catch (err) {
      console.error('Error fetching QR token:', err);
      setError('Could not load your QR code. Pull down to retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
    intervalRef.current = setInterval(fetchToken, REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchToken]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-2">
          <Text className="text-indigo-600 font-bold text-sm">← Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-black text-[#1F2937]">My QR Code</Text>
        <Text className="text-xs text-slate-500 mt-0.5">Show this to the front desk to check in or out</Text>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" />
        ) : error ? (
          <View className="items-center">
            <Text className="text-rose-600 text-sm text-center mb-3">{error}</Text>
            <TouchableOpacity
              onPress={() => {
                setLoading(true);
                fetchToken();
              }}
              className="bg-indigo-600 rounded-full px-5 py-2.5"
            >
              <Text className="text-white font-bold text-xs">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm items-center">
            {token && <QRCode value={token} size={220} color="#1F2937" backgroundColor="#FFFFFF" />}
            <Text className="text-[10px] text-slate-400 mt-4 text-center">
              Refreshes automatically every 45 seconds for security
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default MemberQRCodeScreen;
