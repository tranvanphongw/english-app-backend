import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);

// Error handler đơn giản
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: { message: 'Internal Server Error' } });
});

export default app;
