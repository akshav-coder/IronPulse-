import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import client from '../../api/client';

const RESULT_DISPLAY_MS = 5000;

type MemberSummary = {
  name: string;
  email?: string;
  phone?: string;
  plan_name?: string;
};

type ScanResult = {
  status: 'success' | 'info' | 'error';
  message: string;
  member?: MemberSummary;
};

const TrainerScanQRScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const paused = result !== null;
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const handleBarcodeScanned = useCallback(async ({ data }: BarcodeScanningResult) => {
    if (processing || paused) return;
    setProcessing(true);

    try {
      const res = await client.post('/attendance/scan', { token: data });
      setResult({
        status: 'success',
        message: `${res.data?.member?.name || 'Member'} checked in successfully`,
        member: res.data?.member,
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Could not process this QR code';
      const alreadyCheckedIn = message.toLowerCase().includes('already checked in');
      setResult({
        status: alreadyCheckedIn ? 'info' : 'error',
        message,
        member: err?.response?.data?.member,
      });
    } finally {
      setProcessing(false);
      resumeTimerRef.current = setTimeout(() => setResult(null), RESULT_DISPLAY_MS);
    }
  }, [processing, paused]);

  if (!permission) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }} className="items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-slate-700 text-sm text-center mb-4">
            Camera access is needed to scan member QR codes for check-in.
          </Text>
          <TouchableOpacity onPress={requestPermission} className="bg-indigo-600 rounded-full px-6 py-3">
            <Text className="text-white font-bold text-sm">Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#000000' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }}>
        <Text className="text-2xl font-black text-white">Scan to Check In</Text>
        <Text className="text-xs text-slate-300 mt-0.5">Point the camera at the member's QR code</Text>
      </View>

      <View className="flex-1 mx-5 mb-5 rounded-3xl overflow-hidden border border-slate-700">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={processing || paused ? undefined : handleBarcodeScanned}
        />

        {processing && (
          <View className="absolute inset-0 items-center justify-center bg-black/60">
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text className="text-white font-bold text-sm mt-3">Processing scan...</Text>
          </View>
        )}

        {!processing && result && (
          <View className="absolute inset-0 items-center justify-center bg-black/75 px-6">
            <View
              className={`w-full rounded-3xl p-6 items-center ${
                result.status === 'success'
                  ? 'bg-emerald-50 border border-emerald-200'
                  : result.status === 'info'
                  ? 'bg-amber-50 border border-amber-200'
                  : 'bg-rose-50 border border-rose-200'
              }`}
            >
              <Text className="text-3xl mb-2">
                {result.status === 'success' ? '✅' : result.status === 'info' ? 'ℹ️' : '⚠️'}
              </Text>

              {result.member?.name && (
                <Text className="text-xl font-extrabold text-slate-800 text-center">{result.member.name}</Text>
              )}
              {result.member?.plan_name && (
                <View className="mt-2 px-3.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                  <Text className="text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                    {result.member.plan_name}
                  </Text>
                </View>
              )}

              <Text
                className={`font-semibold text-sm text-center mt-3 ${
                  result.status === 'success'
                    ? 'text-emerald-700'
                    : result.status === 'info'
                    ? 'text-amber-700'
                    : 'text-rose-600'
                }`}
              >
                {result.message}
              </Text>

              <Text className="text-[10px] text-slate-400 mt-4">Resuming camera in a few seconds...</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default TrainerScanQRScreen;
