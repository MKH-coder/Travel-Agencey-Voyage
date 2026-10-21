import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Clock, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Sparkles, 
  CheckCheck, 
  LogIn, 
  ShieldCheck,
  ChevronDown,
  Instagram,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ChatSupportService } from '../services/chatSupportService.ts';
import { SupportMessage, ThemeMode } from '../types.ts';
import { AuthAudit } from '../services/authAudit.ts';

interface ChatThemeConfig {
  headerGradient: string;
  toggleGradient: string;
  toggleShadow: string;
  userBubbleGradient: string;
  sendButtonGradient: string;
  accentPillActive: string;
  groundingBg: string;
  groundingText: string;
  groundingLink: string;
  avatarGradient: string;
  suggestionChip: string;
  welcomeAccentBadge: string;
  typingText: string;
  typingDot: string;
  focusRing: string;
  onlineDot: string;
}

const chatThemeConfigs: Record<ThemeMode, ChatThemeConfig> = {
  'cyan-light': {
    headerGradient: 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600',
    toggleGradient: 'bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 text-white',
    toggleShadow: 'shadow-xl shadow-cyan-500/25',
    userBubbleGradient: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20',
    sendButtonGradient: 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 hover:from-cyan-600 hover:to-blue-700',
    accentPillActive: 'bg-white text-cyan-950 shadow-sm font-bold',
    groundingBg: 'bg-cyan-50/90 dark:bg-cyan-950/40 border-b border-cyan-100 dark:border-cyan-900/40',
    groundingText: 'text-cyan-800 dark:text-cyan-300',
    groundingLink: 'text-cyan-600 dark:text-cyan-400 hover:text-cyan-700',
    avatarGradient: 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white',
    suggestionChip: 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 hover:text-cyan-600',
    welcomeAccentBadge: 'bg-cyan-100/90 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60',
    typingText: 'text-cyan-600 dark:text-cyan-400',
    typingDot: 'bg-cyan-500',
    focusRing: 'focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500',
    onlineDot: 'bg-cyan-400',
  },
  'dark-slate': {
    headerGradient: 'bg-gradient-to-r from-sky-600 via-indigo-600 to-slate-900',
    toggleGradient: 'bg-gradient-to-tr from-sky-500 via-sky-400 to-indigo-600 text-white',
    toggleShadow: 'shadow-xl shadow-sky-500/30',
    userBubbleGradient: 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20',
    sendButtonGradient: 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/30 hover:from-sky-400 hover:to-indigo-500',
    accentPillActive: 'bg-white text-indigo-950 shadow-sm font-bold',
    groundingBg: 'bg-sky-500/10 border-b border-sky-500/20',
    groundingText: 'text-sky-200',
    groundingLink: 'text-sky-400 hover:text-sky-300',
    avatarGradient: 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white',
    suggestionChip: 'bg-slate-800/90 border-slate-700 text-slate-200 hover:border-sky-400 hover:bg-slate-800 hover:text-sky-300',
    welcomeAccentBadge: 'bg-sky-950/80 text-sky-300 border border-sky-800/60',
    typingText: 'text-sky-400',
    typingDot: 'bg-sky-400',
    focusRing: 'focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400',
    onlineDot: 'bg-sky-400',
  },
  'crimson-black': {
    headerGradient: 'bg-gradient-to-r from-rose-700 via-red-700 to-zinc-950',
    toggleGradient: 'bg-gradient-to-tr from-rose-600 via-red-500 to-rose-700 text-white',
    toggleShadow: 'shadow-xl shadow-rose-600/35',
    userBubbleGradient: 'bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-md shadow-rose-950/40',
    sendButtonGradient: 'bg-gradient-to-tr from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 hover:from-rose-500 hover:to-red-500',
    accentPillActive: 'bg-white text-rose-950 shadow-sm font-bold',
    groundingBg: 'bg-rose-950/40 border-b border-rose-900/40',
    groundingText: 'text-rose-200',
    groundingLink: 'text-rose-400 hover:text-rose-300',
    avatarGradient: 'bg-gradient-to-tr from-rose-600 to-red-600 text-white',
    suggestionChip: 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-rose-500 hover:bg-zinc-850 hover:text-rose-300',
    welcomeAccentBadge: 'bg-rose-950/80 text-rose-300 border border-rose-900/60',
    typingText: 'text-rose-400',
    typingDot: 'bg-rose-500',
    focusRing: 'focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500',
    onlineDot: 'bg-rose-400',
  },
  'emerald-warm': {
    headerGradient: 'bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900',
    toggleGradient: 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 text-white',
    toggleShadow: 'shadow-xl shadow-emerald-600/25',
    userBubbleGradient: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20',
    sendButtonGradient: 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500',
    accentPillActive: 'bg-white text-emerald-950 shadow-sm font-bold',
    groundingBg: 'bg-emerald-50/90 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/40',
    groundingText: 'text-emerald-900 dark:text-emerald-200',
    groundingLink: 'text-emerald-700 dark:text-emerald-300 hover:text-emerald-800',
    avatarGradient: 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white',
    suggestionChip: 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-emerald-950 dark:text-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-800',
    welcomeAccentBadge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60',
    typingText: 'text-emerald-600 dark:text-emerald-400',
    typingDot: 'bg-emerald-600',
    focusRing: 'focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500',
    onlineDot: 'bg-emerald-400',
  },
  'royal-gold': {
    headerGradient: 'bg-gradient-to-r from-amber-600 via-yellow-600 to-[#0c0f1d]',
    toggleGradient: 'bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black',
    toggleShadow: 'shadow-xl shadow-amber-500/30',
    userBubbleGradient: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold shadow-md shadow-amber-500/20',
    sendButtonGradient: 'bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 hover:brightness-110',
    accentPillActive: 'bg-amber-400 text-slate-950 shadow-sm font-black',
    groundingBg: 'bg-amber-950/40 border-b border-amber-500/20',
    groundingText: 'text-amber-200',
    groundingLink: 'text-amber-400 hover:text-amber-300',
    avatarGradient: 'bg-gradient-to-tr from-amber-500 to-yellow-600 text-slate-950 font-bold',
    suggestionChip: 'bg-[#141931] border-amber-500/20 text-slate-200 hover:border-amber-400 hover:bg-[#1b2244] hover:text-amber-300',
    welcomeAccentBadge: 'bg-amber-950/80 text-amber-300 border border-amber-500/30',
    typingText: 'text-amber-400',
    typingDot: 'bg-amber-400',
    focusRing: 'focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400',
    onlineDot: 'bg-amber-400',
  },
  'violet-glass': {
    headerGradient: 'bg-gradient-to-r from-fuchsia-700 via-purple-700 to-[#080212]',
    toggleGradient: 'bg-gradient-to-tr from-fuchsia-600 via-purple-500 to-violet-700 text-white',
    toggleShadow: 'shadow-xl shadow-fuchsia-600/30',
    userBubbleGradient: 'bg-gradient-to-r from-fuchsia-600 to-violet-700 text-white shadow-md shadow-fuchsia-900/30',
    sendButtonGradient: 'bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white shadow-md shadow-fuchsia-600/30 hover:from-fuchsia-500 hover:to-purple-500',
    accentPillActive: 'bg-white text-purple-950 shadow-sm font-bold',
    groundingBg: 'bg-purple-950/40 border-b border-purple-900/40',
    groundingText: 'text-fuchsia-200',
    groundingLink: 'text-fuchsia-400 hover:text-fuchsia-300',
    avatarGradient: 'bg-gradient-to-tr from-fuchsia-600 to-violet-700 text-white',
    suggestionChip: 'bg-[#14082b] border-violet-900/40 text-violet-200 hover:border-fuchsia-500 hover:bg-[#1f0d42] hover:text-fuchsia-300',
    welcomeAccentBadge: 'bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-800/60',
    typingText: 'text-fuchsia-400',
    typingDot: 'bg-fuchsia-500',
    focusRing: 'focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500',
    onlineDot: 'bg-fuchsia-400',
  },
  'emerald-black': {
    headerGradient: 'bg-gradient-to-r from-emerald-600 via-emerald-800 to-[#030705]',
    toggleGradient: 'bg-gradient-to-tr from-emerald-500 via-teal-600 to-emerald-700 text-white',
    toggleShadow: 'shadow-xl shadow-emerald-500/30',
    userBubbleGradient: 'bg-gradient-to-r from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-950/40',
    sendButtonGradient: 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500',
    accentPillActive: 'bg-emerald-400 text-slate-950 shadow-sm font-black',
    groundingBg: 'bg-emerald-950/40 border-b border-emerald-900/50',
    groundingText: 'text-emerald-200',
    groundingLink: 'text-emerald-400 hover:text-emerald-300',
    avatarGradient: 'bg-gradient-to-tr from-emerald-500 to-teal-700 text-white',
    suggestionChip: 'bg-[#0e1712] border-emerald-900/50 text-emerald-100 hover:border-emerald-400 hover:bg-[#15241c] hover:text-emerald-300',
    welcomeAccentBadge: 'bg-emerald-950/80 text-emerald-300 border border-emerald-900/60',
    typingText: 'text-emerald-400',
    typingDot: 'bg-emerald-400',
    focusRing: 'focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400',
    onlineDot: 'bg-emerald-400',
  },
  'rose-gold': {
    headerGradient: 'bg-gradient-to-r from-rose-500 via-pink-600 to-[#120e11]',
    toggleGradient: 'bg-gradient-to-tr from-rose-400 via-pink-500 to-rose-600 text-white',
    toggleShadow: 'shadow-xl shadow-rose-400/30',
    userBubbleGradient: 'bg-gradient-to-r from-rose-400 to-pink-600 text-slate-950 font-bold shadow-md shadow-rose-950/30',
    sendButtonGradient: 'bg-gradient-to-tr from-rose-400 to-pink-500 text-slate-950 font-bold shadow-md shadow-rose-400/25 hover:brightness-110',
    accentPillActive: 'bg-rose-300 text-slate-950 shadow-sm font-black',
    groundingBg: 'bg-rose-950/40 border-b border-rose-900/40',
    groundingText: 'text-rose-200',
    groundingLink: 'text-rose-300 hover:text-rose-200',
    avatarGradient: 'bg-gradient-to-tr from-rose-400 to-pink-600 text-slate-950 font-bold',
    suggestionChip: 'bg-[#1e151d] border-rose-900/40 text-rose-200 hover:border-rose-400 hover:bg-[#2a1d28] hover:text-rose-100',
    welcomeAccentBadge: 'bg-rose-950/80 text-rose-300 border border-rose-900/50',
    typingText: 'text-rose-300',
    typingDot: 'bg-rose-400',
    focusRing: 'focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400',
    onlineDot: 'bg-rose-400',
  },
  'nordic-frost': {
    headerGradient: 'bg-gradient-to-r from-sky-500 via-cyan-600 to-blue-600',
    toggleGradient: 'bg-gradient-to-tr from-sky-400 via-cyan-400 to-blue-500 text-white',
    toggleShadow: 'shadow-xl shadow-sky-400/30',
    userBubbleGradient: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20',
    sendButtonGradient: 'bg-gradient-to-tr from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-500/25 hover:from-sky-400 hover:to-cyan-400',
    accentPillActive: 'bg-white text-sky-950 shadow-sm font-bold',
    groundingBg: 'bg-sky-50/90 dark:bg-sky-950/40 border-b border-sky-100 dark:border-sky-900/40',
    groundingText: 'text-sky-900 dark:text-sky-200',
    groundingLink: 'text-sky-600 dark:text-sky-300 hover:text-sky-700',
    avatarGradient: 'bg-gradient-to-tr from-sky-500 to-cyan-600 text-white',
    suggestionChip: 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-700',
    welcomeAccentBadge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60',
    typingText: 'text-sky-500',
    typingDot: 'bg-sky-500',
    focusRing: 'focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500',
    onlineDot: 'bg-sky-400',
  },
};

export const FloatingContact: React.FC = () => {
  const { theme, styles } = useTheme();
  const themeConfig = chatThemeConfigs[theme] || chatThemeConfigs['cyan-light'];
  const { user, setShowLoginModal } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [chatMode, setChatMode] = useState<'AI' | 'HUMAN'>('AI');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    '🇦🇱 Recommend an Albania 9-Day itinerary',
    '💳 What currency should I carry to Albania?',
    '🏝️ Tell me about Ksamil 4 Islands boat tour',
    '🛂 What are the visa & entry requirements?',
    '⚡ What type of electrical plugs does Albania use?'
  ]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play subtle incoming notification chime
  const playChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio playback non-critical
    }
  };

  // Determine active client ID (user's uid or guest ID from localStorage)
  const getClientIdentifier = (): { uid: string; email: string; name: string } => {
    if (user) {
      return {
        uid: user.uid,
        email: user.email,
        name: user.name || user.email.split('@')[0],
      };
    }
    let guestId = localStorage.getItem('voyage_guest_chat_id');
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      localStorage.setItem('voyage_guest_chat_id', guestId);
    }
    return {
      uid: guestId,
      email: guestEmail || localStorage.getItem('voyage_guest_email') || 'guest@voyage.travel',
      name: guestName || localStorage.getItem('voyage_guest_name') || 'Valued Traveler',
    };
  };

  const clientInfo = getClientIdentifier();

  // Subscribe to real-time messages for this client
  useEffect(() => {
    if (!clientInfo.uid) return;

    let previousLength = 0;
    const unsubscribe = ChatSupportService.subscribeToUserMessages(clientInfo.uid, (latestMessages) => {
      // Check if new admin or AI message arrived
      if (previousLength > 0 && latestMessages.length > previousLength) {
        const newest = latestMessages[latestMessages.length - 1];
        if (newest && (newest.senderRole === 'ADMIN' || newest.senderRole === 'AI')) {
          playChime();
          AuthAudit.showToast({
            title: newest.senderRole === 'AI' ? '🤖 Gemini AI Concierge' : '💬 Voyage Concierge Reply',
            message: newest.text.length > 60 ? `${newest.text.slice(0, 60)}...` : newest.text,
            type: 'info',
            duration: 4000,
          });
        }
      }
      previousLength = latestMessages.length;
      setMessages(latestMessages);

      // Compute unread count
      const unread = latestMessages.filter(m => (m.senderRole === 'ADMIN' || m.senderRole === 'AI') && !m.readByClient).length;
      setUnreadCount(unread);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid, clientInfo.uid]);

  // When modal is opened, mark messages as read by client
  useEffect(() => {
    if (isOpen && clientInfo.uid) {
      ChatSupportService.markConversationAsReadByClient(clientInfo.uid);
      setUnreadCount(0);
    }
  }, [isOpen, clientInfo.uid, messages.length]);

  // Scroll to bottom when messages update or thinking state changes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isAiThinking]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isSending) return;

    if (!user && !guestEmail && !localStorage.getItem('voyage_guest_email')) {
      const email = prompt('Please enter your email so our concierge can link your conversation:');
      if (email && email.includes('@')) {
        setGuestEmail(email);
        localStorage.setItem('voyage_guest_email', email);
      }
    }

    setIsSending(true);
    setInputText('');

    try {
      // 1. Send client message
      await ChatSupportService.sendMessage({
        userId: clientInfo.uid,
        userEmail: clientInfo.email,
        userName: clientInfo.name,
        senderRole: 'CLIENT',
        senderId: clientInfo.uid,
        senderName: clientInfo.name,
        text: textToSend,
      });

      // 2. If in Gemini AI mode, call backend Gemini LLM endpoint
      if (chatMode === 'AI') {
        setIsAiThinking(true);
        try {
          const conversationHistory = [...messages, {
            id: 'temp',
            userId: clientInfo.uid,
            userEmail: clientInfo.email,
            userName: clientInfo.name,
            senderRole: 'CLIENT' as const,
            senderId: clientInfo.uid,
            senderName: clientInfo.name,
            text: textToSend,
            timestamp: new Date().toISOString(),
            readByAdmin: true,
            readByClient: true,
          }].slice(-8).map(m => ({
            role: m.senderRole === 'CLIENT' ? 'user' as const : 'model' as const,
            text: m.text,
          }));

          const res = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: conversationHistory,
              context: {
                user: clientInfo.name,
                destination: 'Albania (Tirana, Berat, Gjirokastër, Ksamil, Blue Eye, Riviera)',
              }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const aiReply = data.reply || "I am delighted to assist with your Albanian journey!";
            if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
              setAiSuggestions(data.suggestions);
            }

            // Save AI reply to ChatSupportService so it renders in conversation
            await ChatSupportService.sendMessage({
              userId: clientInfo.uid,
              userEmail: clientInfo.email,
              userName: clientInfo.name,
              senderRole: 'AI',
              senderId: 'gemini_ai_concierge',
              senderName: 'Gemini AI Concierge',
              text: aiReply,
            });
          }
        } catch (aiErr) {
          console.error('Gemini LLM reply error:', aiErr);
          // Fallback response
          await ChatSupportService.sendMessage({
            userId: clientInfo.uid,
            userEmail: clientInfo.email,
            userName: clientInfo.name,
            senderRole: 'AI',
            senderId: 'gemini_ai_concierge',
            senderName: 'Gemini AI Concierge',
            text: `Thank you for asking about "${textToSend}". Our 9-day Albania Grand Tour covers Tirana, Berat UNESCO fortress, the Blue Eye karst spring, and Ksamil turquoise islands. How else can I assist your travel plans?`,
          });
        } finally {
          setIsAiThinking(false);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };
  const quickPrompts = [
    '🇦🇱 Recommend an Albania 9-Day itinerary',
    '🏝️ Tell me about Ksamil 4 Islands boat tour',
    '🏰 What are the top sights in Berat and Gjirokastër?',
    '🎟️ How do I use my 20% flight discount coupon?'
  ];

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end gap-3 max-w-[calc(100vw-2rem)]">
      {/* Live Chat Window */}
      {isOpen && (
        <div className={`w-[calc(100vw-2rem)] max-w-sm sm:w-[420px] h-[600px] max-h-[85vh] rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300 z-50 backdrop-blur-2xl transition-colors duration-300`}>
          
          {/* Header */}
          <div className={`${themeConfig.headerGradient} p-4 text-white relative shrink-0 shadow-md transition-all duration-300`}>
            <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
              <a
                href="https://www.instagram.com/voyage_tours._.travels"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white/90 hover:text-white flex items-center gap-1"
                title="Follow us on Instagram: @voyage_tours._.travels"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white/90 hover:text-white"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md shadow-inner text-white shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div className="min-w-0 pr-14">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm sm:text-base leading-tight text-white truncate">
                    {chatMode === 'AI' ? 'Gemini AI Travel Concierge' : 'Voyage Human Concierge'}
                  </h4>
                  <ShieldCheck className="w-4 h-4 text-white/90 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${themeConfig.onlineDot} animate-pulse shrink-0`} />
                  <span className="text-xs text-white/90 font-medium truncate">
                    {chatMode === 'AI' ? 'Gemini 3.8 Flash • Instant 24/7' : (user ? `Connected: ${user.name || user.email}` : 'Human Admin Desk Online')}
                  </span>
                </div>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="mt-3.5 p-1 rounded-2xl bg-black/20 backdrop-blur-md border border-white/15 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setChatMode('AI')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  chatMode === 'AI'
                    ? themeConfig.accentPillActive
                    : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini AI</span>
              </button>
              <button
                type="button"
                onClick={() => setChatMode('HUMAN')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  chatMode === 'HUMAN'
                    ? themeConfig.accentPillActive
                    : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Human Desk</span>
              </button>
            </div>
          </div>

          {/* Grounding in Official FAQ Portal Banner */}
          <div className={`${themeConfig.groundingBg} px-3.5 py-2 flex items-center justify-between text-[11px] shrink-0 transition-colors duration-300`}>
            <span className={`flex items-center gap-1.5 font-medium truncate ${themeConfig.groundingText}`}>
              <BookOpen className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>Grounded in Voyage Knowledge Base</span>
            </span>
            <a
              href="https://voyagefaq.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-bold ${themeConfig.groundingLink} flex items-center gap-1 shrink-0 ml-2 transition-colors`}
              title="Open Official FAQ Portal"
            >
              <span>voyagefaq.netlify.app</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Chat Messages Stream */}
          <div className={`flex-1 p-4 overflow-y-auto space-y-3.5 text-sm ${styles.cardBg} transition-colors duration-300`}>
            {/* Initial Welcome Concierge Bubble */}
            <div className="flex items-start gap-2.5 max-w-[95%]">
              <div className={`w-8 h-8 rounded-xl ${themeConfig.avatarGradient} flex items-center justify-center shrink-0 shadow-xs mt-1 transition-all duration-300`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1.5">
                  <span>Gemini AI Concierge</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span>Verified Desk</span>
                </div>
                <div className={`p-4 rounded-2xl rounded-tl-xs ${styles.cardBg} border ${styles.border} ${styles.textPrimary} text-xs leading-relaxed shadow-sm space-y-2`}>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <span className="font-extrabold text-xs">👋 Hello {user ? user.name : 'Traveler'}!</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${themeConfig.welcomeAccentBadge}`}>
                      AI Travel Desk
                    </span>
                  </div>
                  <p className={`${styles.textSecondary} text-xs leading-relaxed`}>
                    Welcome to the Voyage Concierge. I am directly linked with our official FAQ portal (
                    <a
                      href="https://voyagefaq.netlify.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${themeConfig.groundingLink} font-bold underline decoration-dotted inline-flex items-center gap-0.5`}
                    >
                      voyagefaq.netlify.app <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    ) to answer your travel questions with verified real-time information.
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-500/5 dark:bg-white/5 border border-slate-500/10 text-[11px] space-y-1">
                    <div className="font-bold text-slate-700 dark:text-slate-300">Quick inquiries I can help with:</div>
                    <div className="text-slate-500 dark:text-slate-400 space-y-0.5">
                      <div>• <strong>Albania 9-Day Grand Tour</strong> (Tirana, Berat, Ksamil & Blue Eye)</div>
                      <div>• Visas, flight discounts & currency conversions</div>
                      <div>• Custom itinerary design & hotel reservations</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rendered Live Messages */}
            {messages.map((m) => {
              const isMe = m.senderRole === 'CLIENT';
              const isAi = m.senderRole === 'AI';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-xs transition-all duration-300 ${
                      isAi
                        ? themeConfig.avatarGradient
                        : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-500'
                    }`}>
                      {isAi ? <Sparkles className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>
                  )}

                  <div className={`max-w-[85%] ${isMe ? 'text-right' : 'text-left'}`}>
                    <div className="text-[10px] font-bold text-slate-400 mb-1 px-1 flex items-center gap-1.5 justify-start">
                      {isMe ? 'You' : (isAi ? 'Gemini AI Assistant' : (m.senderName || 'Voyage Concierge'))}
                      {isAi && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${themeConfig.welcomeAccentBadge} font-normal`}>
                          LLM
                        </span>
                      )}
                    </div>
                    
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-line ${
                        isMe
                          ? `${themeConfig.userBubbleGradient} rounded-tr-xs`
                          : `${styles.cardBg} border ${styles.border} ${styles.textPrimary} rounded-tl-xs`
                      }`}
                    >
                      {m.text}
                    </div>

                    <div className={`flex items-center gap-1 text-[9px] text-slate-400 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-sky-400" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Thinking Animation */}
            {isAiThinking && (
              <div className="flex items-start gap-2 max-w-[85%] animate-in fade-in duration-200">
                <div className={`w-8 h-8 rounded-xl ${themeConfig.avatarGradient} flex items-center justify-center shrink-0 shadow-xs mt-1`}>
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className={`p-3.5 rounded-2xl rounded-tl-xs ${styles.cardBg} border ${styles.border} flex items-center gap-2 text-xs ${themeConfig.typingText}`}>
                  <span className={`w-2 h-2 rounded-full ${themeConfig.typingDot} animate-ping`} />
                  <span>Gemini AI is crafting recommendations...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Follow-up Suggestions Chips */}
          <div className={`px-3.5 py-2.5 ${styles.cardBg} border-t ${styles.border} flex flex-col gap-1.5 shrink-0 transition-colors duration-300`}>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 opacity-70" />
              <span>Suggested Inquiries</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {aiSuggestions.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isSending || isAiThinking}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-xl border shrink-0 transition-all cursor-pointer disabled:opacity-50 ${themeConfig.suggestionChip}`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className={`p-3 border-t ${styles.border} ${styles.cardBg} shrink-0 transition-colors duration-300`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={chatMode === 'AI' ? "Ask Gemini AI about Albania trips, pricing..." : "Type your message to concierge..."}
                rows={1}
                className={`flex-1 p-2.5 rounded-2xl border ${styles.border} ${styles.inputBg} ${styles.textPrimary} text-xs outline-none ${themeConfig.focusRing} transition-all resize-none max-h-20`}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending || isAiThinking}
                className={`w-10 h-10 rounded-2xl ${themeConfig.sendButtonGradient} disabled:opacity-40 text-white flex items-center justify-center active:scale-95 transition-all shrink-0 cursor-pointer`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1 gap-2">
              <a
                href="https://www.instagram.com/voyage_tours._.travels"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-500 flex items-center gap-1 transition-colors font-bold text-pink-600 dark:text-pink-400 shrink-0"
                title="Official Instagram: @voyage_tours._.travels"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-500" />
                <span>@voyage_tours._.travels</span>
              </a>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini LLM Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button with Dynamic Theme Integration */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${
          isOpen 
            ? `${styles.cardBg} border-2 ${styles.border} ${styles.textPrimary} shadow-2xl hover:scale-105 active:scale-95` 
            : `${themeConfig.toggleGradient} ${themeConfig.toggleShadow} hover:scale-110 active:scale-95`
        } flex items-center justify-center transition-all duration-300 relative cursor-pointer group`}
        title="Open Live Travel Concierge Support"
      >
        {isOpen ? (
          <X className="w-6 h-6 sm:w-7 sm:h-7" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-md animate-bounce">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};
