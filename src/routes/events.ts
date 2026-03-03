import { Router, Response } from 'express';
import db from '../models';
import { authenticate, requireAdmin, AuthRequest } from '../middlewares/auth';
import { body, param, validationResult } from 'express-validator';

const router = Router();

router.get('/', async (_req: AuthRequest, res: Response) => {
  const events = await (db.Event as any).findAll({
    order: [['date', 'ASC'], ['time', 'ASC']],
  });
  const formatted = events.map((e: any) => {
    const d = e.get();
    return {
      id: String(d.id),
      title: d.title,
      date: d.date,
      time: d.time,
      location: d.location,
      description: d.description,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  });
  res.json(formatted);
});

router.get('/:id', [param('id').isInt()], async (req: AuthRequest, res: Response) => {
  const event = await (db.Event as any).findByPk(req.params.id);
  if (!event) return res.status(404).json({ error: 'Evento no encontrado.' });
  const d = event.get();
  res.json({
    id: String(d.id),
    title: d.title,
    date: d.date,
    time: d.time,
    location: d.location,
    description: d.description,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  });
});

router.post('/',
  authenticate,
  requireAdmin,
  [
    body('title').notEmpty().trim(),
    body('date').notEmpty(),
    body('time').optional().trim(),
    body('location').optional().trim(),
    body('description').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const event = await (db.Event as any).create(req.body);
    const d = event.get();
    res.status(201).json({ id: String(d.id), title: d.title, date: d.date, createdAt: d.createdAt });
  }
);

router.put('/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isInt(),
    body('title').optional().trim().notEmpty(),
    body('date').optional().notEmpty(),
    body('time').optional().trim(),
    body('location').optional().trim(),
    body('description').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const event = await (db.Event as any).findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado.' });
    const updates = { ...req.body };
    delete updates.id;
    await event.update(updates);
    const d = event.get();
    res.json({ id: String(d.id), title: d.title, updatedAt: d.updatedAt });
  }
);

router.delete('/:id',
  authenticate,
  requireAdmin,
  [param('id').isInt()],
  async (req: AuthRequest, res: Response) => {
    const event = await (db.Event as any).findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado.' });
    await event.destroy();
    res.status(204).send();
  }
);

export default router;
