import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  User as UserIcon,
  ShieldCheck,
  Clock,
  CheckCheck,
  Sparkles,
  RefreshCw,
  Mail,
  Flame,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ChatSupportService } from '../services/chatSupportService.ts';
import { SupportMessage, SupportConversationSummary } from '../types.ts';
import { AuthAudit } from '../services/authAudit.ts';

export const AdminLiveSupportTab: React.FC = () => {
  const { styles } = useTheme();
  const { user: currentAdmin } = useAuth();

  const [conversations, setConversations] = useState<SupportConversationSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to all conversations in real-time
  useEffect(() => {
    const unsubscribe = ChatSupportService.subscribeToAllConversations((convList) => {
      setConversations(convList);
      if (convList.length > 0 && !selectedUserId) {
        setSelectedUserId(convList[0].userId);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedUserId]);

  const selectedConversation = conversations.find(c => c.userId === selectedUserId) || conversations[0] || null;

  // When a conversation is opened, mark its client messages as read by admin
  useEffect(() => {
    if (selectedConversation && selectedConversation.unreadCount > 0) {
      ChatSupportService.markConversationAsReadByAdmin(selectedConversation.userId);
    }
  }, [selectedConversation?.userId, selectedConversation?.messages.length]);

  // Scroll to bottom of message view
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages.length]);

  const handleSendReply = async (customMessage?: string) => {
    if (!selectedConversation) return;
    const textToSend = (customMessage || replyText).trim();
    if (!textToSend || isSending) return;

    setIsSending(true);
    try {
      await ChatSupportService.sendMessage({
        userId: selectedConversation.userId,
        userEmail: selectedConversation.userEmail,
        userName: selectedConversation.userName,
        senderRole: 'ADMIN',
        senderId: currentAdmin?.uid || 'admin_desk',
        senderName: currentAdmin?.name ? `${currentAdmin.name} (Voyage Concierge)` : 'Voyage Concierge Desk',
        text: textToSend,
      });

      setReplyText('');
      AuthAudit.showToast({
        title: 'Reply Delivered',
        message: `Personal reply sent to ${selectedConversation.userEmail}`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to send admin reply:', err);
      AuthAudit.showToast({
        title: 'Send Failed',
        message: 'Could not send message. Please retry.',
        type: 'error',
      });
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnreadCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const quickTemplates = [
    '👋 Hello! Thank you for reaching out to Voyage Luxury Concierge. How may we assist with your itinerary?',
    '🇦🇱 We have customized options for the Albania 9-Day Riviera & Alps packages available with private transfers.',
    '🏨 Your luxury boutique reservation request has been received. Our team is securing VIP room upgrades for you.',
    '🎟️ Your exclusive 15% discount code has been noted and will be automatically applied at checkout.',
    '✈️ A travel specialist is reviewing your flight and transfer options and will provide a personalized quote shortly.'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-xl font-black ${styles.textPrimary}`}>Live Concierge & 1-on-1 Client Support Desk</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase border border-emerald-500/20 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Cloud Sync
              </span>
            </div>
            <p className={`text-xs ${styles.textMuted} mt-1`}>
              Messages typed in the traveler chat widget arrive here in real-time. Your personal replies route directly and exclusively to the signed-in client account.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl border ${styles.border} bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2`}>
            <Inbox className="w-4 h-4 text-sky-500" />
            <span className={`text-xs font-bold ${styles.textPrimary}`}>Active Threads: <span className="font-mono text-sky-600 dark:text-sky-400">{conversations.length}</span></span>
          </div>
          {totalUnreadCount > 0 && (
            <div className="px-3.5 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-black flex items-center gap-1.5 animate-pulse">
              <Flame className="w-4 h-4" />
              <span>{totalUnreadCount} Unread Inquiries</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Inbox View */}
      <div className={`rounded-3xl border ${styles.border} ${styles.cardBg} shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] max-h-[750px]`}>
        
        {/* Left Column: Conversation Thread Selector (4 cols) */}
        <div className={`lg:col-span-4 border-r ${styles.border} flex flex-col h-full bg-slate-50/40 dark:bg-slate-950/40`}>
          {/* Search Box */}
          <div className={`p-4 border-b ${styles.border}`}>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border ${styles.border} ${styles.inputBg} ${styles.textPrimary} text-xs outline-none focus:ring-2 focus:ring-sky-500/40 transition-all`}
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 mx-auto mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className={`text-xs font-bold ${styles.textPrimary}`}>No conversations yet</div>
                <div className={`text-[11px] ${styles.textMuted} mt-1`}>
                  When clients type in the floating chat widget, their threads will appear here instantly.
                </div>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversation?.userId === conv.userId;
                return (
                  <button
                    key={conv.userId}
                    onClick={() => {
                      setSelectedUserId(conv.userId);
                      ChatSupportService.markConversationAsReadByAdmin(conv.userId);
                    }}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/10 border-l-4 border-sky-500 dark:bg-sky-500/15'
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
                      {conv.userName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs font-black truncate ${isSelected ? 'text-sky-600 dark:text-sky-400' : styles.textPrimary}`}>
                          {conv.userName}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 truncate mb-1">
                        {conv.userEmail}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-900 dark:text-slate-100' : styles.textMuted}`}>
                          {conv.lastMessage.senderRole === 'ADMIN' ? 'You: ' : ''}
                          {conv.lastMessage.text}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation & Reply Center (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white dark:bg-slate-950">
          {selectedConversation ? (
            <>
              {/* Selected User Header */}
              <div className={`p-4 px-6 border-b ${styles.border} flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white flex items-center justify-center font-bold shadow-xs">
                    {selectedConversation.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-black ${styles.textPrimary}`}>{selectedConversation.userName}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-[10px] border border-sky-500/20">
                        Client User
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{selectedConversation.userEmail}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span className="font-mono text-[10px]">UID: {selectedConversation.userId.slice(0, 12)}...</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      ChatSupportService.markConversationAsReadByAdmin(selectedConversation.userId);
                      AuthAudit.showToast({
                        title: 'Marked as Read',
                        message: 'Conversation marked as acknowledged.',
                        type: 'info',
                      });
                    }}
                    className={`px-3 py-1.5 rounded-xl border ${styles.border} ${styles.buttonSecondary} text-xs font-bold flex items-center gap-1.5 cursor-pointer`}
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Mark Read</span>
                  </button>
                </div>
              </div>

              {/* Message Stream Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {selectedConversation.messages.map((m) => {
                  const isAdmin = m.senderRole === 'ADMIN';
                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-3 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isAdmin && (
                        <div className="w-8 h-8 rounded-2xl bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                          {selectedConversation.userName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className={`max-w-[75%] ${isAdmin ? 'text-right' : 'text-left'}`}>
                        <div className="text-[10px] font-bold text-slate-400 mb-1 px-1 flex items-center gap-1.5 justify-end">
                          <span>{isAdmin ? (m.senderName || 'Voyage Concierge Desk') : selectedConversation.userName}</span>
                          {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />}
                        </div>

                        <div
                          className={`p-4 rounded-3xl text-xs leading-relaxed shadow-xs ${
                            isAdmin
                              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-tr-xs shadow-sky-500/20'
                              : `bg-slate-100 dark:bg-slate-900 border ${styles.border} ${styles.textPrimary} rounded-tl-xs`
                          }`}
                        >
                          {m.text}
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1 justify-end">
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          {isAdmin && <CheckCheck className="w-3.5 h-3.5 text-sky-400" />}
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs">
                          VC
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Presets */}
              <div className={`px-4 py-2 border-t ${styles.border} bg-slate-50/50 dark:bg-slate-950/40 flex items-center gap-2 overflow-x-auto shrink-0`}>
                <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Quick Preset:</span>
                </span>
                {quickTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendReply(tmpl)}
                    className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-500/10 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer shrink-0"
                  >
                    {tmpl.slice(0, 38)}...
                  </button>
                ))}
              </div>

              {/* Reply Input Bar */}
              <div className={`p-4 border-t ${styles.border} bg-white dark:bg-slate-950 shrink-0`}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendReply();
                  }}
                  className="flex items-center gap-3"
                >
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder={`Type personal reply to ${selectedConversation.userName}... (Enter to send)`}
                    rows={2}
                    className={`flex-1 p-3 rounded-2xl border ${styles.border} ${styles.inputBg} ${styles.textPrimary} text-xs outline-none focus:ring-2 focus:ring-sky-500/40 transition-all resize-none`}
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="h-12 px-5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-40 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Reply</span>
                  </button>
                </form>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
                  <span>🔒 Personal 1-on-1 Delivery: Only <b>{selectedConversation.userEmail}</b> will receive this reply.</span>
                  <span>Shift + Enter for new line</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h4 className={`text-base font-bold ${styles.textPrimary}`}>Select a Conversation</h4>
              <p className={`text-xs ${styles.textMuted} max-w-sm mt-1`}>
                Choose a client from the left thread list to view live history and send personalized 1-on-1 concierge replies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
