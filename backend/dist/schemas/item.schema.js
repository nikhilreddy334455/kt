"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemQueryParamsSchema = exports.ItemUpdateStatusSchema = exports.ItemSchema = exports.CategorySchema = exports.VALID_CATEGORIES = void 0;
const zod_1 = require("zod");
// Target domains strictly enforced across the system
exports.VALID_CATEGORIES = [
    'Electronics',
    'Clothing',
    'IDs & Wallets',
    'Books & Stationery',
    'Keys',
    'Accessories',
    'Miscellaneous',
];
exports.CategorySchema = zod_1.z.enum(exports.VALID_CATEGORIES);
// Zod validation schema strictly complying with Section 16
exports.ItemSchema = zod_1.z.object({
    report_type: zod_1.z.enum(['lost', 'found']),
    category: zod_1.z.string().min(1),
    title: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().min(10).max(1000),
    image_url: zod_1.z.string().url(),
    location: zod_1.z.string().min(2).max(150),
    event_time: zod_1.z.string().datetime(),
    contact_info: zod_1.z.string().min(3),
});
exports.ItemUpdateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['active', 'resolved']),
});
exports.ItemQueryParamsSchema = zod_1.z.object({
    type: zod_1.z.enum(['lost', 'found']).optional(),
    category: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'resolved']).optional(),
    search: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).default(50).optional(),
    offset: zod_1.z.coerce.number().min(0).default(0).optional(),
});
