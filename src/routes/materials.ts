import { Router, Response } from 'express';
import db from '../models';
import { authenticate, requireAdmin, AuthRequest } from '../middlewares/auth';
import { body, param, validationResult } from 'express-validator';

const router = Router();

router.get('/', async (_req: AuthRequest, res: Response) => {
  const materials = await (db.Material as any).findAll({
    order: [['createdAt', 'DESC']],
  });
  const formatted = materials.map((m: any) => {
    const d = m.get();
    return {
      id: String(d.id),
      title: d.title,
      description: d.description,
      image: d.image,
      pdfUrl: d.pdfUrl,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  });
  res.json(formatted);
});

router.get('/:id', [param('id').isInt()], async (req: AuthRequest, res: Response) => {
  const material = await (db.Material as any).findByPk(req.params.id);
  if (!material) return res.status(404).json({ error: 'Material no encontrado.' });
  const d = material.get();
  res.json({
    id: String(d.id),
    title: d.title,
    description: d.description,
    image: d.image,
    pdfUrl: d.pdfUrl,
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
    body('image').optional(),
    body('pdfUrl').optional(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { title, description, image, pdfUrl } = req.body;
    const material = await (db.Material as any).create({ title, description, image, pdfUrl });
    const d = material.get();
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
    body('image').optional(),
    body('pdfUrl').optional(),
  ],
  async (req: AuthRequest, res: Response) => {
    const material = await (db.Material as any).findByPk(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material no encontrado.' });
    const updates = { ...req.body };
    delete updates.id;
    await material.update(updates);
    const d = material.get();
    res.json({ id: String(d.id), title: d.title, updatedAt: d.updatedAt });
  }
);

router.delete('/:id',
  authenticate,
  requireAdmin,
  [param('id').isInt()],
  async (req: AuthRequest, res: Response) => {
    const material = await (db.Material as any).findByPk(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material no encontrado.' });
    await material.destroy();
    res.status(204).send();
  }
);

export default router;
