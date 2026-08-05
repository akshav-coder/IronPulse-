import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import client from '../../api/client';

const screenWidth = Dimensions.get('window').width;

const MemberProgressScreen = ({ navigation }: any) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const profileRes = await client.get('/members/profile/me');
      const memberId = profileRes.data._id;
      const historyRes = await client.get(`/progress/member/${memberId}`);
      setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching progress history:', err);
      setError('Could not load your progress history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const chartData =
    history.length >= 2
      ? {
          labels: history.map((item) =>
            new Date(item.recorded_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          ),
          datasets: [{ data: history.map((item) => item.weight) }],
        }
      : null;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        {navigation?.goBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-2">
            <Text className="text-indigo-600 font-bold text-sm">← Back</Text>
          </TouchableOpacity>
        )}
        <Text className="text-2xl font-black text-[#1F2937]">Body Progress</Text>
        <Text className="text-xs text-slate-500 mt-0.5">Weight and measurements logged by your trainer</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
        >
          {error ? (
            <Text className="text-rose-600 text-xs text-center py-10">{error}</Text>
          ) : history.length === 0 ? (
            <View className="bg-white border border-slate-200 rounded-3xl p-8 items-center shadow-sm">
              <Text className="text-slate-400 text-xs text-center">
                No progress entries logged yet. Ask your trainer to record your first check-in.
              </Text>
            </View>
          ) : (
            <>
              {chartData && (
                <View className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm mb-4 items-center">
                  <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider self-start mb-2">
                    Weight Trend (kg)
                  </Text>
                  <LineChart
                    data={chartData}
                    width={screenWidth - 72}
                    height={200}
                    yAxisSuffix="kg"
                    chartConfig={{
                      backgroundColor: '#FFFFFF',
                      backgroundGradientFrom: '#FFFFFF',
                      backgroundGradientTo: '#FFFFFF',
                      decimalPlaces: 1,
                      color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                      propsForDots: { r: '4', strokeWidth: '2', stroke: '#4F46E5' },
                    }}
                    bezier
                    style={{ borderRadius: 16 }}
                  />
                </View>
              )}

              <View className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Entry History</Text>
                <View className="space-y-2.5">
                  {[...history].reverse().map((item) => (
                    <View key={item._id} className="bg-slate-50 rounded-xl p-3.5">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-slate-400 text-[10px] font-bold uppercase">
                          {new Date(item.recorded_date).toLocaleDateString()}
                        </Text>
                        <Text className="text-slate-800 font-extrabold text-sm">{item.weight} kg</Text>
                      </View>
                      {item.measurements ? (
                        <Text className="text-slate-500 text-[11px] mt-1.5">{item.measurements}</Text>
                      ) : null}
                      {item.notes ? <Text className="text-slate-400 text-[11px] mt-1">{item.notes}</Text> : null}
                      {item.trainer_id?.name ? (
                        <Text className="text-indigo-500 text-[10px] font-bold mt-1.5">
                          Logged by {item.trainer_id.name}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default MemberProgressScreen;
