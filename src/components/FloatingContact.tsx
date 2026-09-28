import React, { useState } from 'react';
import { MessageSquare, Phone, X, Send, Clock, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

export const FloatingContact: React.FC = () => {
  const { styles } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className={`w-80 sm:w-96 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300`}>
          {/* Header */}
          <div className="bg-sky-500 p-6 text-white relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg leading-tight text-white">Voyage Concierge</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                   <span className="text-xs text-sky-100 font-medium text-white">Expert online now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {sent ? (
              <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto">
                   <Send className="w-8 h-8" />
                </div>
                <div>
                   <h5 className={`font-bold text-lg ${styles.textPrimary}`}>Message Sent!</h5>
                   <p className={`text-sm ${styles.textMuted}`}>Our concierge will reply to your registered email within 15 minutes.</p>
                </div>
                <button 
                  onClick={() => { setSent(false); setIsOpen(false); }}
                  className={`w-full py-3 rounded-xl font-bold text-sm ${styles.buttonSecondary}`}
                >
                  Close Window
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <p className={`text-sm ${styles.textSecondary} leading-relaxed`}>
                    Looking for a custom itinerary or have questions about a luxury package? Our team is ready to help you plan the perfect trip.
                  </p>
                  <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border ${styles.border} flex items-center gap-3`}>
                    <Clock className="w-5 h-5 text-sky-500" />
                    <span className={`text-xs font-medium ${styles.textPrimary}`}>Average response time: <span className="font-bold">12 mins</span></span>
                  </div>
                </div>

                <div className="space-y-4">
                   <textarea 
                     placeholder="How can we help you today?"
                     rows={3}
                     className={`w-full p-4 rounded-2xl border ${styles.border} ${styles.inputBg} text-sm outline-none focus:ring-2 focus:ring-sky-500/50 transition-all resize-none ${styles.textPrimary}`}
                   ></textarea>
                   <button 
                     onClick={() => setSent(true)}
                     className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold transition-all shadow-xl shadow-sky-500/20 active:scale-95 flex items-center justify-center gap-2"
                   >
                     <MessageSquare className="w-5 h-5" />
                     Start Conversation
                   </button>
                   <button className={`w-full py-3 flex items-center justify-center gap-2 text-xs font-bold ${styles.textMuted} hover:text-sky-500 transition-colors`}>
                     <Phone className="w-4 h-4" />
                     Prefer a call? +91 9567465134
                   </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full ${isOpen ? 'bg-slate-900' : 'bg-sky-500'} text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-300 group relative`}
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <>
            <MessageSquare className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 animate-bounce">1</span>
          </>
        )}
      </button>
    </div>
  );
};
