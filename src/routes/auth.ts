import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import db from '../models';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middlewares/auth';

const router = Router();
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function generateToken(user: { id: number; email: string; role: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no configurado');
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: JWT_EXPIRES }
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const displayName = profile.displayName || null;
        const googleId = profile.id;

        if (!email) return done(new Error('Email no disponible'), undefined);

        let user = await (db.User as any).findOne({ where: { googleId } });
        if (!user) {
          user = await (db.User as any).findOne({ where: { email } });
          if (user) {
            await user.update({ googleId, displayName: displayName || user.displayName });
          } else {
            user = await (db.User as any).create({
              email,
              displayName,
              googleId,
              role: 'USER',
            });
          }
        }

        const u = user.get();
        return done(null, u);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await (db.User as any).findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const u = user.get();
    if (!u.passwordHash) {
      return res.status(401).json({ error: 'Esta cuenta usa inicio con Google. Usa ese método.' });
    }

    const valid = await (user as any).comparePassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const token = generateToken({ id: u.id, email: u.email, role: u.role });
    return res.json({
      token,
      user: {
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
      },
    });
  }
);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google` }),
  (req: Request, res: Response) => {
    const user = req.user as { id: number; email: string; role: string };
    const token = generateToken(user);
    res.redirect(`${FRONTEND_URL}/login?token=${token}&from=google`);
  }
);

router.get('/me', async (req: AuthRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No autorizado.' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET no configurado');
    const decoded = jwt.verify(token, secret) as { userId: number };
    const user = await (db.User as any).findByPk(decoded.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const u = user.get();
    return res.json({
      user: {
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
      },
    });
  } catch {
    return res.status(401).json({ error: 'Token inválido.' });
  }
});

export default router;
export { passport };
