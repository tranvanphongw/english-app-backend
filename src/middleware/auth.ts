import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';

export type AuthRequest = Request & { user?: JwtPayload };

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) return res.status(401).json({ error: { message: 'Missing token' } });
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthenticated' } });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: 'Forbidden: insufficient role' } });
    }
    next();
  };
}
