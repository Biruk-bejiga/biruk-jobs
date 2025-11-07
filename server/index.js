import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import createHttpError from 'http-errors';
import { loadEnv } from './lib/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import jobsRouter from './routes/jobs.js';
import adminRouter from './routes/admin.js';
import { verifyDatabaseConnection } from './db/index.js';

const app = express();
const env = loadEnv();
const PORT = env.port;

app.set('trust proxy', 1);

const allowedOrigins = env.corsOrigins;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.get('/health', async (_req, res, next) => {
  try {
    await verifyDatabaseConnection();
    res.json({ status: 'ok' });
  } catch (err) {
    next(createHttpError(503, 'Database unavailable'));
  }
});

app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/admin', adminRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
