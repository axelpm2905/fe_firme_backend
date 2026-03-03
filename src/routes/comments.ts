import { Router, Response } from 'express';
import db from '../models';
import { authenticate, requireAdmin, AuthRequest } from '../middlewares/auth';
import { body, param, query, validationResult } from 'express-validator';

const router = Router();

router.get('/', [
  query('blogId').optional().isInt(),
  query('approvedOnly').optional().isIn(['true', 'false']),
], async (req: AuthRequest, res: Response) => {
  const where: Record<string, unknown> = {};
  if (req.query.blogId) where.blogId = req.query.blogId;
  if (req.query.approvedOnly === 'true') where.approved = true;

  const comments = await (db.Comment as any).findAll({
    where,
    include: [{ model: db.User, attributes: ['id', 'email', 'displayName'] }],
    order: [['createdAt', 'DESC']],
  });

  const formatted = comments.map((c: any) => {
    const d = c.get();
    const user = d.User || {};
    return {
      id: String(d.id),
      blogId: String(d.blogId),
      userId: String(d.userId),
      userEmail: user.email || '',
      userName: user.displayName || user.email || 'Usuario',
      content: d.content,
      approved: d.approved,
      createdAt: d.createdAt,
    };
  });

  res.json(formatted);
});

router.post('/',
  authenticate,
  [
    body('blogId').isInt(),
    body('content').notEmpty().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { blogId, content } = req.body;

    const blog = await (db.Blog as any).findByPk(blogId);
    if (!blog) return res.status(404).json({ error: 'Blog no encontrado.' });
    const b = blog.get();
    if (!b.commentsEnabled) return res.status(400).json({ error: 'Los comentarios están deshabilitados.' });

    const comment = await (db.Comment as any).create({
      blogId,
      userId: req.user!.id,
      content: content.trim(),
      approved: false,
    });

    const d = comment.get();
    res.status(201).json({
      id: String(d.id),
      blogId: String(d.blogId),
      userId: String(d.userId),
      content: d.content,
      approved: d.approved,
      createdAt: d.createdAt,
    });
  }
);

router.patch('/:id/approve',
  authenticate,
  requireAdmin,
  [param('id').isInt()],
  async (req: AuthRequest, res: Response) => {
    const comment = await (db.Comment as any).findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado.' });
    await comment.update({ approved: true });
    res.json({ approved: true });
  }
);

router.delete('/:id',
  authenticate,
  requireAdmin,
  [param('id').isInt()],
  async (req: AuthRequest, res: Response) => {
    const comment = await (db.Comment as any).findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado.' });
    await comment.destroy();
    res.status(204).send();
  }
);

export default router;
