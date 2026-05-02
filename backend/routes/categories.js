import { Router } from 'express';
import { db } from '../server.js';

const router = Router();

router.get('/', (req, res) => {
  const parents = db.prepare('SELECT * FROM categories WHERE parent_id IS NULL ORDER BY id').all();
  const subs = db.prepare('SELECT * FROM categories WHERE parent_id IS NOT NULL ORDER BY id').all();
  res.json(parents.map(p => ({ ...p, subcategories: subs.filter(s => s.parent_id === p.id) })));
});

router.get('/:slug', (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE slug=?').get(req.params.slug);
  if (!cat) return res.status(404).json({ error: 'Không tìm thấy' });
  const parent = cat.parent_id ? db.prepare('SELECT * FROM categories WHERE id=?').get(cat.parent_id) : null;
  const subs = db.prepare('SELECT * FROM categories WHERE parent_id=?').all(cat.parent_id || cat.id);
  res.json({ ...cat, parent, subcategories: subs });
});

export default router;
