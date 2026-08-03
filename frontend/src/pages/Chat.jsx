import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Send, User, MessageCircle, Clock } from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const [targetUser, setTargetUser] = useState(null); // The other person in chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState([]); // For trainers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  const isTrainer = user?.role === 'trainer';
  const gymId = user?.gym_id;

  // 1. Resolve contact to chat with
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        if (isTrainer) {
          // Trainer: Get all members assigned to this trainer
          const res = await API.get(`/members/gym/${gymId}`);
          const assigned = res.data.filter(
            (m) => m.assigned_trainer_id?._id === user.id || m.assigned_trainer_id === user.id
          );
          setMembers(assigned);
          if (assigned.length > 0) {
            // Select first trainee by default
            setTargetUser(assigned[0].user_id);
          }
        } else {
          // Member: Resolve own profile to find assigned trainer or dietitian
          const res = await API.get('/members/profile/me');
          const myProfile = res.data;
          const contacts = [];
          if (myProfile.assigned_trainer_id) {
            contacts.push({ ...myProfile.assigned_trainer_id, specialty: 'Personal Trainer' });
          }
          if (myProfile.assigned_dietitian_id) {
            contacts.push({ ...myProfile.assigned_dietitian_id, specialty: 'Dietitian Specialist' });
          }

          setMembers(contacts);
          if (contacts.length > 0) {
            setTargetUser(contacts[0]);
          } else {
            setError('No trainer or dietitian is currently assigned to your profile.');
          }
        }
      } catch (err) {
        setError('Failed to load chat contact details');
      } finally {
        setLoading(false);
      }
    };

    if (gymId) {
      initChat();
    }
  }, [gymId, isTrainer, user.id]);

  // 2. Fetch conversation messages
  const fetchMessages = async () => {
    if (!targetUser) return;
    try {
      const res = await API.get(`/messages/conversation/${targetUser._id}`);
      setMessages(res.data);
      
      // Mark received messages as read
      await API.put(`/messages/read/${targetUser._id}`);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll messages every 4 seconds
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [targetUser]);

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !targetUser) return;

    try {
      const res = await API.post('/messages', {
        receiver_id: targetUser._id,
        message_text: newMessage.trim(),
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      alert('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading messenger panel...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full h-[calc(100vh-80px)] flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">
          IronPulse <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Messenger</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Instant messaging conversation channel between you and your assigned {isTrainer ? 'trainees' : 'trainer'}.
        </p>
      </div>

      {error && (
        <div className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 p-6 rounded-xl text-sm flex flex-col items-center gap-2 max-w-md text-center mx-auto mt-8">
          <MessageCircle size={32} className="opacity-70 animate-pulse" />
          <h4 className="font-bold text-slate-200">No Chat Active</h4>
          <p className="text-slate-500 text-xs">{error}</p>
        </div>
      )}

      {!error && targetUser && (
        <div className="flex-grow flex border border-slate-800 bg-slate-900 rounded-xl overflow-hidden shadow-xl min-h-0">
          {/* Trainees or Coaches List Sidebar */}
          {(isTrainer || members.length > 1) && (
            <div className="w-80 border-r border-slate-800 bg-slate-950/40 flex flex-col overflow-y-auto">
              <span className="p-4 block text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                {isTrainer ? 'Trainee Clients Roster' : 'Assigned Specialists'}
              </span>
              <div className="divide-y divide-slate-850">
                {members.map((m) => {
                  const contact = isTrainer ? m.user_id : m;
                  const active = targetUser?._id === contact?._id;
                  return (
                    <button
                      key={contact?._id || m._id}
                      onClick={() => setTargetUser(contact)}
                      className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                        active
                          ? 'bg-indigo-600/10 border-l-4 border-l-indigo-500'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-200 border border-slate-700">
                        {contact?.name ? contact.name.charAt(0) : 'C'}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-xs text-slate-200 truncate">{contact?.name}</h4>
                        <p className="text-[10px] text-indigo-400 truncate font-semibold">
                          {isTrainer ? m.plan_name : contact?.specialty || 'Coach'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat Feed */}
          <div className="flex-grow flex flex-col min-h-0 bg-slate-900">
            {/* Header info */}
            <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/20">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                {targetUser.name ? targetUser.name.charAt(0) : 'U'}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-200">{targetUser.name}</h4>
                <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                  {isTrainer ? 'Trainee Trainee' : 'Personal Coach'}
                </span>
              </div>
            </div>

            {/* Message Bubble list feed */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 min-h-0">
              {messages.length === 0 ? (
                <div className="h-full flex-center flex-col gap-2 text-slate-500 text-xs">
                  <MessageCircle size={24} className="opacity-50" />
                  <span>Send a message to begin your conversation!</span>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.sender_id === user.id;
                  return (
                    <div
                      key={m._id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-xl text-xs space-y-1 ${
                          isMine
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/10'
                            : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap font-medium">{m.message_text}</p>
                        <span
                          className={`block text-[9px] text-right font-medium ${
                            isMine ? 'text-indigo-200' : 'text-slate-500'
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Send Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/20 flex gap-3">
              <input
                type="text"
                className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
