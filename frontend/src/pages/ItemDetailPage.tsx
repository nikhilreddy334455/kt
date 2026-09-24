import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Tag,
  Mail,
  CheckCircle2,
  AlertCircle,
  Share2,
  Loader2,
  Check,
} from 'lucide-react';
import { Item, ItemMatch } from '../lib/types';
import { api } from '../lib/api';
import { MatchList } from '../components/MatchList';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<Item | null>(null);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshingMatches, setIsRefreshingMatches] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItemAndMatches() {
      if (!id) return;
      try {
        setLoading(true);
        setErrorMessage(null);

        const [itemData, matchesData] = await Promise.all([
          api.getItemById(id),
          api.getItemMatches(id),
        ]);

        setItem(itemData);
        setMatches(matchesData);
      } catch (err: any) {
        console.error('Failed to load item detail:', err);
        setErrorMessage(err.message || 'Unable to load item details.');
      } finally {
        setLoading(false);
      }
    }

    fetchItemAndMatches();
  }, [id]);

  const handleManualTriggerMatching = async () => {
    if (!id) return;
    try {
      setIsRefreshingMatches(true);
      const updatedMatches = await api.triggerMatch(id);
      setMatches(updatedMatches);
    } catch (err: any) {
      console.error('Manual match trigger failed:', err);
      alert('Could not trigger AI matching engine: ' + err.message);
    } finally {
      setIsRefreshingMatches(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!item) return;
    const newStatus = item.status === 'active' ? 'resolved' : 'active';
    try {
      setIsUpdatingStatus(true);
      const updated = await api.updateItemStatus(item.id, newStatus);
      setItem(updated);
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600 mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading item and AI matches...</p>
      </div>
    );
  }

  if (errorMessage || !item) {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Item Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">{errorMessage || 'The requested item does not exist.'}</p>
        <button
          onClick={() => navigate('/search')}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Search
        </button>
      </div>
    );
  }

  const isLost = item.report_type === 'lost';
  const isResolved = item.status === 'resolved';

  const formattedDate = new Date(item.event_time).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Back button and page breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Share Item</span>
              </>
            )}
          </button>

          <button
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-sm ${
              isResolved
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isResolved ? 'Re-open Item' : 'Mark as Resolved'}</span>
          </button>
        </div>
      </div>

      {/* Main Item Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: High-Res Item Photo */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-md ${
                  isLost ? 'bg-rose-600' : 'bg-emerald-600'
                }`}
              >
                {item.report_type}
              </span>
              {isResolved && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-md">
                  Resolved
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-700 backdrop-blur-md shadow-sm border border-slate-200">
                {item.category}
              </span>
            </div>
          </div>

          {/* Contact Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-brand-600" />
              Reporter Contact Details
            </h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-sm font-mono font-medium text-slate-800">
                {item.contact_info}
              </span>
              <a
                href={`mailto:${item.contact_info}`}
                className="text-xs font-bold text-brand-600 hover:text-brand-800 px-2 py-1 rounded bg-brand-50 hover:bg-brand-100 transition-colors"
              >
                Send Message
              </a>
            </div>
            <p className="text-[11px] text-slate-400">
              Only verified campus community members should initiate contact.
            </p>
          </div>
        </div>

        {/* Right Column: Metadata & AI Match Engine Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.category}</span>
                <span>&bull;</span>
                <span>Report ID: {item.id.slice(0, 8)}...</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {item.title}
              </h1>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Full Item Description &amp; Visual Identifiers
              </h4>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {item.description}
              </p>
            </div>

            {/* Metadata Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase">
                    Campus Location
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    {item.location}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase">
                    Date &amp; Time
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Matches Section */}
          <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <MatchList
              matches={matches}
              currentItem={item}
              onRefreshMatches={handleManualTriggerMatching}
              isRefreshing={isRefreshingMatches}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
