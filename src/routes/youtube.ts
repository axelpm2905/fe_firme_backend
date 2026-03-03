import { Router, Request, Response } from 'express';
import db from '../models';
import { authenticate, requireAdmin, AuthRequest } from '../middlewares/auth';
import { body, param, validationResult } from 'express-validator';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const contents = await (db.YouTubeContent as any).findAll({
    order: [['createdAt', 'DESC']],
  });
  const formatted = contents.map((c: any) => {
    const d = c.get();
    return {
      id: String(d.id),
      title: d.title,
      description: d.description,
      url: d.url,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  });
  res.json(formatted);
});

router.get('/:id', [param('id').isInt()], async (req: Request, res: Response) => {
  const content = await (db.YouTubeContent as any).findByPk(req.params.id);
  if (!content) return res.status(404).json({ error: 'Contenido no encontrado.' });
  const d = content.get();
  res.json({
    id: String(d.id),
    title: d.title,
    description: d.description,
    url: d.url,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  });
});

router.post('/',
  authenticate,
  requireAdmin,
  [
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    body('url').notEmpty().trim(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const content = await (db.YouTubeContent as any).create(req.body);
    const d = content.get();
    res.status(201).json({ id: String(d.id), title: d.title, createdAt: d.createdAt });
  }
);

router.put('/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isInt(),
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('url').optional().trim().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const content = await (db.YouTubeContent as any).findByPk(req.params.id);
    if (!content) return res.status(404).json({ error: 'Contenido no encontrado.' });
    const updates = { ...req.body };
    delete updates.id;
    await content.update(updates);
    const d = content.get();
    res.json({ id: String(d.id), title: d.title, updatedAt: d.updatedAt });
  }
);

router.delete('/:id',
  authenticate,
  requireAdmin,
  [param('id').isInt()],
  async (req: Request, res: Response) => {
    const content = await (db.YouTubeContent as any).findByPk(req.params.id);
    if (!content) return res.status(404).json({ error: 'Contenido no encontrado.' });
    await content.destroy();
    res.status(204).send();
  }
);

export default router;
