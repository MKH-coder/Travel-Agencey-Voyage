import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

export const Newsletter: React.FC = () => {
  const { styles } = useTheme();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className={`relative p-8 sm:p-12 rounded-[2.5rem] border ${styles.border} ${styles.cardBg} overflow-hidden shadow-2xl`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-xl space-y-6 text-center lg:text-left">
            <h3 className={`text-3xl sm:text-4xl font-black ${styles.textPrimary} tracking-tight`}>
              Get the World's Best <br />
              <span className="text-sky-500">Travel Secrets</span> in Your Inbox.
            </h3>
            <p className={`text-base ${styles.textMuted} leading-relaxed`}>
              Join our exclusive club of 50,000+ explorers. No spam, just hand-curated deals, secret destinations, and expert travel tips once a week.
            </p>
          </div>

          <div className="w-full max-w-md">
            {subscribed ? (
              <div className="flex flex-col items-center lg:items-start gap-4 animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="text-center lg:text-left">
                  <h4 className={`text-xl font-bold ${styles.textPrimary}`}>You're on the list!</h4>
                  <p className={`text-sm ${styles.textMuted}`}>Check your email for your first travel secret.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className={`relative flex items-center p-2 rounded-2xl border ${styles.border} ${styles.bg} shadow-sm`}>
                  <Mail className="w-5 h-5 ml-3 text-slate-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    className={`flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm ${styles.textPrimary}`}
                  />
                  <button 
                    type="submit"
                    className="p-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold transition-all shadow-lg shadow-sky-500/20 active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-4 text-[10px] text-center lg:text-left text-slate-400 px-2 uppercase tracking-widest font-bold">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
