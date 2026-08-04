import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const TrainerCreateWorkoutPlanScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const { preselectedMemberId } = route.params || {};

  const [clients, setClients] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [day, setDay] = useState('Monday');
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('4');
  const [reps, setReps] = useState('10');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchClients = useCallback(async () => {
    try {
      const gymId = user?.gym_id || (typeof user?.gym_id === 'object' ? (user?.gym_id as any)?._id : null) || '66810a6bb8c4d284724b01ab';
      const res = await client.get(`/members/gym/${gymId}`);
      const allMembers = Array.isArray(res.data) ? res.data : [];
      const trainerIdStr = (user?.id || user?._id || '').toString();

      const myClients = allMembers.filter((m: any) => {
        const trainerObj = m.assigned_trainer_id;
        const assignedId = (typeof trainerObj === 'object' ? trainerObj?._id || trainerObj?.id : trainerObj || '').toString();
        return assignedId === trainerIdStr;
      });

      setClients(myClients);
      if (preselectedMemberId) {
        setSelectedMemberId(preselectedMemberId);
      } else if (myClients.length > 0) {
        setSelectedMemberId(myClients[0]._id || myClients[0].id);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, [user, preselectedMemberId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSaveExercise = async () => {
    if (!selectedMemberId || !exercise.trim()) return;
    setSubmitting(true);
    setSuccessMsg('');
    try {
      await client.post('/workout-plans', {
        member_id: selectedMemberId,
        day,
        exercise: exercise.trim(),
        sets: parseInt(sets, 10) || 4,
        reps: parseInt(reps, 10) || 10,
        notes: notes.trim(),
      });

      setSuccessMsg('Workout exercise added & assigned!');
      setExercise('');
      setNotes('');
    } catch (err) {
      console.error('Error assigning workout exercise:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}>

        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-3">
          <Text className="text-indigo-600 font-bold text-sm">‹ Back</Text>
        </TouchableOpacity>

        <View className="mb-4">
          <Text className="text-2xl font-black text-[#1F2937]">Create Workout Exercise</Text>
          <Text className="text-xs text-slate-500 mt-0.5">Assign exercise routine items to client</Text>
        </View>

        {successMsg ? (
          <View className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-4">
            <Text className="text-emerald-800 text-xs font-bold">{successMsg}</Text>
          </View>
        ) : null}

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <View className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            
            {/* Select Client */}
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Client *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {clients.map((c) => {
                    const cName = c.user_id?.name || c.name || 'Client';
                    const cId = c._id || c.id;
                    const isSel = selectedMemberId === cId;
                    return (
                      <TouchableOpacity
                        key={cId}
                        onPress={() => setSelectedMemberId(cId)}
                        className={`px-3.5 py-2 rounded-xl border ${isSel ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
                      >
                        <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-700'}`}>{cName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Target Day */}
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Day of Week *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setDay(d)}
                      className={`px-3 py-1.5 rounded-full border ${day === d ? 'bg-slate-800 border-slate-800' : 'bg-slate-100 border-slate-200'}`}
                    >
                      <Text className={`text-[10px] font-bold ${day === d ? 'text-white' : 'text-slate-600'}`}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Exercise Name */}
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Exercise Name *</Text>
              <TextInput
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm"
                placeholder="e.g. Incline Dumbbell Press"
                value={exercise}
                onChangeText={setExercise}
              />
            </View>

            {/* Sets & Reps */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sets *</Text>
                <TextInput
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm"
                  placeholder="4"
                  keyboardType="numeric"
                  value={sets}
                  onChangeText={setSets}
                />
              </View>

              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reps *</Text>
                <TextInput
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm"
                  placeholder="10"
                  keyboardType="numeric"
                  value={reps}
                  onChangeText={setReps}
                />
              </View>
            </View>

            {/* Form Notes */}
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Form Notes / Cue</Text>
              <TextInput
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm"
                placeholder="e.g. Focus on chest stretch at bottom"
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <TouchableOpacity
              onPress={handleSaveExercise}
              disabled={submitting}
              className="bg-[#4F46E5] py-3.5 rounded-xl items-center mt-2"
            >
              {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-sm">Assign Exercise to Client</Text>}
            </TouchableOpacity>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default TrainerCreateWorkoutPlanScreen;
