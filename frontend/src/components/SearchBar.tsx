import React from 'react';
import { Search, Filter, X, Calendar, Layers, CheckCircle } from 'lucide-react';
import { TARGET_CATEGORIES, SearchFilters } from '../lib/types';

interface SearchBarProps {
  filters: SearchFilters;
  onChange: (updatedFilters: SearchFilters) => void;
  onReset: () => void;
  totalCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  onChange,
  onReset,
  totalCount,
}) => {
  const hasActiveFilters = Boolean(
    filters.query ||
      (filters.type && filters.type !== 'all') ||
      (filters.category && filters.category !== 'All') ||
      (filters.status && filters.status !== 'all') ||
      filters.startDate ||
      filters.endDate
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Primary Search Bar */}
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={filters.query || ''}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search by keywords, title, description, or campus building..."
          className="w-full pl-11 pr-10 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
        />
        {filters.query && (
          <button
            onClick={() => onChange({ ...filters, query: '' })}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Report Type
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
            {(['all', 'lost', 'found'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ ...filters, type })}
                className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  (filters.type || 'all') === type
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Category
          </label>
          <select
            value={filters.category || 'All'}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-slate-700"
          >
            <option value="All">All Categories</option>
            {TARGET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Item Status
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as 'all' | 'active' | 'resolved',
              })
            }
            className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="resolved">Resolved Only</option>
          </select>
        </div>

        {/* Date Filter Range */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Date Since
          </label>
          <input
            type="date"
            value={filters.startDate ? filters.startDate.split('T')[0] : ''}
            onChange={(e) => {
              const dateVal = e.target.value ? new Date(e.target.value).toISOString() : undefined;
              onChange({ ...filters, startDate: dateVal });
            }}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-700"
          />
        </div>
      </div>

      {/* Footer bar with results count and reset button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div>
          {typeof totalCount === 'number' && (
            <span>
              Showing <strong className="text-slate-800">{totalCount}</strong> matching items
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 py-1 px-2 rounded hover:bg-brand-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};
