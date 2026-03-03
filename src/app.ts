import express from 'express';
import cors from 'cors';
import { passport } from './routes/auth';
import authRoutes from './routes/auth';
import blogRoutes from './routes/blogs';
import commentRoutes from './routes/comments';
import materialRoutes from './routes/materials';
import eventRoutes from './routes/events';
import youtubeRoutes from './routes/youtube';

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/youtube', youtubeRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ error: 'Error interno del servidor.' });
});

export default app;
