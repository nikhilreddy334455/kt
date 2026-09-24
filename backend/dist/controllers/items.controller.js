"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemsController = void 0;
const zod_1 = require("zod");
const item_schema_js_1 = require("../schemas/item.schema.js");
const db_service_js_1 = require("../services/db.service.js");
const ai_service_js_1 = require("../services/ai.service.js");
class ItemsController {
    /**
     * GET /api/items
     * Query params: type, category, status, search, startDate, endDate, limit, offset
     */
    static async getItems(req, res) {
        try {
            const parsedQuery = item_schema_js_1.ItemQueryParamsSchema.safeParse(req.query);
            if (!parsedQuery.success) {
                res.status(400).json({
                    error: 'Invalid query parameters',
                    details: parsedQuery.error.flatten(),
                });
                return;
            }
            const result = await db_service_js_1.DbService.getItems(parsedQuery.data);
            res.status(200).json({
                success: true,
                data: result.items,
                total: result.total,
            });
        }
        catch (err) {
            console.error('Error fetching items:', err.message);
            res.status(500).json({ error: 'Failed to retrieve items.' });
        }
    }
    /**
     * GET /api/items/:id
     */
    static async getItemById(req, res) {
        try {
            const { id } = req.params;
            if (!id || !zod_1.z.string().uuid().safeParse(id).success) {
                res.status(400).json({ error: 'Invalid item ID format. UUID expected.' });
                return;
            }
            const item = await db_service_js_1.DbService.getItemById(id);
            if (!item) {
                res.status(404).json({ error: 'Item not found.' });
                return;
            }
            res.status(200).json({
                success: true,
                data: item,
            });
        }
        catch (err) {
            console.error('Error retrieving item by ID:', err.message);
            res.status(500).json({ error: 'Failed to retrieve item.' });
        }
    }
    /**
     * POST /api/items
     * Creates a new item, saves to PostgreSQL, triggers AI matching, and returns 201 Created.
     */
    static async createItem(req, res) {
        try {
            const parsedBody = item_schema_js_1.ItemSchema.safeParse(req.body);
            if (!parsedBody.success) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: parsedBody.error.flatten(),
                });
                return;
            }
            // 1. Save item to DB
            const createdItem = await db_service_js_1.DbService.createItem(parsedBody.data);
            // 2. Asynchronously trigger the AI Matching Engine
            // We run the matching engine and await so the matches are ready when the user lands on the item page,
            // with a fallback to not block in case of unexpected delays
            let matchCount = 0;
            try {
                const matchResult = await ai_service_js_1.AIService.runMatchingEngineForItem(createdItem);
                matchCount = matchResult.matches.length;
            }
            catch (aiError) {
                console.error('Background AI matching error:', aiError.message);
            }
            res.status(201).json({
                success: true,
                message: 'Item registered and AI matching completed.',
                data: createdItem,
                matchesGenerated: matchCount,
            });
        }
        catch (err) {
            console.error('Error creating item:', err.message);
            res.status(500).json({ error: 'Failed to create item.' });
        }
    }
    /**
     * GET /api/items/:id/matches
     * Fetches AI-generated matches for a specific item, sorted by confidence_score DESC
     */
    static async getItemMatches(req, res) {
        try {
            const { id } = req.params;
            if (!id || !zod_1.z.string().uuid().safeParse(id).success) {
                res.status(400).json({ error: 'Invalid item ID format. UUID expected.' });
                return;
            }
            const item = await db_service_js_1.DbService.getItemById(id);
            if (!item) {
                res.status(404).json({ error: 'Item not found.' });
                return;
            }
            let matches = await db_service_js_1.DbService.getMatchesForItem(id);
            // If no matches yet exist, dynamically run the AI matching engine
            if (matches.length === 0) {
                await ai_service_js_1.AIService.runMatchingEngineForItem(item);
                matches = await db_service_js_1.DbService.getMatchesForItem(id);
            }
            res.status(200).json({
                success: true,
                data: matches,
            });
        }
        catch (err) {
            console.error('Error fetching item matches:', err.message);
            res.status(500).json({ error: 'Failed to retrieve item matches.' });
        }
    }
    /**
     * POST /api/trigger-match/:id
     * Manual trigger to run the AI matching algorithm for a specific item ID against the database
     */
    static async triggerMatching(req, res) {
        try {
            const { id } = req.params;
            if (!id || !zod_1.z.string().uuid().safeParse(id).success) {
                res.status(400).json({ error: 'Invalid item ID format. UUID expected.' });
                return;
            }
            const item = await db_service_js_1.DbService.getItemById(id);
            if (!item) {
                res.status(404).json({ error: 'Item not found.' });
                return;
            }
            const matchingResult = await ai_service_js_1.AIService.runMatchingEngineForItem(item);
            const updatedMatches = await db_service_js_1.DbService.getMatchesForItem(id);
            res.status(200).json({
                success: true,
                message: `AI matching completed against ${matchingResult.processedCount} candidates.`,
                data: updatedMatches,
            });
        }
        catch (err) {
            console.error('Error triggering AI matching:', err.message);
            res.status(500).json({ error: 'Failed to process AI matching.' });
        }
    }
    /**
     * PATCH /api/items/:id/status
     */
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            if (!id || !zod_1.z.string().uuid().safeParse(id).success) {
                res.status(400).json({ error: 'Invalid item ID format.' });
                return;
            }
            const parsed = item_schema_js_1.ItemUpdateStatusSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ error: 'Status must be "active" or "resolved".' });
                return;
            }
            const updated = await db_service_js_1.DbService.updateItemStatus(id, parsed.data.status);
            if (!updated) {
                res.status(404).json({ error: 'Item not found.' });
                return;
            }
            res.status(200).json({
                success: true,
                data: updated,
            });
        }
        catch (err) {
            console.error('Error updating status:', err.message);
            res.status(500).json({ error: 'Failed to update item status.' });
        }
    }
    /**
     * GET /api/stats
     */
    static async getStats(_req, res) {
        try {
            const stats = await db_service_js_1.DbService.getDashboardStats();
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (err) {
            console.error('Error fetching stats:', err.message);
            res.status(500).json({ error: 'Failed to retrieve stats.' });
        }
    }
}
exports.ItemsController = ItemsController;
