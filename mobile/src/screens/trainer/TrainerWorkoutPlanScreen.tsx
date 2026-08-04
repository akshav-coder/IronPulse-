import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_MASTER_PLANS = [
  {
    id: 'master-1',
    name: '6-Day Hypertrophy & Muscle Split',
    tag: 'Monday – Saturday',
    description: 'Structured 6-day split targeting specific muscle groups from Monday through Saturday.',
    daySubtitles: {
      Monday: 'Chest & Triceps Focus',
      Tuesday: 'Back & Biceps Focus',
      Wednesday: 'Legs & Abs Focus',
      Thursday: 'Shoulders & Arms Focus',
      Friday: 'Upper Body Hypertrophy',
      Saturday: 'Lower Body & Calves Focus',
    },
    exercises: [
      { day_of_week: 'Monday', exercise_name: 'Barbell Flat Bench Press', sets: 4, reps: 8 },
      { day_of_week: 'Monday', exercise_name: 'Triceps Cable Pushdown', sets: 3, reps: 12 },
      { day_of_week: 'Tuesday', exercise_name: 'Barbell Lat Rows', sets: 4, reps: 8 },
      { day_of_week: 'Tuesday', exercise_name: 'Dumbbell Bicep Curls', sets: 3, reps: 12 },
      { day_of_week: 'Wednesday', exercise_name: 'Barbell Back Squats', sets: 4, reps: 8 },
      { day_of_week: 'Wednesday', exercise_name: 'Leg Extension', sets: 3, reps: 12 },
      { day_of_week: 'Thursday', exercise_name: 'Overhead Military Press', sets: 4, reps: 8 },
      { day_of_week: 'Thursday', exercise_name: 'Lateral Deltoid Raises', sets: 3, reps: 12 },
      { day_of_week: 'Friday', exercise_name: 'Dumbbell Incline Bench Press', sets: 4, reps: 10 },
      { day_of_week: 'Friday', exercise_name: 'Seated Cable Rows', sets: 4, reps: 10 },
      { day_of_week: 'Saturday', exercise_name: 'Romanian Deadlifts', sets: 4, reps: 10 },
      { day_of_week: 'Saturday', exercise_name: 'Standing Calf Raises', sets: 4, reps: 15 },
    ],
  },
  {
    id: 'master-2',
    name: 'Beginner 6-Day Full Body & Conditioning',
    tag: 'Monday – Saturday',
    description: 'Balanced Monday to Saturday schedule alternating strength workouts and light recovery cardio.',
    daySubtitles: {
      Monday: 'Full Body Push/Pull',
      Tuesday: 'Cardio & Active Recovery',
      Wednesday: 'Legs & Shoulder Focus',
      Thursday: 'Core & Ab Conditioning',
      Friday: 'Deadlift & Strength Focus',
      Saturday: 'HIIT Cardio Burner',
    },
    exercises: [
      { day_of_week: 'Monday', exercise_name: 'Flat Bench Press', sets: 3, reps: 10 },
      { day_of_week: 'Monday', exercise_name: 'Goblet Squats', sets: 4, reps: 12 },
      { day_of_week: 'Tuesday', exercise_name: 'Treadmill Incline Walk', sets: 1, reps: 30 },
      { day_of_week: 'Wednesday', exercise_name: 'Lat Pulldowns', sets: 3, reps: 10 },
      { day_of_week: 'Wednesday', exercise_name: 'Overhead Dumbbell Press', sets: 3, reps: 12 },
      { day_of_week: 'Thursday', exercise_name: 'Core Planks Hold', sets: 3, reps: 15 },
      { day_of_week: 'Friday', exercise_name: 'Deadlifts', sets: 3, reps: 8 },
      { day_of_week: 'Friday', exercise_name: 'Push-Ups', sets: 3, reps: 15 },
      { day_of_week: 'Saturday', exercise_name: 'HIIT Cardio & Abs Circuit', sets: 4, reps: 20 },
    ],
  },
  {
    id: 'master-3',
    name: 'Fat Loss & Athletic Conditioning (Mon–Sat)',
    tag: 'Monday – Saturday',
    description: 'High burn 6-day conditioning routine designed for calorie burn and athletic endurance.',
    daySubtitles: {
      Monday: 'Kettlebell & HIIT Burn',
      Tuesday: 'Cardio & Bodyweight Split',
      Wednesday: 'Thrusters & Burpees Blitz',
      Thursday: 'Plyometrics & Ab Sculpting',
      Friday: 'Farmers Carry & Strength',
      Saturday: 'Endurance Circuit Burner',
    },
    exercises: [
      { day_of_week: 'Monday', exercise_name: 'Kettlebell Swings', sets: 4, reps: 15 },
      { day_of_week: 'Monday', exercise_name: 'Mountain Climbers', sets: 4, reps: 20 },
      { day_of_week: 'Tuesday', exercise_name: 'Jump Rope Circuit', sets: 4, reps: 30 },
      { day_of_week: 'Tuesday', exercise_name: 'Bodyweight Air Squats', sets: 4, reps: 15 },
      { day_of_week: 'Wednesday', exercise_name: 'Dumbbell Thrusters', sets: 4, reps: 12 },
      { day_of_week: 'Wednesday', exercise_name: 'Burpees', sets: 3, reps: 12 },
      { day_of_week: 'Thursday', exercise_name: 'Bicycle Crunches', sets: 4, reps: 20 },
      { day_of_week: 'Thursday', exercise_name: 'Box Jumps', sets: 3, reps: 10 },
      { day_of_week: 'Friday', exercise_name: 'Dumbbell Farmers Walk', sets: 4, reps: 15 },
      { day_of_week: 'Friday', exercise_name: 'Dumbbell Renegade Rows', sets: 3, reps: 12 },
      { day_of_week: 'Saturday', exercise_name: 'Full Body Burner Circuit', sets: 4, reps: 15 },
    ],
  },
];

const toIdString = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return (val._id || val.id || val.user_id || '').toString();
  }
  return String(val);
};

const TrainerWorkoutPlanScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'master' | 'assigned'>('master');

  const [masterPlans, setMasterPlans] = useState<any[]>(DEFAULT_MASTER_PLANS);
  const [assignedMembers, setAssignedMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Assign Modal State
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedPlanToAssign, setSelectedPlanToAssign] = useState<any>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Client Routine Inspector State
  const [inspectMemberId, setInspectMemberId] = useState<string>('');
  const [memberPlanItems, setMemberPlanItems] = useState<any[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const gymId = user?.gym_id || (typeof user?.gym_id === 'object' ? (user?.gym_id as any)?._id : null) || '66810a6bb8c4d284724b01ab';
      const res = await client.get(`/members/gym/${gymId}`);
      const allMembers = Array.isArray(res.data) ? res.data : [];
      const trainerIdStr = toIdString(user);

      const myClients = allMembers.filter((m: any) => {
        const assignedId = toIdString(m.assigned_trainer_id);
        return assignedId && trainerIdStr && assignedId === trainerIdStr;
      });

      setAssignedMembers(myClients);
      if (myClients.length > 0 && !selectedMemberId) {
        setSelectedMemberId(myClients[0]._id || myClients[0].id);
      }
    } catch (err) {
      console.error('Error fetching assigned members:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, selectedMemberId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  const handleOpenAssignModal = (plan: any) => {
    setSelectedPlanToAssign(plan);
    if (assignedMembers.length > 0) {
      setSelectedMemberId(assignedMembers[0]._id || assignedMembers[0].id);
    }
    setAssignModalVisible(true);
  };

  const handleConfirmAssignPlan = async () => {
    if (!selectedPlanToAssign || !selectedMemberId) return;
    setAssigning(true);
    setSuccessMsg('');
    try {
      const exercisesWithSubtitles = selectedPlanToAssign.exercises.map((ex: any) => ({
        ...ex,
        day_subtitle:
          ex.day_subtitle ||
          (selectedPlanToAssign.daySubtitles && selectedPlanToAssign.daySubtitles[ex.day_of_week]) ||
          'Workout Focus',
      }));

      await client.post('/workout-plans/assign-bulk', {
        member_id: selectedMemberId,
        exercises: exercisesWithSubtitles,
      });

      const clientObj = assignedMembers.find((m) => (m._id || m.id) === selectedMemberId);
      const clientName = clientObj?.user_id?.name || clientObj?.name || 'Client';

      setSuccessMsg(`Assigned "${selectedPlanToAssign.name}" to ${clientName}!`);
      setAssignModalVisible(false);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Error assigning workout plan:', err);
    } finally {
      setAssigning(false);
    }
  };

  const fetchMemberRoutine = async (memberId: string) => {
    setInspectMemberId(memberId);
    if (!memberId) return;
    setLoadingPlan(true);
    try {
      const res = await client.get(`/workout-plans/member/${memberId}`);
      setMemberPlanItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching member routine:', err);
    } finally {
      setLoadingPlan(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View className="flex-1 px-5 pt-4">

        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-black text-[#1F2937]">Workout Planner</Text>
            <Text className="text-xs text-slate-500 mt-0.5">Design & assign 6-day routines to clients</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateWorkoutPlan')}
            className="bg-[#4F46E5] px-3 py-2 rounded-xl shadow-sm"
          >
            <Text className="text-white text-xs font-bold">+ Custom Ex</Text>
          </TouchableOpacity>
        </View>

        {successMsg ? (
          <View className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl mb-4">
            <Text className="text-emerald-800 text-xs font-bold">✅ {successMsg}</Text>
          </View>
        ) : null}

        {/* Section Tabs */}
        <View className="flex-row bg-slate-200 p-1 rounded-2xl mb-4">
          <TouchableOpacity
            onPress={() => setActiveTab('master')}
            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'master' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-bold ${activeTab === 'master' ? 'text-indigo-600' : 'text-slate-500'}`}>
              Master Templates ({masterPlans.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('assigned')}
            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'assigned' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-bold ${activeTab === 'assigned' ? 'text-indigo-600' : 'text-slate-500'}`}>
              Client Routines
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: MASTER TEMPLATES */}
        {activeTab === 'master' && (
          <FlatList
            data={masterPlans}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
            renderItem={({ item }) => (
              <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-4 shadow-sm">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <View className="bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full self-start mb-1.5">
                      <Text className="text-indigo-700 text-[10px] font-bold uppercase tracking-wider">📅 {item.tag}</Text>
                    </View>
                    <Text className="font-extrabold text-slate-800 text-base">{item.name}</Text>
                  </View>
                </View>

                <Text className="text-slate-500 text-xs mb-3">{item.description}</Text>

                {/* Day-by-Day Roster */}
                <View className="bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-4 space-y-2">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Weekly Schedule Overview</Text>
                  {DAYS_OF_WEEK.map((day) => {
                    const dayExs = item.exercises.filter((ex: any) => ex.day_of_week === day);
                    const daySub = item.daySubtitles?.[day] || 'Workout Focus';

                    return (
                      <View key={day} className="flex-row justify-between items-center py-1 border-b border-slate-200/50 last:border-0">
                        <View className="flex-1 pr-2">
                          <Text className="text-xs font-bold text-slate-800">{day}</Text>
                          <Text className="text-[10px] text-indigo-600 font-semibold">{daySub}</Text>
                        </View>
                        <Text className="text-[10px] font-bold text-slate-400">{dayExs.length} Exercises</Text>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity
                  onPress={() => handleOpenAssignModal(item)}
                  className="bg-indigo-600 py-3 rounded-xl items-center shadow-sm"
                >
                  <Text className="text-white font-bold text-xs">Assign Plan to Client 👤</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* TAB 2: CLIENT ROUTINES INSPECTOR */}
        {activeTab === 'assigned' && (
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Client to Inspect Routine</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {assignedMembers.map((m) => {
                  const mName = m.user_id?.name || m.name || 'Client';
                  const mId = m._id || m.id;
                  const isSel = inspectMemberId === mId;

                  return (
                    <TouchableOpacity
                      key={mId}
                      onPress={() => fetchMemberRoutine(mId)}
                      className={`px-4 py-2 rounded-2xl border ${isSel ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
                    >
                      <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-700'}`}>{mName}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {loadingPlan ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
              </View>
            ) : !inspectMemberId ? (
              <View className="py-16 items-center">
                <Text className="text-slate-400 text-xs">Tap a client above to view their prescribed Monday–Saturday workout schedule.</Text>
              </View>
            ) : memberPlanItems.length === 0 ? (
              <View className="py-16 items-center">
                <Text className="text-slate-400 text-xs">No exercises assigned to this client yet.</Text>
              </View>
            ) : (
              <View className="space-y-3">
                {DAYS_OF_WEEK.map((day) => {
                  const dayExs = memberPlanItems.filter((ex) => (ex.day_of_week || 'Monday').toLowerCase() === day.toLowerCase());

                  return (
                    <View key={day} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                      <Text className="font-extrabold text-indigo-600 text-sm mb-2">📅 {day}</Text>
                      {dayExs.length === 0 ? (
                        <Text className="text-slate-400 text-xs italic">Rest / Active Recovery Day</Text>
                      ) : (
                        <View className="space-y-1.5">
                          {dayExs.map((ex, idx) => (
                            <View key={idx} className="bg-slate-50 p-2.5 rounded-xl flex-row justify-between items-center">
                              <Text className="font-bold text-slate-800 text-xs">{ex.exercise || ex.exercise_name}</Text>
                              <Text className="text-indigo-600 font-bold text-xs">{ex.sets || 3} sets × {ex.reps || 10} reps</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}

      </View>

      {/* ASSIGN PLAN MODAL */}
      <Modal visible={assignModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-bold text-slate-800 mb-1">Assign Workout Plan</Text>
            <Text className="text-xs text-indigo-600 font-semibold mb-4">{selectedPlanToAssign?.name}</Text>

            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Target Client *</Text>
            {assignedMembers.length === 0 ? (
              <Text className="text-amber-600 text-xs mb-4">No active clients assigned to your profile yet.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <View className="flex-row gap-2">
                  {assignedMembers.map((m) => {
                    const mName = m.user_id?.name || m.name || 'Client';
                    const mId = m._id || m.id;
                    const isSel = selectedMemberId === mId;

                    return (
                      <TouchableOpacity
                        key={mId}
                        onPress={() => setSelectedMemberId(mId)}
                        className={`px-4 py-2.5 rounded-2xl border ${isSel ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
                      >
                        <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-700'}`}>{mName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={handleConfirmAssignPlan}
              disabled={assigning || assignedMembers.length === 0}
              className="bg-[#4F46E5] py-3.5 rounded-xl items-center"
            >
              {assigning ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-sm">Confirm Plan Assignment 💪</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setAssignModalVisible(false)} className="py-3 items-center mt-1">
              <Text className="text-slate-400 font-bold text-xs">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TrainerWorkoutPlanScreen;
