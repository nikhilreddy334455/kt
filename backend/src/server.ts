import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { itemsRouter } from './routes/items.routes.js';
import { pool } from './services/db.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. Strict CORS configuration
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

// 2. Payload limits (max 5MB as required by Section 18)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// 3. Request logger for observability
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// 4. Healthcheck and status route
app.get(['/health', '/api/health'], async (_req: Request, res: Response) => {
  try {
    const dbTest = await pool.query('SELECT 1 AS healthy;');
    const isDbConnected = dbTest.rows[0]?.healthy === 1;

    res.status(200).json({
      status: 'ok',
      service: 'smart-campus-lost-found-backend',
      timestamp: new Date().toISOString(),
      database: isDbConnected ? 'connected' : 'disconnected',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      error: 'Database connection failed',
    });
  }
});

// 5. Mount API routes (supports both /api/items and /items if URL is stripped by Vercel rewrite)
app.use('/api', itemsRouter);
app.use(itemsRouter);

// 6. 404 handler for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
  });
});

// 7. Production-grade Error Handling Middleware
// Never leak database stack traces to the frontend (Section 18)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[UNHANDLED ERROR]:', err.message);
  
  if (err.name === 'SyntaxError' && 'body' in err) {
    res.status(400).json({ error: 'Malformed JSON payload.' });
    return;
  }

  res.status(500).json({
    error: 'An internal server error occurred. Please try again later.',
  });
});

// Start listening when not in a serverless environment (e.g. Vercel)
if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 Smart Campus Lost & Found API running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`⚡ Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 Gemini Model: gemini-2.5-flash`);
    console.log(`=================================================`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      pool.end();
    });
  });
}

export default app;
