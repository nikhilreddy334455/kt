import { Router } from 'express';
import { ItemsController } from '../controllers/items.controller.js';

export const itemsRouter = Router();

// Items collection routes
itemsRouter.get('/items', ItemsController.getItems);
itemsRouter.post('/items', ItemsController.createItem);

// Specific item routes
itemsRouter.get('/items/:id', ItemsController.getItemById);
itemsRouter.patch('/items/:id/status', ItemsController.updateStatus);

// AI Matching routes
itemsRouter.get('/items/:id/matches', ItemsController.getItemMatches);
itemsRouter.post('/trigger-match/:id', ItemsController.triggerMatching);

// Overall dashboard analytics
itemsRouter.get('/stats', ItemsController.getStats);
