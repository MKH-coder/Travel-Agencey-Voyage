import React, { useState, useEffect } from 'react';
import { FeedPost } from '../types.ts';
import { Send, Trash2, ShieldCheck, User as UserIcon, FileText, Download, Layers, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { ClientStorageManager } from '../services/clientStorage.ts';
import { AuthAudit } from '../services/authAudit.ts';
import { AlbaniaPdfService } from '../services/albaniaPdfService.ts';

interface ExploreFeedProps {
  onOpenAlbaniaModal?: (tier?: 'basic' | 'midrange' | 'luxury') => void;
}

export const ExploreFeed: React.FC<ExploreFeedProps> = ({ onOpenAlbaniaModal }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/feed-posts');
      if (res.ok) {
        const data = await res.json();
        // Ensure official Albania post is always available if list is empty or doesn't have it
        const fallback = ClientStorageManager.getFeedPosts();
        const merged = [...data];
        fallback.forEach(f => {
          if (!merged.some(m => m.id === f.id)) {
            merged.unshift(f);
          }
        });
        setPosts(merged);
        ClientStorageManager.saveFeedPostsBulk(merged);
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

  const handleCreatePost = async (contentToPost?: string) => {
    const text = (contentToPost || newPostContent).trim();
    if (!text) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/feed-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.uid}`
        },
        body: JSON.stringify({ content: text })
      });
      
      if (res.ok) {
        const newPost = await res.json();
        ClientStorageManager.saveFeedPost(newPost);
        setPosts([newPost, ...posts.filter(p => p.id !== newPost.id)]);
        setNewPostContent('');
        AuthAudit.showToast({
          title: 'Post Created',
          message: 'Your announcement was broadcasted successfully.',
          type: 'success'
        });
      } else {
        // Local fallback
        const localPost: FeedPost = {
          id: `fp_${Date.now()}`,
          authorId: user?.uid || 'admin',
          authorName: user?.name || user?.email || 'Voyage Platform Admin',
          content: text,
          createdAt: new Date().toISOString()
        };
        ClientStorageManager.saveFeedPost(localPost);
        setPosts([localPost, ...posts]);
        setNewPostContent('');
        AuthAudit.showToast({
          title: 'Post Published',
          message: 'Your announcement has been broadcasted to the feed.',
          type: 'success'
        });
      }
    } catch (e) {
      console.error('Failed to create post', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreFillAlbania = () => {
    setNewPostContent(
      '🇦🇱 NEW EXPEDITION RELEASE: Albania 9-Day Grand Tour (9–19 Oct 2026)\n\n' +
      'Complete circuit across Tirana, Berat UNESCO castle, Gjirokastër stone city, Syri i Kaltër (Blue Eye), Ksamil 4-Islands Boat Cruise, Butrint UNESCO park, and the dramatic Albanian Riviera coast (Jalë, Dhërmi, Llogara Pass, Vlorë).\n\n' +
      '• Basic Tier: ₹1,11,018–₹1,26,518 / person\n' +
      '• Mid-Range Tier: ₹1,43,390–₹1,67,390 / person\n' +
      '• Luxury VIP Tier: ₹4,24,343–₹4,73,343 / person\n\n' +
      'Click the button below to view the interactive itinerary and download the official multi-page PDF dossiers.'
    );
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
      ClientStorageManager.deleteFeedPost(id);
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const canPost = user && ['TECH_ADMIN', 'TECH_SUBADMIN', 'ADMIN'].includes(user.role);

  return (
    <div className="space-y-6 mb-10">
      {canPost && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Super Admin Broadcast</span>
            </h3>
            <button
              type="button"
              onClick={handlePreFillAlbania}
              className="text-xs px-3 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1.5 border border-orange-500/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Template: Albania 9-Day Post</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Broadcast an announcement or travel package update to all users..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-slate-900 dark:text-white"
                rows={3}
              />
            </div>
            <div className="flex sm:flex-col justify-end gap-2 shrink-0">
              <button
                onClick={() => handleCreatePost()}
                disabled={isSubmitting || !newPostContent.trim()}
                className="px-5 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Post</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pl-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Latest Announcements & Travel Posts</span>
            </h3>
          </div>
          {posts.map(post => {
            const isAlbaniaPost = post.content.toLowerCase().includes('albania');
            return (
              <div 
                key={post.id} 
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border ${
                  isAlbaniaPost 
                    ? 'border-orange-500/40 dark:border-orange-500/30 bg-gradient-to-b from-orange-500/[0.02] to-transparent ring-1 ring-orange-500/10' 
                    : 'border-slate-200/60 dark:border-slate-800'
                } transition-all hover:shadow-md`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${
                      isAlbaniaPost 
                        ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' 
                        : 'bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400'
                    } flex items-center justify-center font-bold`}>
                      {isAlbaniaPost ? (
                        <MapPin className="w-4 h-4" />
                      ) : (
                        <UserIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        {post.authorName}
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        {isAlbaniaPost && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold border border-orange-500/20">
                            Featured Itinerary
                          </span>
                        )}
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

                {isAlbaniaPost && (
                  <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center gap-3">
                    {/* The Exact Orange Pill Button from the User's Image */}
                    {onOpenAlbaniaModal && (
                      <button
                        type="button"
                        onClick={() => onOpenAlbaniaModal('midrange')}
                        className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-md shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-white/20"
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-1.5 py-0.5 rounded-md text-white">
                          AL
                        </span>
                        <span>Albania 9-Day (PDF)</span>
                      </button>
                    )}

                    {/* Additional Quick Download & Comparison Options */}
                    <button
                      type="button"
                      onClick={() => AlbaniaPdfService.generateTierPdf('midrange')}
                      className="px-3.5 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Mid-Range PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => AlbaniaPdfService.generateComparisonPdf()}
                      className="px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-sky-500" />
                      <span>3-Tier Matrix PDF</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

