import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Package, TrendingUp, DollarSign, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { Booking, Listing } from '../types.ts';

interface AdminPackageAnalyticsProps {
  bookings: Booking[];
  listings: Listing[];
}

export const AdminPackageAnalytics: React.FC<AdminPackageAnalyticsProps> = ({
  bookings,
  listings,
}) => {
  const { styles } = useTheme();

  const analytics = useMemo(() => {
    const packageBookings = bookings.filter(b => b.listingCategory === 'PACKAGE');
    const totalBooked = packageBookings.length;

    // Calculate Popular Bundles
    const bundleCounts: Record<string, { count: number; title: string; revenue: number }> = {};
    packageBookings.forEach(b => {
      if (!bundleCounts[b.listingId]) {
        bundleCounts[b.listingId] = { count: 0, title: b.listingTitle, revenue: 0 };
      }
      bundleCounts[b.listingId].count++;
      bundleCounts[b.listingId].revenue += b.totalPrice;
    });

    const popularBundlesData = Object.values(bundleCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate Average Discount Yield
    const packages = listings.filter(l => l.category === 'PACKAGE');
    let totalYield = 0;
    let packagesWithYield = 0;

    packages.forEach(pkg => {
      if (pkg.listingIds && pkg.listingIds.length > 0) {
        const componentPrices = pkg.listingIds.map(id => {
          const item = listings.find(l => l.id === id);
          return item ? item.price : 0;
        });
        const originalSum = componentPrices.reduce((a, b) => a + b, 0);
        if (originalSum > 0) {
          const discount = originalSum - pkg.price;
          const pkgYield = (discount / originalSum) * 100;
          totalYield += pkgYield;
          packagesWithYield++;
        }
      }
    });

    const avgYield = packagesWithYield > 0 ? Math.round(totalYield / packagesWithYield) : 0;

    return {
      totalBooked,
      avgYield,
      popularBundlesData,
      totalRevenue: packageBookings.reduce((sum, b) => sum + b.totalPrice, 0),
    };
  }, [bookings, listings]);

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Award className="w-5 h-5 text-amber-500" />
        <h3 className={`text-base font-bold ${styles.textPrimary}`}>Luxury Package Performance</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bundles Sold</span>
          </div>
          <div className={`text-2xl font-black ${styles.textPrimary}`}>{analytics.totalBooked}</div>
          <div className="text-[10px] text-emerald-500 mt-1 font-medium">Platform growth: +12%</div>
        </div>

        <div className={`p-4 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg. Discount Yield</span>
          </div>
          <div className={`text-2xl font-black text-emerald-500`}>{analytics.avgYield}%</div>
          <div className="text-[10px] text-slate-400 mt-1">Consumer savings index</div>
        </div>

        <div className={`p-4 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bundle Revenue</span>
          </div>
          <div className={`text-2xl font-black ${styles.textPrimary}`}>${analytics.totalRevenue.toLocaleString()}</div>
          <div className="text-[10px] text-sky-500 mt-1">Direct platform value</div>
        </div>
      </div>

      <div className={`p-6 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm`}>
        <div className="mb-6">
          <h4 className={`text-sm font-bold ${styles.textPrimary}`}>Top Performing Packages</h4>
          <p className="text-[10px] text-slate-400">Total booking volume by curated bundle title</p>
        </div>

        <div className="h-64 w-full">
          {analytics.popularBundlesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.popularBundlesData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="title"
                  type="category"
                  tick={{ fontSize: 10, fontWeight: 600, fill: styles.textMuted.includes('slate-400') ? '#94a3b8' : '#64748b' }}
                  width={150}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                  itemStyle={{ color: '#0ea5e9', fontWeight: 800 }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {analytics.popularBundlesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50 space-y-2">
              <Package className="w-8 h-8" />
              <p className="text-xs font-medium">Insufficient package data to generate trends</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
