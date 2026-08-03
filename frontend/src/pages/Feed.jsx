import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageSquare, Send, Trash2, Edit3, Image, Upload, AlertCircle, CheckCircle, MoreVertical, X } from 'lucide-react';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Post creation form state (Owner/Trainer only)
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [posting, setPosting] = useState(false);

  // Comments state
  const [commentText, setCommentText] = useState({});

  // Editing state
  const [editingPostId, setEditingPostId] = useState(null);
  const [editCaptionText, setEditCaptionText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  const isModerator = user?.role === 'owner' || user?.role === 'trainer';
  const serverUrl = 'http://localhost:5000';

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/posts');
      setPosts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load community feed');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!imageFile || !caption.trim()) {
      setError('Please add both an image and a caption');
      return;
    }

    setPosting(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('caption', caption.trim());

    try {
      const res = await API.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPosts([
        {
          ...res.data,
          likeCount: 0,
          hasLiked: false,
          comments: [],
        },
        ...posts,
      ]);
      setCaption('');
      setImageFile(null);
      setImagePreview('');
      setSuccess('Post published to feed!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create community post');
    } finally {
      setPosting(false);
    }
  };

  const handleLikeToggle = async (post) => {
    try {
      const endpoint = post.hasLiked ? `/posts/${post._id}/unlike` : `/posts/${post._id}/like`;
      const res = await API.post(endpoint);

      setPosts(
        posts.map((p) =>
          p._id === post._id
            ? { ...p, hasLiked: res.data.liked, likeCount: res.data.likeCount }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const text = commentText[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await API.post(`/posts/${postId}/comments`, { comment_text: text.trim() });
      setPosts(
        posts.map((p) =>
          p._id === postId
            ? { ...p, comments: [...p.comments, res.data] }
            : p
        )
      );
      setCommentText({ ...commentText, [postId]: '' });
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleStartEditPost = (post) => {
    setEditingPostId(post._id);
    setEditCaptionText(post.caption);
  };

  const handleSaveEditPost = async (postId) => {
    if (!editCaptionText.trim()) return;
    try {
      const res = await API.put(`/posts/${postId}`, { caption: editCaptionText.trim() });
      setPosts(
        posts.map((p) =>
          p._id === postId
            ? { ...p, caption: res.data.caption }
            : p
        )
      );
      setEditingPostId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to edit post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this community post? This action cannot be undone.')) {
      return;
    }

    try {
      await API.delete(`/posts/${postId}`);
      setPosts(posts.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentText(comment.comment_text);
  };

  const handleSaveEditComment = async (commentId, postId) => {
    if (!editCommentText.trim()) return;
    try {
      const res = await API.put(`/posts/comments/${commentId}`, { comment_text: editCommentText.trim() });
      setPosts(
        posts.map((p) =>
          p._id === postId
            ? {
                ...p,
                comments: p.comments.map((c) => (c._id === commentId ? res.data : c)),
              }
            : p
        )
      );
      setEditingCommentId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm('Delete comment?')) return;
    try {
      await API.delete(`/posts/comments/${commentId}`);
      setPosts(
        posts.map((p) =>
          p._id === postId
            ? { ...p, comments: p.comments.filter((c) => c._id !== commentId) }
            : p
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8 min-h-screen">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">
          Pulse <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Feed</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Stay updated with stories, announcements, and motivation shared by your gym community.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2 max-w-xl">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-2 max-w-xl">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Post Creator (Owner/Trainer only) */}
      {isModerator && (
        <form onSubmit={handleCreatePost} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Image size={16} className="text-indigo-400" />
            Share a new story
          </h3>

          <div className="flex flex-col md:flex-row gap-4">
            {/* File Upload Box */}
            <div className="flex-shrink-0 w-full md:w-48 h-48 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-950/40 hover:bg-slate-950/80 transition-colors relative overflow-hidden group">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-slate-950/80 hover:bg-slate-900 p-1.5 rounded-full text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <Upload size={24} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-[10px] text-slate-500 font-semibold text-center px-4">Upload Post Image</span>
                </>
              )}
            </div>

            {/* Caption Textarea & Submit */}
            <div className="flex-grow flex flex-col justify-between space-y-4">
              <textarea
                className="w-full flex-grow bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                placeholder="What's going on in the gym today? Add details, workout achievements, or training advice..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={posting}
                className="self-end bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-lg text-xs transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {posting ? 'Posting...' : 'Share Post'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Feed List */}
      <div className="space-y-8">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm animate-pulse">Loading feed stories...</div>
        ) : posts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
            No updates posted yet.
          </div>
        ) : (
          posts.map((post) => {
            const isAuthor = user?.id === post.author_id?._id;
            const canDelete = isAuthor || isModerator;

            return (
              <div key={post._id} className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
                {/* Post Header */}
                <div className="p-4 border-b border-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white text-xs">
                      {post.author_id?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 text-xs">{post.author_id?.name}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          post.author_role === 'owner' 
                            ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' 
                            : 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                        }`}>
                          {post.author_role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(post.created_date).toLocaleDateString()} at {new Date(post.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Edit/Delete) */}
                  <div className="flex items-center gap-2">
                    {isAuthor && editingPostId !== post._id && (
                      <button
                        onClick={() => handleStartEditPost(post)}
                        className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Edit Post"
                      >
                        <Edit3 size={14} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-1.5 rounded-lg bg-slate-850 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Body (Caption & Image) */}
                <div className="p-4 space-y-4">
                  {editingPostId === post._id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-grow bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                        value={editCaptionText}
                        onChange={(e) => setEditCaptionText(e.target.value)}
                      />
                      <button
                        onClick={() => handleSaveEditPost(post._id)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg text-[10px] transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPostId(null)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-lg text-[10px] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{post.caption}</p>
                  )}
                  
                  {post.image_url && (
                    <div className="border border-slate-800 rounded-xl overflow-hidden max-h-[450px] bg-slate-950 flex items-center justify-center">
                      <img
                        src={post.image_url.startsWith('http') ? post.image_url : `${serverUrl}${post.image_url}`}
                        alt="Community Post"
                        className="w-full object-contain max-h-[450px]"
                      />
                    </div>
                  )}
                </div>

                {/* Engagement Bar */}
                <div className="p-4 border-t border-b border-slate-850 flex items-center gap-6 bg-slate-950/20">
                  <button
                    onClick={() => handleLikeToggle(post)}
                    className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                      post.hasLiked ? 'text-rose-500' : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <Heart size={16} fill={post.hasLiked ? 'currentColor' : 'none'} className="transition-transform duration-200 active:scale-125" />
                    <span>{post.likeCount} {post.likeCount === 1 ? 'Like' : 'Likes'}</span>
                  </button>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <MessageSquare size={16} />
                    <span>{post.comments?.length || 0} {post.comments?.length === 1 ? 'Comment' : 'Comments'}</span>
                  </div>
                </div>

                {/* Comments Thread subpanel */}
                <div className="p-4 bg-slate-950/40 space-y-4">
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-slate-850 pr-2">
                      {post.comments.map((comment) => {
                        const isCommentAuthor = user?.id === comment.user_id?._id;
                        const canDeleteComment = isCommentAuthor || isModerator;

                        return (
                          <div key={comment._id} className="pt-3 first:pt-0 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-[10px] mt-0.5">
                                {comment.user_id?.name?.charAt(0) || 'U'}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-200 text-[10px]">{comment.user_id?.name}</span>
                                  <span className="text-[8px] text-slate-500">
                                    {new Date(comment.created_date).toLocaleDateString()}
                                  </span>
                                </div>
                                {editingCommentId === comment._id ? (
                                  <div className="flex gap-2 mt-1">
                                    <input
                                      type="text"
                                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[10px] focus:outline-none focus:border-indigo-500"
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                    />
                                    <button
                                      onClick={() => handleSaveEditComment(comment._id, post._id)}
                                      className="bg-indigo-600 text-white px-2 py-1 rounded text-[8px] font-semibold"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingCommentId(null)}
                                      className="bg-slate-800 text-slate-200 px-2 py-1 rounded text-[8px] font-semibold"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <p className="text-slate-300 text-[11px] leading-relaxed">{comment.comment_text}</p>
                                )}
                              </div>
                            </div>

                            {/* Comment Actions */}
                            <div className="flex items-center gap-1">
                              {isCommentAuthor && editingCommentId !== comment._id && (
                                <button
                                  onClick={() => handleStartEditComment(comment)}
                                  className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                                  title="Edit Comment"
                                >
                                  <Edit3 size={10} />
                                </button>
                              )}
                              {canDeleteComment && (
                                <button
                                  onClick={() => handleDeleteComment(comment._id, post._id)}
                                  className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
                                  title="Delete Comment"
                                >
                                  <Trash2 size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Comment Input Box */}
                  <form onSubmit={(e) => handleAddComment(e, post._id)} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-grow bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Add a comment..."
                      value={commentText[post._id] || ''}
                      onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                      required
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Feed;
