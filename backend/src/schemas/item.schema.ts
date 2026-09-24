import { z } from 'zod';

// Target domains strictly enforced across the system
export const VALID_CATEGORIES = [
  'Electronics',
  'Clothing',
  'IDs & Wallets',
  'Books & Stationery',
  'Keys',
  'Accessories',
  'Miscellaneous',
] as const;

export const CategorySchema = z.enum(VALID_CATEGORIES);

// Zod validation schema strictly complying with Section 16
export const ItemSchema = z.object({
  report_type: z.enum(['lost', 'found']),
  category: z.string().min(1),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  image_url: z.string().url(),
  location: z.string().min(2).max(150),
  event_time: z.string().datetime(),
  contact_info: z.string().min(3),
});

export const ItemUpdateStatusSchema = z.object({
  status: z.enum(['active', 'resolved']),
});

export const ItemQueryParamsSchema = z.object({
  type: z.enum(['lost', 'found']).optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'resolved']).optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50).optional(),
  offset: z.coerce.number().min(0).default(0).optional(),
});

export type ItemInput = z.infer<typeof ItemSchema>;
export type ItemCategory = (typeof VALID_CATEGORIES)[number];
export type ItemQueryParams = z.infer<typeof ItemQueryParamsSchema>;

export interface ItemRecord {
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

export interface ItemMatchRecord {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  confidence_score: number;
  explanation: string;
  created_at: string;
  // Joined counterpart item information for UI rendering
  matched_item?: ItemRecord;
}

export interface AIMatchOutput {
  confidence_score: number;
  explanation: string;
}
