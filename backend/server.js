import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';

import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import categoryRoutes from './routes/categories.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 5024;

const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

export const db = new Database(join(dataDir, 'chotot.db'));

db.exec(`
  PRAGMA journal_mode=WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT '📦',
    color TEXT DEFAULT '#666',
    parent_id INTEGER REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    price INTEGER DEFAULT 0,
    negotiable INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES categories(id),
    user_id INTEGER REFERENCES users(id),
    province TEXT DEFAULT 'Hà Nội',
    district TEXT DEFAULT '',
    address TEXT DEFAULT '',
    images TEXT DEFAULT '[]',
    status TEXT DEFAULT 'active',
    item_condition TEXT DEFAULT 'used',
    views INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS saved_listings (
    user_id INTEGER NOT NULL,
    listing_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, listing_id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    listing_id INTEGER,
    content TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const uploadsDir = join(__dirname, 'uploads');
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`✅ Chợ Tốt backend: http://localhost:${PORT}`));
