import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Clock,
  Mail,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Eye,
  X,
} from 'lucide-react';
import { Item, ItemMatch } from '../lib/types';
import { MatchScoreBadge } from './MatchScoreBadge';

interface MatchListProps {
  matches: ItemMatch[];
  currentItem: Item;
  onRefreshMatches?: () => void;
  isRefreshing?: boolean;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches,
  currentItem,
  onRefreshMatches,
  isRefreshing = false,
}) => {
  const [comparingMatch, setComparingMatch] = useState<ItemMatch | null>(null);

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h4 className="text-base font-semibold text-slate-800">
          No AI Matches Computed Yet
        </h4>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
          Our Gemini AI Matching Engine compares items based on visual features,
          location proximity, and timestamps.
        </p>
        {onRefreshMatches && (
          <button
            onClick={onRefreshMatches}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Scanning with Gemini AI...' : 'Run AI Match Scan'}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Matches Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Top AI-Generated Matches ({matches.length})
          </h3>
        </div>

        {onRefreshMatches && (
          <button
            onClick={onRefreshMatches}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Re-analyzing...' : 'Re-run AI Matching'}</span>
          </button>
        )}
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {matches.map((match) => {
          const matchedItem = match.matched_item;
          if (!matchedItem) return null;

          const isHighMatch = match.confidence_score >= 80;

          return (
            <div
              key={match.id}
              className={`rounded-2xl border transition-all duration-200 p-5 ${
                isHighMatch
                  ? 'bg-gradient-to-r from-emerald-50/40 via-white to-white border-emerald-300 shadow-sm'
                  : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Matched item image */}
                <div className="relative w-full md:w-36 h-36 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                  <img
                    src={matchedItem.image_url}
                    alt={matchedItem.title}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      matchedItem.report_type === 'lost'
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {matchedItem.report_type}
                  </span>
                </div>

                {/* Match details & AI explanation */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
                          <Link to={`/item/${matchedItem.id}`}>
                            {matchedItem.title}
                          </Link>
                        </h4>
                        {matchedItem.status === 'resolved' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Resolved
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-slate-500">
                        Category: {matchedItem.category}
                      </span>
                    </div>

                    {/* Confidence Score Badge */}
                    <MatchScoreBadge score={match.confidence_score} size="md" />
                  </div>

                  {/* AI Explanation Box */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      Gemini 2.5 Flash Reasoning:
                    </div>
                    <p className="text-slate-600 italic">"{match.explanation}"</p>
                  </div>

                  {/* Metadata & Quick Contacts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        <strong>Found at:</strong> {matchedItem.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {new Date(matchedItem.event_time).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setComparingMatch(match)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Side-by-Side Compare
                    </button>

                    <Link
                      to={`/item/${matchedItem.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                    >
                      <span>View Matched Report</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {matchedItem.contact_info && (
                      <div className="ml-auto flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                        <Mail className="w-3.5 h-3.5 text-brand-500" />
                        <span className="font-medium">Contact:</span>
                        <span className="font-mono text-slate-800">{matchedItem.contact_info}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Modal */}
      {comparingMatch && comparingMatch.matched_item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8">
            <button
              onClick={() => setComparingMatch(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 pr-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Multimodal AI Match Inspection
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct visual and semantic comparison evaluated by Gemini 2.5 Flash
                </p>
              </div>
              <MatchScoreBadge score={comparingMatch.confidence_score} size="lg" />
            </div>

            {/* AI Explanation Callout */}
            <div className="my-5 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/70">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI Assessment &amp; Rationale:
              </div>
              <p className="text-sm text-indigo-950 font-medium">
                {comparingMatch.explanation}
              </p>
            </div>

            {/* Side-by-Side Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Item (Left) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${
                        currentItem.report_type === 'lost' ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}
                    >
                      Current {currentItem.report_type.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {currentItem.category}
                    </span>
                  </div>

                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 mb-4 border border-slate-300/50">
                    <img
                      src={currentItem.image_url}
                      alt={currentItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{currentItem.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {currentItem.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-xs space-y-1.5 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Location:</strong> {currentItem.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Date/Time:</strong>{' '}
                    {new Date(currentItem.event_time).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Matched Candidate (Right) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${
                        comparingMatch.matched_item.report_type === 'lost'
                          ? 'bg-rose-600'
                          : 'bg-emerald-600'
                      }`}
                    >
                      Matched {comparingMatch.matched_item.report_type.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {comparingMatch.matched_item.category}
                    </span>
                  </div>

                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 mb-4 border border-slate-300/50">
                    <img
                      src={comparingMatch.matched_item.image_url}
                      alt={comparingMatch.matched_item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h4 className="text-base font-bold text-slate-900">
                    {comparingMatch.matched_item.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {comparingMatch.matched_item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-xs space-y-1.5 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Location:</strong> {comparingMatch.matched_item.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Date/Time:</strong>{' '}
                    {new Date(comparingMatch.matched_item.event_time).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Contact:</strong> {comparingMatch.matched_item.contact_info}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setComparingMatch(null)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
