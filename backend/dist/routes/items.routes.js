"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemsRouter = void 0;
const express_1 = require("express");
const items_controller_js_1 = require("../controllers/items.controller.js");
exports.itemsRouter = (0, express_1.Router)();
// Items collection routes
exports.itemsRouter.get('/items', items_controller_js_1.ItemsController.getItems);
exports.itemsRouter.post('/items', items_controller_js_1.ItemsController.createItem);
// Specific item routes
exports.itemsRouter.get('/items/:id', items_controller_js_1.ItemsController.getItemById);
exports.itemsRouter.patch('/items/:id/status', items_controller_js_1.ItemsController.updateStatus);
// AI Matching routes
exports.itemsRouter.get('/items/:id/matches', items_controller_js_1.ItemsController.getItemMatches);
exports.itemsRouter.post('/trigger-match/:id', items_controller_js_1.ItemsController.triggerMatching);
// Overall dashboard analytics
exports.itemsRouter.get('/stats', items_controller_js_1.ItemsController.getStats);
