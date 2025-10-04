import { Router } from 'express';
import { prisma } from '../prisma';
import { hashPassword, verifyPassword } from '../utils/hash';
import { signAccessToken, signRefreshToken } from '../utils/jwt';

const router = Router();

/**
 * Đăng ký STUDENT
 * body: { email, password, nickname? }
 */
router.post('/register', async (req, res) => {
  const { email, password, nickname } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: { message: 'email & password required' } });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: { message: 'Email already registered' } });

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, role: 'STUDENT', nickname }
  });

  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return res.status(201).json({ user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken });
});

/**
 * Đăng nhập
 * body: { email, password }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: { message: 'email & password required' } });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: { message: 'Invalid email or password' } });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: { message: 'Invalid email or password' } });

  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return res.json({ user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken });
});

/**
 * Refresh token (stateless demo)
 * body: { refreshToken }
 */
import { verifyToken } from '../utils/jwt';
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: { message: 'refreshToken required' } });
  try {
    const payload = verifyToken(refreshToken);
    const accessToken = signAccessToken({ sub: payload.sub, role: payload.role, email: payload.email });
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: { message: 'Invalid refresh token' } });
  }
});

export default router;
