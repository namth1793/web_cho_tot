import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../server.js';
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !phone || !password) return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (existing) return res.status(400).json({ error: 'Số điện thoại đã được đăng ký' });
  const hash = bcrypt.hashSync(password, 10);
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF5C00&color=fff`;
  const r = db.prepare('INSERT INTO users (name, phone, email, password, avatar) VALUES (?,?,?,?,?)').run(name, phone, email || null, hash, avatar);
  const user = db.prepare('SELECT id,name,phone,email,avatar,role,created_at FROM users WHERE id=?').get(r.lastInsertRowid);
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  res.status(201).json({ user, token });
});

router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'Thiếu thông tin' });
  const user = db.prepare('SELECT * FROM users WHERE phone=? OR email=?').get(phone, phone);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Số điện thoại hoặc mật khẩu không đúng' });
  const { password: _, ...safe } = user;
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ user: safe, token });
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id,name,phone,email,avatar,role,created_at FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json(user);
});

export default router;
