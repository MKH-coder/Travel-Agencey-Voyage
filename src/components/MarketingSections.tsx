import React from 'react';
import { ShieldCheck, Zap, Heart, Award, Star, Quote, ArrowRight, MapPin, Users, Globe, Layers, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { AlbaniaPdfService } from '../services/albaniaPdfService.ts';

interface MarketingSectionsProps {
  onPlanTrip?: () => void;
  onBrowsePackages?: () => void;
  onReadReviews?: () => void;
  onOpenAlbaniaModal?: (tier?: 'basic' | 'midrange' | 'luxury') => void;
}

export const MarketingSections: React.FC<MarketingSectionsProps> = ({
  onPlanTrip,
  onBrowsePackages,
  onReadReviews,
  onOpenAlbaniaModal,
}) => {
  const { styles } = useTheme();

  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      title: "Verified Experiences",
      description: "Every hotel, restaurant, and tour is hand-vetted by our local experts to ensure premium quality."
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: "Direct Pricing",
      description: "No hidden middleman fees. We negotiate directly with providers to get you the absolute best rates."
    },
    {
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      title: "Personalized Care",
      description: "Our 24/7 concierge team treats you like family, handling every detail from takeoff to landing."
    },
    {
      icon: <Award className="w-6 h-6 text-sky-500" />,
      title: "Award Winning",
      description: "Consistently rated #1 for customer satisfaction and innovative travel technology in 2025."
    }
  ];

  const testimonials = [
    {
      name: "Sophia Martinez",
      role: "Luxury Traveler",
      text: "The Amalfi Coast package was absolute perfection. The attention to detail and curated dining spots were beyond my expectations.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80",
      rating: 5
    },
    {
      name: "David Chen",
      role: "Adventure Enthusiast",
      text: "Voyage makes booking complex itineraries so simple. I've never had such a seamless experience from start to finish.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80",
      rating: 5
    },
    {
      name: "Emma Wilson",
      role: "Food & Wine Critic",
      text: "The culinary tours in Kyoto were a revelation. Real, authentic spots that you simply won't find in any guidebook.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&q=80",
      rating: 5
    }
  ];

  return (
    <div className="space-y-24 py-24 overflow-hidden">
      {/* Why Choose Us Section */}
      <section id="marketing-advantage" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className={`text-sm font-black uppercase tracking-[0.2em] text-sky-500`}>The Voyage Advantage</h2>
          <h3 className={`text-3xl sm:text-4xl font-black ${styles.textPrimary} tracking-tight`}>
            Why Modern Travelers Choose Us
          </h3>
          <p className={`text-base ${styles.textMuted}`}>
            We've redefined the travel experience by combining cutting-edge technology with the human touch of expert curation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`p-8 rounded-[2.5rem] border ${styles.border} ${styles.cardBg} hover:shadow-xl hover:scale-[1.02] transition-all duration-500 group`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6 border ${styles.border} group-hover:scale-110 transition-transform duration-500`}>
                {feature.icon}
              </div>
              <h4 className={`text-lg font-bold mb-3 ${styles.textPrimary}`}>{feature.title}</h4>
              <p className={`text-sm leading-relaxed ${styles.textMuted}`}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-20 border-y ${styles.border} relative`}>
        <div className="absolute inset-0 bg-sky-500/5 backdrop-blur-[2px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-center">
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-sky-500">50k+</div>
              <div className={`text-xs font-bold uppercase tracking-widest ${styles.textMuted}`}>Happy Travelers</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-emerald-500">120+</div>
              <div className={`text-xs font-bold uppercase tracking-widest ${styles.textMuted}`}>Curated Destinations</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-amber-500">24/7</div>
              <div className={`text-xs font-bold uppercase tracking-widest ${styles.textMuted}`}>Real Support</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-rose-500">99%</div>
              <div className={`text-xs font-bold uppercase tracking-widest ${styles.textMuted}`}>Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Albania 9-Day Expedition Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 sm:p-12 rounded-[3rem] border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-sky-500/5 to-transparent relative overflow-hidden shadow-sm`}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-black uppercase tracking-widest">
                <span>🇦🇱 Featured Expedition • 9–19 Oct 2026</span>
              </div>
              <h3 className={`text-3xl sm:text-4xl font-black ${styles.textPrimary} tracking-tight`}>
                Albania 9-Day Grand Tour: Tirana to Riviera
              </h3>
              <p className={`text-sm ${styles.textSecondary} leading-relaxed`}>
                Experience the complete 9-day circuit from India across Skanderbeg Square, Mount Dajti, Berat UNESCO castle, Gjirokastër stone fortress, Blue Eye natural spring, Ksamil 4 islands boat tour, Butrint UNESCO park, and the dramatic Albanian Riviera coast (Jalë, Dhërmi, Llogara Pass, Vlorë). Available in 3 verified tiers with official downloadable PDF itineraries.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Basic: ₹1.11L–₹1.26L
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                  Mid-Range: ₹1.43L–₹1.67L (Recommended)
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
                  Luxury VIP: ₹4.24L–₹4.73L
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onOpenAlbaniaModal?.('midrange')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Explore 9-Day Itinerary</span>
              </button>
              <button
                type="button"
                onClick={() => AlbaniaPdfService.generateTierPdf('midrange')}
                className="px-6 py-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF (11 Pages)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl space-y-4">
            <h2 className={`text-sm font-black uppercase tracking-[0.2em] text-sky-500`}>Testimonials</h2>
            <h3 className={`text-3xl sm:text-4xl font-black ${styles.textPrimary} tracking-tight`}>
              Stories from the World's Best Explorers
            </h3>
          </div>
          <button 
            id="marketing-read-reviews-btn"
            onClick={onReadReviews}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm ${styles.buttonSecondary} transition-all`}
          >
            Read All Reviews <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div 
              key={idx} 
              className={`p-8 rounded-[2.5rem] border ${styles.border} ${styles.cardBg} flex flex-col justify-between space-y-6 relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                <Quote className={`w-32 h-32 ${styles.textPrimary}`} />
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className={`text-base leading-relaxed italic ${styles.textPrimary}`}>"{t.text}"</p>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-sky-500/20" />
                <div>
                  <h5 className={`font-bold text-sm ${styles.textPrimary}`}>{t.name}</h5>
                  <p className={`text-xs ${styles.textMuted}`}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`relative p-8 sm:p-16 rounded-[3rem] overflow-hidden bg-gradient-to-br from-slate-900 to-black text-white shadow-2xl`}>
          <div className="absolute inset-0 opacity-20">
             <img src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Ksamill-1.jpg" alt="Albanian Riviera Ksamil" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl space-y-8">
             <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-sky-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-sky-400">Ready to Explore?</span>
             </div>
             <h3 className="text-4xl sm:text-5xl font-black tracking-tighter leading-tight">
                Your Next Extraordinary <br />
                <span className="text-sky-400">Adventure Starts Here.</span>
             </h3>
             <p className="text-lg text-slate-300 leading-relaxed">
                Join 50,000+ travelers who have discovered the smarter way to explore the globe. Curated by experts, powered by you.
             </p>
             <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  id="cta-plan-trip-btn"
                  onClick={onPlanTrip}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold transition-all shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Plan Your Trip Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  id="cta-browse-packages-btn"
                  onClick={onBrowsePackages}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold backdrop-blur-md border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Browse Packages</span>
                </button>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};
