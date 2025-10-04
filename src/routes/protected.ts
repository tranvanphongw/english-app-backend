import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

router.get('/admin-only', authenticate, requireRole('ADMIN'), (_req, res) => {
  res.json({ secret: 'admin data' });
});

export default router;
