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
import { SupportMessage } from '../types.ts';
import { AuthAudit } from '../services/authAudit.ts';

export const FloatingContact: React.FC = () => {
  const { styles } = useTheme();
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
        <div className={`w-[calc(100vw-2rem)] max-w-sm sm:w-[410px] h-[580px] max-h-[85vh] rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300 z-50 backdrop-blur-xl`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 p-4 text-white relative shrink-0 shadow-md">
            <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
              <a
                href="https://www.instagram.com/voyage_tours._.travels"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white flex items-center gap-1"
                title="Follow us on Instagram: @voyage_tours._.travels"
              >
                <Instagram className="w-4 h-4 text-pink-300 hover:text-white transition-colors" />
              </a>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md shadow-inner text-white">
                <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-base leading-tight text-white">
                    {chatMode === 'AI' ? 'Gemini AI Travel Concierge' : 'Voyage Human Concierge'}
                  </h4>
                  <ShieldCheck className="w-4 h-4 text-sky-200" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-sky-100 font-medium">
                    {chatMode === 'AI' ? 'Gemini 3.8 Flash • Instant 24/7' : (user ? `Connected: ${user.name || user.email}` : 'Human Admin Desk Online')}
                  </span>
                </div>
              </div>
            </div>

            {/* Mode Switcher Pills */}
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setChatMode('AI')}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  chatMode === 'AI'
                    ? 'bg-white text-indigo-900 shadow-md font-black'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>🤖 Gemini AI</span>
              </button>
              <button
                type="button"
                onClick={() => setChatMode('HUMAN')}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  chatMode === 'HUMAN'
                    ? 'bg-white text-indigo-900 shadow-md font-black'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-sky-300" />
                <span>👤 Human Desk</span>
              </button>
            </div>
          </div>

          {/* Grounding in Official FAQ Portal Banner */}
          <div className="bg-sky-500/10 dark:bg-sky-500/15 px-3.5 py-2 border-b border-sky-500/20 flex items-center justify-between text-[11px] text-sky-700 dark:text-sky-300 shrink-0">
            <span className="flex items-center gap-1.5 font-medium truncate">
              <BookOpen className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>Grounded in Voyage Knowledge Base</span>
            </span>
            <a
              href="https://voyagefaq.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
              title="Open Official FAQ Portal"
            >
              <span>voyagefaq.netlify.app</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-sm">
            {/* Initial Welcome Concierge Bubble */}
            <div className="flex items-start gap-2.5 max-w-[95%]">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">Gemini AI Concierge</div>
                <div className="p-3.5 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs leading-relaxed shadow-xs space-y-1.5">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>👋 Hello {user ? user.name : 'Traveler'}!</span>
                    <span className="text-[10px] font-normal text-sky-500 bg-sky-500/10 px-1.5 py-0.5 rounded-full">AI Travel Desk</span>
                  </p>
                  <p className="text-slate-700 dark:text-slate-200">
                    Welcome to the Voyage AI Concierge. I am directly linked with our official FAQ portal (
                    <a
                      href="https://voyagefaq.netlify.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-500 dark:text-sky-400 font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      voyagefaq.netlify.app <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    ) to answer your travel questions with verified information.
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Inquire about our <strong>Albania 9-Day Grand Tour</strong>, visas & flights, currency & payments, custom trip design, or hotel reservations!
                  </p>
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
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-xs ${
                      isAi
                        ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white'
                        : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-500'
                    }`}>
                      {isAi ? <Sparkles className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>
                  )}

                  <div className={`max-w-[85%] ${isMe ? 'text-right' : 'text-left'}`}>
                    <div className="text-[10px] font-bold text-slate-400 mb-0.5 px-1 flex items-center gap-1.5 justify-start">
                      {isMe ? 'You' : (isAi ? 'Gemini AI Assistant' : (m.senderName || 'Voyage Concierge'))}
                      {isAi && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-normal">
                          LLM
                        </span>
                      )}
                    </div>
                    
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-md whitespace-pre-line ${
                        isMe
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-medium rounded-tr-xs shadow-sky-500/20'
                          : `bg-white dark:bg-slate-900 border border-sky-500/30 text-slate-900 dark:text-slate-100 font-medium rounded-tl-xs shadow-sm`
                      }`}
                    >
                      {m.text}
                    </div>

                    <div className={`flex items-center gap-1 text-[9px] text-slate-400 mt-0.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-sky-400" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Thinking Animation */}
            {isAiThinking && (
              <div className="flex items-start gap-2 max-w-[80%] animate-in fade-in duration-200">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className={`p-3.5 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-900 border ${styles.border} flex items-center gap-2 text-xs text-sky-600 dark:text-sky-400`}>
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                  <span>Gemini AI is crafting recommendations...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Follow-up Suggestions Chips */}
          <div className="px-3 py-2 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap gap-1.5 shrink-0 max-h-24 overflow-y-auto">
            {aiSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isSending || isAiThinking}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 transition-all text-left truncate max-w-full cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 shrink-0">
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
                className={`flex-1 p-2.5 rounded-2xl border ${styles.border} ${styles.inputBg} ${styles.textPrimary} text-xs outline-none focus:ring-2 focus:ring-sky-500/50 transition-all resize-none max-h-20`}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending || isAiThinking}
                className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 hover:opacity-90 disabled:opacity-40 text-white flex items-center justify-center shadow-md shadow-sky-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Gemini LLM Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button with Real Unread Counter */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${
          isOpen ? 'bg-slate-900 text-white' : 'bg-gradient-to-tr from-sky-500 via-sky-400 to-indigo-600 text-white shadow-xl shadow-sky-500/30'
        } flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 relative cursor-pointer group`}
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
