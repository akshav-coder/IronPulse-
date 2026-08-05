import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client, { getMediaBaseUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const MemberFeedScreen = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const mediaBaseUrl = getMediaBaseUrl();

  const fetchPosts = useCallback(async () => {
    try {
      const res = await client.get('/posts');
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleLikeToggle = async (post: any) => {
    try {
      const endpoint = post.hasLiked ? `/posts/${post._id}/unlike` : `/posts/${post._id}/like`;
      const res = await client.post(endpoint);
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, hasLiked: res.data.liked, likeCount: res.data.likeCount } : p))
      );
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentDrafts[postId];
    if (!text?.trim()) return;
    try {
      const res = await client.post(`/posts/${postId}/comments`, { comment_text: text.trim() });
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, comments: [...p.comments, res.data] } : p)));
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleStartEditComment = (comment: any) => {
    setEditingCommentId(comment._id);
    setEditCommentText(comment.comment_text);
  };

  const handleSaveEditComment = async (commentId: string, postId: string) => {
    if (!editCommentText.trim()) return;
    try {
      const res = await client.put(`/posts/comments/${commentId}`, { comment_text: editCommentText.trim() });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, comments: p.comments.map((c: any) => (c._id === commentId ? res.data : c)) } : p
        )
      );
      setEditingCommentId(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to edit comment');
    }
  };

  const handleDeleteComment = (commentId: string, postId: string) => {
    Alert.alert('Delete comment?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await client.delete(`/posts/comments/${commentId}`);
            setPosts((prev) =>
              prev.map((p) => (p._id === postId ? { ...p, comments: p.comments.filter((c: any) => c._id !== commentId) } : p))
            );
          } catch (err) {
            console.error('Error deleting comment:', err);
          }
        },
      },
    ]);
  };

  const currentUserId = user?.id || user?._id;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <Text className="text-2xl font-black text-[#1F2937]">Gym Feed</Text>
        <Text className="text-xs text-slate-500 mt-0.5">Stories & announcements from your gym</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
        >
          {posts.length === 0 ? (
            <View className="bg-white border border-slate-200 rounded-3xl p-8 items-center shadow-sm">
              <Text className="text-slate-400 text-xs text-center">No updates posted yet.</Text>
            </View>
          ) : (
            <View className="space-y-4">
              {posts.map((post) => {
                const imageUri = post.image_url?.startsWith('http') ? post.image_url : `${mediaBaseUrl}${post.image_url}`;

                return (
                  <View key={post._id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                    {/* Header */}
                    <View className="p-4 flex-row items-center">
                      <View className="w-9 h-9 rounded-full bg-indigo-600 items-center justify-center mr-2.5">
                        <Text className="text-white font-black text-xs">{post.author_id?.name?.charAt(0) || 'U'}</Text>
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className="font-bold text-slate-800 text-xs mr-1.5">{post.author_id?.name}</Text>
                          <View
                            className={`px-1.5 py-0.5 rounded ${
                              post.author_role === 'owner' ? 'bg-amber-50 border border-amber-200' : 'bg-indigo-50 border border-indigo-200'
                            }`}
                          >
                            <Text
                              className={`text-[8px] font-bold uppercase ${
                                post.author_role === 'owner' ? 'text-amber-700' : 'text-indigo-700'
                              }`}
                            >
                              {post.author_role}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-slate-400 text-[10px] mt-0.5">
                          {new Date(post.created_date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    {/* Caption + Image */}
                    {post.caption ? <Text className="text-slate-700 text-xs px-4 pb-3 leading-relaxed">{post.caption}</Text> : null}
                    {post.image_url ? (
                      <Image source={{ uri: imageUri }} style={{ width: '100%', height: 220 }} resizeMode="cover" />
                    ) : null}

                    {/* Engagement bar */}
                    <View className="flex-row items-center px-4 py-3 border-t border-slate-100">
                      <TouchableOpacity onPress={() => handleLikeToggle(post)} className="flex-row items-center mr-5">
                        <Text className="text-base mr-1.5">{post.hasLiked ? '❤️' : '🤍'}</Text>
                        <Text className="text-xs font-semibold text-slate-600">
                          {post.likeCount} {post.likeCount === 1 ? 'Like' : 'Likes'}
                        </Text>
                      </TouchableOpacity>
                      <Text className="text-xs font-semibold text-slate-400">
                        💬 {post.comments?.length || 0} {post.comments?.length === 1 ? 'Comment' : 'Comments'}
                      </Text>
                    </View>

                    {/* Comments */}
                    <View className="bg-slate-50 px-4 py-3">
                      {post.comments?.map((comment: any) => {
                        const isCommentAuthor = currentUserId && comment.user_id?._id === currentUserId;
                        return (
                          <View key={comment._id} className="mb-2.5">
                            <View className="flex-row items-start justify-between">
                              <View className="flex-1 pr-2">
                                <Text className="text-slate-700 text-[11px] font-bold">{comment.user_id?.name}</Text>
                                {editingCommentId === comment._id ? (
                                  <View className="flex-row items-center mt-1">
                                    <TextInput
                                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-[11px] mr-2"
                                      value={editCommentText}
                                      onChangeText={setEditCommentText}
                                    />
                                    <TouchableOpacity onPress={() => handleSaveEditComment(comment._id, post._id)} className="mr-2">
                                      <Text className="text-indigo-600 text-[10px] font-bold">Save</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setEditingCommentId(null)}>
                                      <Text className="text-slate-400 text-[10px] font-bold">Cancel</Text>
                                    </TouchableOpacity>
                                  </View>
                                ) : (
                                  <Text className="text-slate-600 text-[11px] mt-0.5">{comment.comment_text}</Text>
                                )}
                              </View>
                              {isCommentAuthor && editingCommentId !== comment._id && (
                                <View className="flex-row">
                                  <TouchableOpacity onPress={() => handleStartEditComment(comment)} className="mr-3">
                                    <Text className="text-slate-400 text-[10px] font-bold">Edit</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity onPress={() => handleDeleteComment(comment._id, post._id)}>
                                    <Text className="text-rose-500 text-[10px] font-bold">Delete</Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}

                      <View className="flex-row items-center mt-1">
                        <TextInput
                          className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-slate-800 text-xs mr-2"
                          placeholder="Add a comment..."
                          placeholderTextColor="#94A3B8"
                          value={commentDrafts[post._id] || ''}
                          onChangeText={(text) => setCommentDrafts((prev) => ({ ...prev, [post._id]: text }))}
                        />
                        <TouchableOpacity
                          onPress={() => handleAddComment(post._id)}
                          className="bg-indigo-600 w-9 h-9 rounded-full items-center justify-center"
                        >
                          <Text className="text-white font-bold">➤</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default MemberFeedScreen;
