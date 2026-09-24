import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { ItemCard } from '../components/ItemCard';
import { Item, SearchFilters } from '../lib/types';
import { api } from '../lib/api';
import { Inbox, Loader2 } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL query parameters if present
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    type: (searchParams.get('type') as any) || 'all',
    category: searchParams.get('category') || 'All',
    status: (searchParams.get('status') as any) || 'all',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  });

  const [items, setItems] = useState<Item[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Synchronize state with URL params
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);

    const params = new URLSearchParams();
    if (newFilters.query) params.set('q', newFilters.query);
    if (newFilters.type && newFilters.type !== 'all') params.set('type', newFilters.type);
    if (newFilters.category && newFilters.category !== 'All') params.set('category', newFilters.category);
    if (newFilters.status && newFilters.status !== 'all') params.set('status', newFilters.status);
    if (newFilters.startDate) params.set('startDate', newFilters.startDate);
    if (newFilters.endDate) params.set('endDate', newFilters.endDate);

    setSearchParams(params, { replace: true });
  };

  const handleResetFilters = () => {
    const emptyFilters: SearchFilters = {
      query: '',
      type: 'all',
      category: 'All',
      status: 'all',
      startDate: '',
      endDate: '',
    };
    setFilters(emptyFilters);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  useEffect(() => {
    let isMounted = true;

    async function loadFilteredItems() {
      try {
        setLoading(true);
        const res = await api.getItems(filters);
        if (isMounted) {
          setItems(res.items);
          setTotalCount(res.total);
        }
      } catch (err) {
        console.error('Failed to load filtered items:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    // Debounce search slightly for fast typing response
    const timer = setTimeout(() => {
      loadFilteredItems();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Search &amp; Discover Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore campus lost and found items with full-text search and category filters
        </p>
      </div>

      {/* Filter and Search Bar */}
      <SearchBar
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleResetFilters}
        totalCount={totalCount}
      />

      {/* Search Results Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
          <p className="text-sm font-medium">Filtering catalog...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching items found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Try adjusting your search criteria, clearing filters, or changing category selection.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
