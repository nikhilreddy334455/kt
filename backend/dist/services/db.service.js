"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbService = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/campus_lost_found';
// Check for common configuration mistake where user pastes Supabase dashboard URL instead of postgresql://
if (connectionString.startsWith('https://') || connectionString.startsWith('http://')) {
    console.error('CRITICAL CONFIG ERROR: DATABASE_URL starts with http/https. A PostgreSQL connection string is required (e.g. postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres). Please retrieve the URI from Supabase Project Settings -> Database.');
}
const isRemoteDb = Boolean(connectionString.includes('supabase.co') ||
    connectionString.includes('neon.tech') ||
    connectionString.includes('render.com') ||
    connectionString.includes('pooler.supabase.com') ||
    process.env.NODE_ENV === 'production');
exports.pool = new pg_1.Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
});
exports.pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
});
class DbService {
    /**
     * Fetch items with dynamic filtering, pagination, and parameterized SQL
     */
    static async getItems(params) {
        const conditions = [];
        const values = [];
        let paramIndex = 1;
        if (params.type) {
            conditions.push(`report_type = $${paramIndex++}`);
            values.push(params.type);
        }
        if (params.category && params.category !== 'All') {
            conditions.push(`category = $${paramIndex++}`);
            values.push(params.category);
        }
        if (params.status) {
            conditions.push(`status = $${paramIndex++}`);
            values.push(params.status);
        }
        if (params.search && params.search.trim().length > 0) {
            const searchTerm = `%${params.search.trim()}%`;
            conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`);
            values.push(searchTerm);
            paramIndex++;
        }
        if (params.startDate) {
            conditions.push(`event_time >= $${paramIndex++}`);
            values.push(params.startDate);
        }
        if (params.endDate) {
            conditions.push(`event_time <= $${paramIndex++}`);
            values.push(params.endDate);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const countQuery = `SELECT COUNT(*) AS total FROM items ${whereClause};`;
        const countResult = await exports.pool.query(countQuery, values);
        const total = parseInt(countResult.rows[0]?.total ?? '0', 10);
        const limit = params.limit ?? 50;
        const offset = params.offset ?? 0;
        const dataQuery = `
      SELECT 
        id, 
        report_type, 
        category, 
        title, 
        description, 
        image_url, 
        location, 
        event_time, 
        contact_info, 
        status, 
        created_at
      FROM items
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
        values.push(limit, offset);
        const dataResult = await exports.pool.query(dataQuery, values);
        return {
            items: dataResult.rows,
            total,
        };
    }
    /**
     * Fetch a single item by its UUID
     */
    static async getItemById(id) {
        const query = `
      SELECT 
        id, 
        report_type, 
        category, 
        title, 
        description, 
        image_url, 
        location, 
        event_time, 
        contact_info, 
        status, 
        created_at
      FROM items
      WHERE id = $1;
    `;
        const result = await exports.pool.query(query, [id]);
        return result.rows[0] ?? null;
    }
    /**
     * Insert a new item into PostgreSQL
     */
    static async createItem(data) {
        const query = `
      INSERT INTO items (
        report_type,
        category,
        title,
        description,
        image_url,
        location,
        event_time,
        contact_info,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
      RETURNING 
        id, 
        report_type, 
        category, 
        title, 
        description, 
        image_url, 
        location, 
        event_time, 
        contact_info, 
        status, 
        created_at;
    `;
        const values = [
            data.report_type,
            data.category,
            data.title,
            data.description,
            data.image_url,
            data.location,
            data.event_time,
            data.contact_info,
        ];
        const result = await exports.pool.query(query, values);
        const createdItem = result.rows[0];
        if (!createdItem) {
            throw new Error('Failed to create item in database.');
        }
        return createdItem;
    }
    /**
     * Update item status ('active' | 'resolved')
     */
    static async updateItemStatus(id, status) {
        const query = `
      UPDATE items
      SET status = $1
      WHERE id = $2
      RETURNING 
        id, 
        report_type, 
        category, 
        title, 
        description, 
        image_url, 
        location, 
        event_time, 
        contact_info, 
        status, 
        created_at;
    `;
        const result = await exports.pool.query(query, [status, id]);
        return result.rows[0] ?? null;
    }
    /**
     * Fetch candidate items for AI matching:
     * If target is 'lost', returns candidates where report_type = 'found' in same category
     * If target is 'found', returns candidates where report_type = 'lost' in same category
     */
    static async getCandidateItemsForMatching(targetItem, limit = 10) {
        const targetCounterpartType = targetItem.report_type === 'lost' ? 'found' : 'lost';
        // Prioritize same category first
        const query = `
      SELECT 
        id, 
        report_type, 
        category, 
        title, 
        description, 
        image_url, 
        location, 
        event_time, 
        contact_info, 
        status, 
        created_at
      FROM items
      WHERE report_type = $1
        AND id != $2
        AND category = $3
      ORDER BY created_at DESC
      LIMIT $4;
    `;
        const result = await exports.pool.query(query, [
            targetCounterpartType,
            targetItem.id,
            targetItem.category,
            limit,
        ]);
        // If fewer than 3 candidates found in the same category, broaden to recent items across other categories
        if (result.rows.length < 3) {
            const remainingLimit = limit - result.rows.length;
            const existingIds = [targetItem.id, ...result.rows.map((r) => r.id)];
            const fallbackQuery = `
        SELECT 
          id, 
          report_type, 
          category, 
          title, 
          description, 
          image_url, 
          location, 
          event_time, 
          contact_info, 
          status, 
          created_at
        FROM items
        WHERE report_type = $1
          AND id != ALL($2::uuid[])
        ORDER BY created_at DESC
        LIMIT $3;
      `;
            const fallbackResult = await exports.pool.query(fallbackQuery, [
                targetCounterpartType,
                existingIds,
                remainingLimit,
            ]);
            return [...result.rows, ...fallbackResult.rows];
        }
        return result.rows;
    }
    /**
     * Upsert a match score and explanation into item_matches
     */
    static async saveMatch(lostItemId, foundItemId, confidenceScore, explanation) {
        const query = `
      INSERT INTO item_matches (lost_item_id, found_item_id, confidence_score, explanation)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (lost_item_id, found_item_id)
      DO UPDATE SET
        confidence_score = EXCLUDED.confidence_score,
        explanation = EXCLUDED.explanation,
        created_at = CURRENT_TIMESTAMP
      RETURNING id, lost_item_id, found_item_id, confidence_score, explanation, created_at;
    `;
        const result = await exports.pool.query(query, [
            lostItemId,
            foundItemId,
            confidenceScore,
            explanation,
        ]);
        return result.rows[0];
    }
    /**
     * Retrieve matches for a specific item ID sorted by confidence score DESC
     * Joins with the counterpart item so the frontend receives full counterpart details
     */
    static async getMatchesForItem(itemId) {
        const item = await this.getItemById(itemId);
        if (!item) {
            return [];
        }
        let query = '';
        if (item.report_type === 'lost') {
            // Counterpart is found_item_id
            query = `
        SELECT 
          m.id,
          m.lost_item_id,
          m.found_item_id,
          m.confidence_score,
          m.explanation,
          m.created_at,
          row_to_json(i.*) AS matched_item
        FROM item_matches m
        JOIN items i ON m.found_item_id = i.id
        WHERE m.lost_item_id = $1
        ORDER BY m.confidence_score DESC, m.created_at DESC;
      `;
        }
        else {
            // Counterpart is lost_item_id
            query = `
        SELECT 
          m.id,
          m.lost_item_id,
          m.found_item_id,
          m.confidence_score,
          m.explanation,
          m.created_at,
          row_to_json(i.*) AS matched_item
        FROM item_matches m
        JOIN items i ON m.lost_item_id = i.id
        WHERE m.found_item_id = $1
        ORDER BY m.confidence_score DESC, m.created_at DESC;
      `;
        }
        const result = await exports.pool.query(query, [itemId]);
        return result.rows.map((row) => ({
            id: row.id,
            lost_item_id: row.lost_item_id,
            found_item_id: row.found_item_id,
            confidence_score: row.confidence_score,
            explanation: row.explanation,
            created_at: row.created_at,
            matched_item: row.matched_item,
        }));
    }
    /**
     * Aggregate statistics for the dashboard
     */
    static async getDashboardStats() {
        const query = `
      SELECT
        (SELECT COUNT(*) FROM items) AS total_items,
        (SELECT COUNT(*) FROM items WHERE report_type = 'lost') AS total_lost,
        (SELECT COUNT(*) FROM items WHERE report_type = 'found') AS total_found,
        (SELECT COUNT(*) FROM item_matches) AS total_matches,
        (SELECT COUNT(*) FROM item_matches WHERE confidence_score >= 80) AS high_confidence_matches,
        (SELECT COUNT(*) FROM items WHERE status = 'resolved') AS total_resolved;
    `;
        const result = await exports.pool.query(query);
        const row = result.rows[0];
        return {
            totalItems: parseInt(row?.total_items ?? '0', 10),
            totalLost: parseInt(row?.total_lost ?? '0', 10),
            totalFound: parseInt(row?.total_found ?? '0', 10),
            totalMatches: parseInt(row?.total_matches ?? '0', 10),
            highConfidenceMatches: parseInt(row?.high_confidence_matches ?? '0', 10),
            totalResolved: parseInt(row?.total_resolved ?? '0', 10),
        };
    }
}
exports.DbService = DbService;
