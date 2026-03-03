import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../models';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    displayName: string | null;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No autorizado. Token requerido.' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET no configurado');

    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user = await db.User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    const u = user.get() as { id: number; email: string; displayName: string | null; role: string };
    req.user = {
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autorizado.' });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
};
