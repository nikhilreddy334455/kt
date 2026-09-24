import { Item, ItemMatch, DashboardStats, ItemFormData, SearchFilters } from './types';

const API_BASE = '/api';

/**
 * Custom error class for API failures
 */
export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.error || `HTTP error ${response.status}`,
      response.status,
      data.details
    );
  }

  return data;
}

export const api = {
  /**
   * Fetch all items with optional search & filter parameters
   */
  async getItems(filters: SearchFilters = {}): Promise<{ items: Item[]; total: number }> {
    const params = new URLSearchParams();

    if (filters.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters.category && filters.category !== 'All') {
      params.append('category', filters.category);
    }
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.query && filters.query.trim()) {
      params.append('search', filters.query.trim());
    }
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await request<{ success: boolean; data: Item[]; total: number }>(`/items${queryString}`);
    return { items: res.data, total: res.total };
  },

  /**
   * Fetch a single item by UUID
   */
  async getItemById(id: string): Promise<Item> {
    const res = await request<{ success: boolean; data: Item }>(`/items/${id}`);
    return res.data;
  },

  /**
   * Submit a new lost or found report
   */
  async createItem(item: ItemFormData): Promise<{ item: Item; matchesGenerated: number }> {
    const res = await request<{ success: boolean; data: Item; matchesGenerated: number }>(
      '/items',
      {
        method: 'POST',
        body: JSON.stringify(item),
      }
    );
    return { item: res.data, matchesGenerated: res.matchesGenerated };
  },

  /**
   * Fetch AI matches for a specific item
   */
  async getItemMatches(id: string): Promise<ItemMatch[]> {
    const res = await request<{ success: boolean; data: ItemMatch[] }>(`/items/${id}/matches`);
    return res.data;
  },

  /**
   * Manually trigger Gemini AI matching
   */
  async triggerMatch(id: string): Promise<ItemMatch[]> {
    const res = await request<{ success: boolean; data: ItemMatch[] }>(`/trigger-match/${id}`, {
      method: 'POST',
    });
    return res.data;
  },

  /**
   * Update item status (active vs resolved)
   */
  async updateItemStatus(id: string, status: 'active' | 'resolved'): Promise<Item> {
    const res = await request<{ success: boolean; data: Item }>(`/items/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  /**
   * Fetch dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await request<{ success: boolean; data: DashboardStats }>('/stats');
    return res.data;
  },
};
