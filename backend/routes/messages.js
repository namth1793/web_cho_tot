import { Router } from 'express';
import { db } from '../server.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  const msgs = db.prepare(`
    SELECT m.*, l.title listing_title, l.images listing_images,
           s.name sender_name, s.avatar sender_avatar,
           r.name receiver_name, r.avatar receiver_avatar
    FROM messages m
    LEFT JOIN listings l ON m.listing_id = l.id
    LEFT JOIN users s ON m.sender_id = s.id
    LEFT JOIN users r ON m.receiver_id = r.id
    WHERE m.sender_id=? OR m.receiver_id=?
    ORDER BY m.created_at DESC
  `).all(req.user.id, req.user.id);
  res.json(msgs);
});

router.get('/:listingId/:otherId', authMiddleware, (req, res) => {
  const msgs = db.prepare(`
    SELECT m.*, s.name sender_name, s.avatar sender_avatar
    FROM messages m LEFT JOIN users s ON m.sender_id=s.id
    WHERE m.listing_id=?
      AND ((m.sender_id=? AND m.receiver_id=?) OR (m.sender_id=? AND m.receiver_id=?))
    ORDER BY m.created_at ASC
  `).all(req.params.listingId, req.user.id, req.params.otherId, req.params.otherId, req.user.id);
  db.prepare('UPDATE messages SET is_read=1 WHERE listing_id=? AND receiver_id=?').run(req.params.listingId, req.user.id);
  res.json(msgs);
});

router.post('/', authMiddleware, (req, res) => {
  const { receiver_id, listing_id, content } = req.body;
  if (!receiver_id || !content) return res.status(400).json({ error: 'Thiếu thông tin' });
  const r = db.prepare('INSERT INTO messages (sender_id,receiver_id,listing_id,content) VALUES (?,?,?,?)').run(req.user.id, receiver_id, listing_id||null, content);
  const msg = db.prepare('SELECT m.*, s.name sender_name, s.avatar sender_avatar FROM messages m LEFT JOIN users s ON m.sender_id=s.id WHERE m.id=?').get(r.lastInsertRowid);
  res.status(201).json(msg);
});

export default router;
