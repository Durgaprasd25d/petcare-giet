import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, createPost, toggleLike, addComment, deletePost } from '../redux/slices/postSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaComment, FaImage, FaTrash, FaPaperPlane, FaUserAlt } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const CommunityFeed = () => {
  const dispatch = useDispatch();
  const { posts, isLoading } = useSelector(state => state.posts);
  const { user } = useSelector(state => state.auth);

  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setIsUploading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData, config);
      setImage(data.imageUrl);
      setIsUploading(false);
    } catch (error) {
      setIsUploading(false);
      toast.error('Image upload failed');
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    try {
      await dispatch(createPost({ content, image })).unwrap();
      setContent('');
      setImage('');
      toast.success('Posted successfully!');
    } catch (err) {
      toast.error('Failed to post');
    }
  };

  const handleLike = (id) => {
    dispatch(toggleLike(id));
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await dispatch(addComment({ id: postId, text: commentText })).unwrap();
      setCommentText('');
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this post?')) {
      dispatch(deletePost(id));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5F0] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF5F0]/80 backdrop-blur-xl px-6 py-6 border-b border-gray-100">
        <h1 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">Community Feed</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Connect with Pet Lovers</p>
      </div>

      <div className="px-6 mt-6 max-w-lg mx-auto space-y-8">
        
        {/* Create Post Area */}
        <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-50 relative overflow-hidden">
          <form onSubmit={handlePostSubmit} className="space-y-4">
            <textarea
              className="w-full h-24 bg-transparent border-none outline-none resize-none text-sm font-bold text-gray-900 placeholder:text-gray-300"
              placeholder="What's on your pet's mind today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {image && (
              <div className="relative w-full h-40 rounded-2xl overflow-hidden">
                <img src={image.startsWith('http') ? image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${image}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImage('')} className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 shadow-md">
                  <FaTrash size={12} />
                </button>
              </div>
            )}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <input type="file" id="post-image" className="hidden" onChange={handleImageUpload} accept="image/*" />
              <label htmlFor="post-image" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <FaImage />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{isUploading ? 'Uploading...' : 'Add Photo'}</span>
              </label>
              <motion.button whileTap={{ scale: 0.95 }} disabled={isUploading || (!content.trim() && !image)} type="submit" className="px-6 py-3 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                Post
              </motion.button>
            </div>
          </form>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Loading Feed...</div>
          ) : posts.map((post) => (
            <div key={post._id} className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-50">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden">
                    {post.user.image ? <img src={post.user.image} className="w-full h-full object-cover" /> : <FaUserAlt className="text-gray-300" />}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-sm leading-none">{post.user.name}</h4>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{post.user.role} • {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {(post.user._id === user._id || user.role === 'Admin') && (
                  <button onClick={() => handleDelete(post._id)} className="text-gray-300 hover:text-red-500 transition-colors"><FaTrash size={12} /></button>
                )}
              </div>

              {/* Post Content */}
              <p className="text-sm font-medium text-gray-700 leading-relaxed mb-4">{post.content}</p>
              {post.image && (
                <div className="w-full h-64 rounded-2xl overflow-hidden mb-4 bg-gray-50">
                  <img src={post.image.startsWith('http') ? post.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${post.image}`} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                <button onClick={() => handleLike(post._id)} className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-colors ${post.likes.includes(user._id) ? 'text-red-500' : 'text-gray-400 hover:text-gray-900'}`}>
                  <FaHeart size={16} /> {post.likes.length}
                </button>
                <button onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
                  <FaComment size={16} /> {post.comments.length}
                </button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {activeCommentPost === post._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 space-y-4 overflow-hidden">
                    <div className="space-y-4 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                      {post.comments.map(comment => (
                        <div key={comment._id} className="bg-gray-50 p-4 rounded-[20px]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-gray-900 text-xs">{comment.user.name}</span>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs font-medium text-gray-600">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="relative">
                      <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." className="w-full h-12 bg-gray-50 rounded-full px-5 text-xs font-bold text-gray-900 outline-none pr-12" />
                      <button type="submit" disabled={!commentText.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white disabled:opacity-50"><FaPaperPlane size={10} /></button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;
