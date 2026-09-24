export const TARGET_CATEGORIES = [
  'Electronics',
  'Clothing',
  'IDs & Wallets',
  'Books & Stationery',
  'Keys',
  'Accessories',
  'Miscellaneous',
] as const;

export type ItemCategory = (typeof TARGET_CATEGORIES)[number];

export interface Item {
  id: string;
  report_type: 'lost' | 'found';
  category: string;
  title: string;
  description: string;
  image_url: string;
  location: string;
  event_time: string;
  contact_info: string;
  status: 'active' | 'resolved';
  created_at: string;
}

export interface ItemMatch {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  confidence_score: number;
  explanation: string;
  created_at: string;
  matched_item?: Item;
}

export interface DashboardStats {
  totalItems: number;
  totalLost: number;
  totalFound: number;
  totalMatches: number;
  highConfidenceMatches: number;
  totalResolved: number;
}

export interface ItemFormData {
  report_type: 'lost' | 'found';
  category: string;
  title: string;
  description: string;
  image_url: string;
  location: string;
  event_time: string;
  contact_info: string;
}

export interface SearchFilters {
  query?: string;
  type?: 'lost' | 'found' | 'all';
  category?: string;
  status?: 'active' | 'resolved' | 'all';
  startDate?: string;
  endDate?: string;
}
