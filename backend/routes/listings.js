import { Router } from 'express';
import { db } from '../server.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/saved', authMiddleware, (req, res) => {
  const rows = db.prepare(`
    SELECT l.*, c.name cat_name, c.slug cat_slug, c.icon cat_icon,
           u.name seller_name, u.avatar seller_avatar
    FROM saved_listings sl
    JOIN listings l ON sl.listing_id = l.id
    LEFT JOIN categories c ON l.category_id = c.id
    LEFT JOIN users u ON l.user_id = u.id
    WHERE sl.user_id = ? AND l.status = 'active'
    ORDER BY sl.created_at DESC
  `).all(req.user.id);
  res.json(rows.map(r => ({ ...r, images: JSON.parse(r.images || '[]') })));
});

router.get('/user/:userId', (req, res) => {
  const rows = db.prepare(`
    SELECT l.*, c.name cat_name, c.slug cat_slug
    FROM listings l LEFT JOIN categories c ON l.category_id = c.id
    WHERE l.user_id = ? AND l.status != 'deleted'
    ORDER BY l.created_at DESC
  `).all(req.params.userId);
  res.json(rows.map(r => ({ ...r, images: JSON.parse(r.images || '[]') })));
});

router.get('/', optionalAuth, (req, res) => {
  try {
    const { q, category, province, condition, minPrice, maxPrice, sort = 'newest', page = 1, limit = 20 } = req.query;
    const where = ['l.status = ?'];
    const params = ['active'];

    if (q) { where.push('(l.title LIKE ? OR l.description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
    if (category) { where.push('(c.slug = ? OR pc.slug = ?)'); params.push(category, category); }
    if (province) { where.push('l.province = ?'); params.push(province); }
    if (condition) { where.push('l.item_condition = ?'); params.push(condition); }
    if (minPrice) { where.push('l.price >= ?'); params.push(+minPrice); }
    if (maxPrice) { where.push('l.price <= ?'); params.push(+maxPrice); }

    const order = sort === 'price_asc' ? 'l.price ASC' : sort === 'price_desc' ? 'l.price DESC' : sort === 'popular' ? 'l.views DESC' : 'l.is_featured DESC, l.created_at DESC';
    const offset = (+page - 1) * +limit;

    const base = `FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN categories pc ON c.parent_id = pc.id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE ${where.join(' AND ')}`;

    const rows = db.prepare(`SELECT l.*, c.name cat_name, c.slug cat_slug, c.icon cat_icon,
      pc.name parent_name, pc.slug parent_slug,
      u.name seller_name, u.phone seller_phone, u.avatar seller_avatar
      ${base} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...params, +limit, offset);

    const { total } = db.prepare(`SELECT COUNT(*) total ${base}`).get(...params);

    res.json({
      listings: rows.map(r => ({ ...r, images: JSON.parse(r.images || '[]'), negotiable: !!r.negotiable, is_featured: !!r.is_featured })),
      total, page: +page, totalPages: Math.ceil(total / +limit)
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', optionalAuth, (req, res) => {
  const r = db.prepare(`
    SELECT l.*, c.name cat_name, c.slug cat_slug, c.icon cat_icon, c.parent_id,
           u.name seller_name, u.phone seller_phone, u.avatar seller_avatar, u.created_at seller_joined
    FROM listings l
    LEFT JOIN categories c ON l.category_id = c.id
    LEFT JOIN users u ON l.user_id = u.id
    WHERE l.id = ? AND l.status != 'deleted'
  `).get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Không tìm thấy tin đăng' });
  db.prepare('UPDATE listings SET views = views+1 WHERE id=?').run(req.params.id);
  const isSaved = req.user ? !!db.prepare('SELECT 1 FROM saved_listings WHERE user_id=? AND listing_id=?').get(req.user.id, r.id) : false;
  const related = db.prepare(`
    SELECT l.*, c.name cat_name, c.slug cat_slug, u.name seller_name
    FROM listings l LEFT JOIN categories c ON l.category_id=c.id LEFT JOIN users u ON l.user_id=u.id
    WHERE l.category_id=? AND l.id!=? AND l.status='active' ORDER BY l.created_at DESC LIMIT 6
  `).all(r.category_id, r.id);
  res.json({ ...r, images: JSON.parse(r.images || '[]'), negotiable: !!r.negotiable, is_featured: !!r.is_featured, isSaved, related: related.map(x => ({ ...x, images: JSON.parse(x.images || '[]') })) });
});

router.post('/', authMiddleware, (req, res) => {
  const { title, description, price, negotiable, category_id, province, district, address, images, item_condition } = req.body;
  if (!title || !category_id || !province) return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  const r = db.prepare('INSERT INTO listings (title,description,price,negotiable,category_id,user_id,province,district,address,images,item_condition) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(title, description || '', price || 0, negotiable ? 1 : 0, category_id, req.user.id, province, district || '', address || '', JSON.stringify(images || []), item_condition || 'used');
  const listing = db.prepare('SELECT * FROM listings WHERE id=?').get(r.lastInsertRowid);
  res.status(201).json({ ...listing, images: JSON.parse(listing.images) });
});

router.put('/:id', authMiddleware, (req, res) => {
  const listing = db.prepare('SELECT * FROM listings WHERE id=?').get(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Không tìm thấy' });
  if (listing.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Không có quyền' });
  const { title, description, price, negotiable, category_id, province, district, address, images, item_condition, status } = req.body;
  db.prepare('UPDATE listings SET title=?,description=?,price=?,negotiable=?,category_id=?,province=?,district=?,address=?,images=?,item_condition=?,status=? WHERE id=?')
    .run(title||listing.title, description??listing.description, price??listing.price, negotiable!==undefined?(negotiable?1:0):listing.negotiable,
      category_id||listing.category_id, province||listing.province, district||listing.district, address||listing.address,
      JSON.stringify(images||JSON.parse(listing.images)), item_condition||listing.item_condition, status||listing.status, req.params.id);
  const updated = db.prepare('SELECT * FROM listings WHERE id=?').get(req.params.id);
  res.json({ ...updated, images: JSON.parse(updated.images) });
});

router.delete('/:id', authMiddleware, (req, res) => {
  const listing = db.prepare('SELECT * FROM listings WHERE id=?').get(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Không tìm thấy' });
  if (listing.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Không có quyền' });
  db.prepare("UPDATE listings SET status='deleted' WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

router.post('/:id/save', authMiddleware, (req, res) => {
  const exists = db.prepare('SELECT 1 FROM saved_listings WHERE user_id=? AND listing_id=?').get(req.user.id, req.params.id);
  if (exists) { db.prepare('DELETE FROM saved_listings WHERE user_id=? AND listing_id=?').run(req.user.id, req.params.id); return res.json({ saved: false }); }
  db.prepare('INSERT INTO saved_listings (user_id,listing_id) VALUES (?,?)').run(req.user.id, req.params.id);
  res.json({ saved: true });
});

export default router;
