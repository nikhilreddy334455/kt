import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  PlusCircle,
  CheckCircle,
  Search,
  ArrowRight,
  Inbox,
  CheckCircle2,
} from 'lucide-react';
import { Item, DashboardStats } from '../lib/types';
import { api } from '../lib/api';
import { ItemCard } from '../components/ItemCard';

export const Home: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, itemsData] = await Promise.all([
          api.getDashboardStats().catch(() => null),
          api.getItems({ limit: 8 } as any).catch(() => ({ items: [], total: 0 })),
        ]);

        if (statsData) setStats(statsData);
        if (itemsData) setRecentItems(itemsData.items);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredItems = recentItems.filter((item) => {
    if (activeTab === 'all') return true;
    return item.report_type === activeTab;
  });

  return (
    <div className="space-y-10 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 shadow-xl border border-slate-800">
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-brand-300 border border-white/10 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Autonomous Campus Multimodal Match Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Lost something on campus? <br className="hidden sm:inline" />
            Let <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-300">Gemini AI</span> find it.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Upload a photo or submit a description. Our AI analyzes images, timeline logic,
            and campus locations to instantly reconnect students with their belongings.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <Link
              to="/report/lost"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Lost Item</span>
            </Link>

            <Link
              to="/report/found"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>I Found an Item</span>
            </Link>

            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-slate-200 border border-white/20 transition-all backdrop-blur-sm"
            >
              <Search className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-brand-600">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Reports
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {stats ? stats.totalItems : '—'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Lost
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {stats ? stats.totalLost : '—'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              AI Matches Found
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {stats ? stats.totalMatches : '—'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Resolved Items
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {stats ? stats.totalResolved : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Feature Spotlight */}
      <section className="bg-gradient-to-r from-slate-100 via-indigo-50/50 to-slate-100 rounded-3xl p-6 sm:p-8 border border-slate-200/80">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            How Campus AI Matching Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reconnecting items with multimodal intelligence and reasoning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Multimodal Intake</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Users submit photos, color descriptions, defining marks, precise campus coordinates,
              and event timestamps.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Gemini 2.5 Flash Reasoning</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gemini analyzes visual stickers, wear and tear, and verifies that an item was not
              found prior to the loss timestamp.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Confidence Scoring &amp; Alert</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generates a verified 0-100% confidence score with an analytical explanation and
              facilitates instant reconnection.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Items Feed */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Recent Campus Reports</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Newly registered lost and found items awaiting reconnection
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
              {(['all', 'lost', 'found'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <Link
              to="/search"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-72 rounded-2xl bg-slate-200/60 animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No items reported in this category</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Be the first to report a lost or found item.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/report/lost"
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Report Lost
              </Link>
              <Link
                to="/report/found"
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Report Found
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
