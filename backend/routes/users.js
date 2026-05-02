import { Router } from 'express';
import { db } from '../server.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT id,name,phone,email,avatar,role,created_at FROM users WHERE id=?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy' });
  const { count } = db.prepare("SELECT COUNT(*) count FROM listings WHERE user_id=? AND status='active'").get(req.params.id);
  res.json({ ...user, listing_count: count });
});

router.put('/profile', authMiddleware, (req, res) => {
  const { name, email, avatar } = req.body;
  db.prepare('UPDATE users SET name=?,email=?,avatar=? WHERE id=?').run(name, email||null, avatar||'', req.user.id);
  const user = db.prepare('SELECT id,name,phone,email,avatar,role,created_at FROM users WHERE id=?').get(req.user.id);
  res.json(user);
});

export default router;
