import React, { useState, useEffect } from 'react';
import { FeedPost } from '../types.ts';
import { Send, Trash2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { ClientStorageManager } from '../services/clientStorage.ts';
import { AuthAudit } from '../services/authAudit.ts';

export const ExploreFeed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/feed-posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
        ClientStorageManager.saveFeedPostsBulk(data);
      }
    } catch (e) {
      console.warn('Failed to fetch feed posts, using offline fallback', e);
      setPosts(ClientStorageManager.getFeedPosts());
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/feed-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.uid}`
        },
        body: JSON.stringify({ content: newPostContent })
      });
      
      if (res.ok) {
        const newPost = await res.json();
        ClientStorageManager.saveFeedPost(newPost);
        setPosts([newPost, ...posts]);
        setNewPostContent('');
        AuthAudit.showToast({
          title: 'Post Created',
          message: 'Your announcement was broadcasted successfully.',
          type: 'success'
        });
      }
    } catch (e) {
      console.error('Failed to create post', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/feed-posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.uid}` }
      });
      if (res.ok) {
        ClientStorageManager.deleteFeedPost(id);
        setPosts(posts.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete post', e);
    }
  };

  const canPost = user && ['TECH_ADMIN', 'TECH_SUBADMIN', 'ADMIN'].includes(user.role);

  return (
    <div className="space-y-6 mb-10">
      {canPost && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Super Admin Broadcast
          </h3>
          <div className="flex gap-3">
            <div className="flex-grow">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Broadcast an announcement to all users..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-slate-900 dark:text-white"
                rows={2}
              />
            </div>
            <button
              onClick={handleCreatePost}
              disabled={isSubmitting || !newPostContent.trim()}
              className="self-end px-5 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Post</span>
            </button>
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">Latest Announcements</h3>
          {posts.map(post => (
            <div key={post.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800 transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      {post.authorName}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {new Date(post.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                {canPost && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
