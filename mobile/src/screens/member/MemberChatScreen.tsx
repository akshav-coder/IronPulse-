import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const POLL_INTERVAL_MS = 4000;

type Contact = { _id: string; name: string; specialty: string };

const MemberChatScreen = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [targetContact, setTargetContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const initChat = useCallback(async () => {
    try {
      const res = await client.get('/members/profile/me');
      const profile = res.data;
      const resolved: Contact[] = [];
      if (profile.assigned_trainer_id) {
        resolved.push({ ...profile.assigned_trainer_id, specialty: 'Personal Trainer' });
      }
      if (profile.assigned_dietitian_id) {
        resolved.push({ ...profile.assigned_dietitian_id, specialty: 'Dietitian Specialist' });
      }
      setContacts(resolved);
      if (resolved.length > 0) {
        setTargetContact(resolved[0]);
      } else {
        setError('No trainer or dietitian is currently assigned to your profile.');
      }
    } catch (err) {
      console.error('Error resolving chat contacts:', err);
      setError('Failed to load chat contact details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initChat();
  }, [initChat]);

  const fetchMessages = useCallback(async () => {
    if (!targetContact) return;
    try {
      const res = await client.get(`/messages/conversation/${targetContact._id}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
      await client.put(`/messages/read/${targetContact._id}`);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [targetContact]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !targetContact || sending) return;
    setSending(true);
    try {
      const res = await client.post('/messages', {
        receiver_id: targetContact._id,
        message_text: newMessage.trim(),
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const currentUserId = user?.id || user?._id;

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }} className="items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-3">💬</Text>
          <Text className="text-slate-800 font-extrabold text-base text-center">No Chat Available</Text>
          <Text className="text-slate-400 text-xs text-center mt-1">{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 }}>
        <Text className="text-2xl font-black text-[#1F2937]">Messages</Text>
        <Text className="text-xs text-slate-500 mt-0.5">Chat with your assigned trainer or dietitian</Text>
      </View>

      {contacts.length > 1 && (
        <View className="flex-row px-5 mb-2 gap-2">
          {contacts.map((c) => {
            const isActive = targetContact?._id === c._id && targetContact?.specialty === c.specialty;
            return (
              <TouchableOpacity
                key={`${c._id}-${c.specialty}`}
                onPress={() => setTargetContact(c)}
                className={`px-3.5 py-2 rounded-full border ${isActive ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
              >
                <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-600'}`}>{c.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View className="flex-1 mx-5 mb-3 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <View className="px-4 py-3 border-b border-slate-100 flex-row items-center">
            <View className="w-9 h-9 rounded-full bg-indigo-600 items-center justify-center mr-2.5">
              <Text className="text-white font-black text-xs">{targetContact?.name?.charAt(0) || 'U'}</Text>
            </View>
            <View>
              <Text className="font-bold text-slate-800 text-sm">{targetContact?.name}</Text>
              <Text className="text-indigo-500 text-[10px] font-bold uppercase">{targetContact?.specialty}</Text>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-slate-400 text-xs">Send a message to begin your conversation!</Text>
              </View>
            ) : (
              messages.map((m) => {
                const isMine = m.sender_id === currentUserId;
                return (
                  <View key={m._id} className={`mb-3 flex-row ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <View
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        isMine ? 'bg-indigo-600 rounded-br-sm' : 'bg-slate-100 rounded-bl-sm'
                      }`}
                    >
                      <Text className={`text-xs leading-relaxed ${isMine ? 'text-white' : 'text-slate-800'}`}>
                        {m.message_text}
                      </Text>
                      <Text className={`text-[9px] text-right mt-1 ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          <View className="flex-row items-center p-3 border-t border-slate-100">
            <TextInput
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-slate-800 text-sm mr-2"
              placeholder="Type your message..."
              placeholderTextColor="#94A3B8"
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={sending}
              className="bg-indigo-600 w-10 h-10 rounded-full items-center justify-center"
            >
              <Text className="text-white font-bold">➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MemberChatScreen;
