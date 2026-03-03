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

const allowedOrigins = [
  'https://fe-firme-frontend.vercel.app',
  'https://fe-firme-frontend-do1caxoqk-axelpm2905s-projects.vercel.app',
  process.env.FRONTEND_URL || 'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        // Permitir herramientas como Postman o llamadas server-side sin origin
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.get('/', (_req, res) => {
  res.json({ message: 'Fe Firme API running 🚀' });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/youtube', youtubeRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.use(
  (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
);

export default app;
