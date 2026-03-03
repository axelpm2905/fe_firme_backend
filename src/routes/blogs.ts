import { Router, Response } from 'express';
import db from '../models';
import { authenticate, requireAdmin, AuthRequest } from '../middlewares/auth';
import { body, param, query, validationResult } from 'express-validator';

const router = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

router.get('/', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

  const blogs = await (db.Blog as any).findAll({
    include: [{ model: db.User, as: 'author', attributes: ['id', 'email', 'displayName'] }],
    order: [['createdAt', 'DESC']],
    limit,
  });

  const formatted = blogs.map((b: any) => {
    const data = b.get();
    return {
      id: String(data.id),
      title: data.title,
      slug: data.slug,
      content: data.content,
      featuredImage: data.featuredImage,
      category: data.category,
      author: data.author?.displayName || data.author?.email || 'Anónimo',
      authorId: String(data.authorId),
      commentsEnabled: data.commentsEnabled,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });

  res.json(formatted);
});

router.get('/slug/:slug', [
  param('slug').notEmpty(),
], async (req: AuthRequest, res: Response) => {
  const blog = await (db.Blog as any).findOne({
    where: { slug: req.params.slug },
    include: [{ model: db.User, as: 'author', attributes: ['id', 'email', 'displayName'] }],
  });

  if (!blog) return res.status(404).json({ error: 'Blog no encontrado.' });

  const data = blog.get();
  res.json({
    id: String(data.id),
    title: data.title,
    slug: data.slug,
    content: data.content,
    featuredImage: data.featuredImage,
    category: data.category,
    author: data.author?.displayName || data.author?.email || 'Anónimo',
    authorId: String(data.authorId),
    commentsEnabled: data.commentsEnabled,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  });
});

router.get('/:id', [
  param('id').isInt(),
], async (req: AuthRequest, res: Response) => {
  const blog = await (db.Blog as any).findByPk(req.params.id, {
    include: [{ model: db.User, as: 'author', attributes: ['id', 'email', 'displayName'] }],
  });

  if (!blog) return res.status(404).json({ error: 'Blog no encontrado.' });

  const data = blog.get();
  res.json({
    id: String(data.id),
    title: data.title,
    slug: data.slug,
    content: data.content,
    featuredImage: data.featuredImage,
    category: data.category,
    author: data.author?.displayName || data.author?.email || 'Anónimo',
    authorId: String(data.authorId),
    commentsEnabled: data.commentsEnabled,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  });
});

router.post('/',
  authenticate,
  requireAdmin,
  [
    body('title').notEmpty().trim(),
    body('content').notEmpty(),
    body('category').notEmpty().trim(),
    body('featuredImage').optional(),
    body('commentsEnabled').optional().isBoolean(),
    body('slug').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, content, category, featuredImage, commentsEnabled } = req.body;
    const slug = req.body.slug || slugify(title);

    const blog = await (db.Blog as any).create({
      title,
      slug,
      content,
      category,
      featuredImage: featuredImage || null,
      commentsEnabled: commentsEnabled !== false,
      authorId: req.user!.id,
    });

    const data = blog.get();
    res.status(201).json({
      id: String(data.id),
      slug: data.slug,
      title: data.title,
      createdAt: data.createdAt,
    });
  }
);

router.put('/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isInt(),
    body('title').optional().trim().notEmpty(),
    body('content').optional().notEmpty(),
    body('category').optional().trim().notEmpty(),
    body('featuredImage').optional(),
    body('commentsEnabled').optional().isBoolean(),
    body('slug').optional().trim().notEmpty(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const blog = await (db.Blog as any).findByPk(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog no encontrado.' });

    const updates: Record<string, unknown> = { ...req.body };
    if (updates.title && !updates.slug) updates.slug = slugify(updates.title as string);
    delete updates.id;
    delete updates.authorId;

    await blog.update(updates);
    const data = blog.get();
    res.json({
      id: String(data.id),
      slug: data.slug,
      title: data.title,
      updatedAt: data.updatedAt,
    });
  }
);

router.delete('/:id',
  authenticate,
  requireAdmin,
  [param('id').isInt()],
  async (req: AuthRequest, res: Response) => {
    const blog = await (db.Blog as any).findByPk(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog no encontrado.' });
    await blog.destroy();
    res.status(204).send();
  }
);

export default router;
