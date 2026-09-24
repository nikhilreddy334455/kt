import { Request, Response } from 'express';
import { z } from 'zod';
import {
  ItemSchema,
  ItemQueryParamsSchema,
  ItemUpdateStatusSchema,
} from '../schemas/item.schema.js';
import { DbService } from '../services/db.service.js';
import { AIService } from '../services/ai.service.js';

export class ItemsController {
  /**
   * GET /api/items
   * Query params: type, category, status, search, startDate, endDate, limit, offset
   */
  static async getItems(req: Request, res: Response): Promise<void> {
    try {
      const parsedQuery = ItemQueryParamsSchema.safeParse(req.query);
      if (!parsedQuery.success) {
        res.status(400).json({
          error: 'Invalid query parameters',
          details: parsedQuery.error.flatten(),
        });
        return;
      }

      const result = await DbService.getItems(parsedQuery.data);
      res.status(200).json({
        success: true,
        data: result.items,
        total: result.total,
      });
    } catch (err) {
      console.error('Error fetching items:', (err as Error).message);
      res.status(500).json({ error: 'Failed to retrieve items.' });
    }
  }

  /**
   * GET /api/items/:id
   */
  static async getItemById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !z.string().uuid().safeParse(id).success) {
        res.status(400).json({ error: 'Invalid item ID format. UUID expected.' });
        return;
      }

      const item = await DbService.getItemById(id);
      if (!item) {
        res.status(404).json({ error: 'Item not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (err) {
      console.error('Error retrieving item by ID:', (err as Error).message);
      res.status(500).json({ error: 'Failed to retrieve item.' });
    }
  }

  /**
   * POST /api/items
   * Creates a new item, saves to PostgreSQL, triggers AI matching, and returns 201 Created.
   */
  static async createItem(req: Request, res: Response): Promise<void> {
    try {
      const parsedBody = ItemSchema.safeParse(req.body);
      if (!parsedBody.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parsedBody.error.flatten(),
        });
        return;
      }

      // 1. Save item to DB
      const createdItem = await DbService.createItem(parsedBody.data);

      // 2. Asynchronously trigger the AI Matching Engine
      // We run the matching engine and await so the matches are ready when the user lands on the item page,
      // with a fallback to not block in case of unexpected delays
      let matchCount = 0;
      try {
        const matchResult = await AIService.runMatchingEngineForItem(createdItem);
        matchCount = matchResult.matches.length;
      } catch (aiError) {
        console.error('Background AI matching error:', (aiError as Error).message);
      }

      res.status(201).json({
        success: true,
        message: 'Item registered and AI matching completed.',
        data: createdItem,
        matchesGenerated: matchCount,
      });
    } catch (err) {
      console.error('Error creating item:', (err as Error).message);
      res.status(500).json({ error: 'Failed to create item.' });
    }
  }

  /**
   * GET /api/items/:id/matches
   * Fetches AI-generated matches for a specific item, sorted by confidence_score DESC
   */
  static async getItemMatches(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !z.string().uuid().safeParse(id).success) {
        res.status(400).json({ error: 'Invalid item ID format. UUID expected.' });
        return;
      }

      const item = await DbService.getItemById(id);
      if (!item) {
        res.status(404).json({ error: 'Item not found.' });
        return;
      }

      let matches = await DbService.getMatchesForItem(id);

      // If no matches yet exist, dynamically run the AI matching engine
      if (matches.length === 0) {
        await AIService.runMatchingEngineForItem(item);
        matches = await DbService.getMatchesForItem(id);
      }

      res.status(200).json({
        success: true,
        data: matches,
      });
    } catch (err) {
      console.error('Error fetching item matches:', (err as Error).message);
      res.status(500).json({ error: 'Failed to retrieve item matches.' });
    }
  }

  /**
   * POST /api/trigger-match/:id
   * Manual trigger to run the AI matching algorithm for a specific item ID against the database
   */
  static async triggerMatching(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !z.string().uuid().safeParse(id).success) {
        res.status(400).json({ error: 'Invalid item ID format. UUID expected.' });
        return;
      }

      const item = await DbService.getItemById(id);
      if (!item) {
        res.status(404).json({ error: 'Item not found.' });
        return;
      }

      const matchingResult = await AIService.runMatchingEngineForItem(item);
      const updatedMatches = await DbService.getMatchesForItem(id);

      res.status(200).json({
        success: true,
        message: `AI matching completed against ${matchingResult.processedCount} candidates.`,
        data: updatedMatches,
      });
    } catch (err) {
      console.error('Error triggering AI matching:', (err as Error).message);
      res.status(500).json({ error: 'Failed to process AI matching.' });
    }
  }

  /**
   * PATCH /api/items/:id/status
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !z.string().uuid().safeParse(id).success) {
        res.status(400).json({ error: 'Invalid item ID format.' });
        return;
      }

      const parsed = ItemUpdateStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Status must be "active" or "resolved".' });
        return;
      }

      const updated = await DbService.updateItemStatus(id, parsed.data.status);
      if (!updated) {
        res.status(404).json({ error: 'Item not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err) {
      console.error('Error updating status:', (err as Error).message);
      res.status(500).json({ error: 'Failed to update item status.' });
    }
  }

  /**
   * GET /api/stats
   */
  static async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await DbService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      console.error('Error fetching stats:', (err as Error).message);
      res.status(500).json({ error: 'Failed to retrieve stats.' });
    }
  }
}
