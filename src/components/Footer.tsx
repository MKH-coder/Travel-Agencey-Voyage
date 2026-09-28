import React from 'react';
import { Compass, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ShieldCheck, Globe, CreditCard, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

export const Footer: React.FC = () => {
  const { styles, theme } = useTheme();

  return (
    <footer className={`border-t ${styles.border} ${styles.cardBg} pt-16 pb-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${styles.accent} text-white shadow-lg shadow-sky-500/20`}>
                <Compass className="w-6 h-6" />
              </div>
              <span className={`text-2xl font-black tracking-tight ${styles.textPrimary}`}>
                Voyage<span className="text-sky-500">.</span>
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${styles.textMuted}`}>
              Crafting extraordinary journeys for the modern explorer. From hidden gems to luxury retreats, we curate experiences that transcend the ordinary.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${styles.textMuted} hover:text-sky-500 transition-colors`}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${styles.textMuted} hover:text-sky-500 transition-colors`}>
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${styles.textMuted} hover:text-sky-500 transition-colors`}>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${styles.textMuted} hover:text-sky-500 transition-colors`}>
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-6 ${styles.textPrimary}`}>Explore</h4>
            <ul className="space-y-4">
              <li><a href="#" className={`text-sm ${styles.textMuted} hover:text-sky-500 transition-colors`}>Popular Destinations</a></li>
              <li><a href="#" className={`text-sm ${styles.textMuted} hover:text-sky-500 transition-colors`}>Luxury Packages</a></li>
              <li><a href="#" className={`text-sm ${styles.textMuted} hover:text-sky-500 transition-colors`}>Last Minute Deals</a></li>
              <li><a href="#" className={`text-sm ${styles.textMuted} hover:text-sky-500 transition-colors`}>Culinary Tours</a></li>
              <li><a href="#" className={`text-sm ${styles.textMuted} hover:text-sky-500 transition-colors`}>Adventure Trips</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-6 ${styles.textPrimary}`}>Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className={`text-sm ${styles.textMuted} hover:text-sky-500 transition-colors`}>Help Center</a></li>
              <li><a href="#" className={`text-sm ${styles.textMuted} hover:text-sky-500 transition-colors`}>Privacy Policy</a></li>
              <li><a href="#" className={`text-sm ${styles.textMuted} hover:text-sky-500 transition-colors`}>Terms of Service</a></li>
              <li><a href="#" className={`text-sm ${styles.textMuted} hover:text-sky-500 transition-colors`}>Trust & Safety</a></li>
              <li><a href="#" className={`text-sm ${styles.textMuted} hover:text-sky-500 transition-colors`}>Travel Insurance</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div id="footer-contact">
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-6 ${styles.textPrimary}`}>Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-500 shrink-0" />
                <span className={`text-sm ${styles.textMuted}`}>123 Travel Lane, Suite 456<br />Global City, World 90210</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-sky-500 shrink-0" />
                <span className={`text-sm ${styles.textMuted}`}>+91 9567465134</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-sky-500 shrink-0" />
                <a href="mailto:voyage@gmail.com" className={`text-sm ${styles.textMuted} hover:text-sky-500 transition-colors`}>
                  voyage@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Bar */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-8 border-y ${styles.border} mb-8`}>
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-sky-500" />
            <span className={`text-xs font-bold ${styles.textPrimary}`}>200+ Countries Covered</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className={`text-xs font-bold ${styles.textPrimary}`}>Secure Multi-Factor Auth</span>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-amber-500" />
            <span className={`text-xs font-bold ${styles.textPrimary}`}>Flexible Payment Plans</span>
          </div>
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-rose-500" />
            <span className={`text-xs font-bold ${styles.textPrimary}`}>24/7 Concierge Support</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className={`text-[11px] ${styles.textMuted} flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2`}>
            <span>&copy; 2026 Voyage Platform Inc.</span>
            <span>•</span>
            <span>All Rights Reserved</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> by 
              <span className={`font-bold ${styles.textPrimary}`}>Voyage Team</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold ${styles.textMuted} uppercase`}>Theme</span>
                <div className={`px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold ${styles.textPrimary} border ${styles.border} capitalize`}>
                  {theme.replace('-', ' ')}
                </div>
             </div>
             <div className="flex items-center gap-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-help" title="Visa Accepted" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-help" title="Mastercard Accepted" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="PayPal" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-help" title="PayPal Accepted" />
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
