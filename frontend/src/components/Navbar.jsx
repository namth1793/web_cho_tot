import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [categories, setCategories] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = (e) => { e.preventDefault(); if (q.trim()) navigate(`/tim-kiem?q=${encodeURIComponent(q.trim())}`); };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-primary">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 flex-shrink-0">
            <span className="bg-white text-primary font-bold text-xl px-2 py-0.5 rounded leading-tight">chợ</span>
            <span className="text-white font-bold text-xl">tốt</span>
          </Link>

          {/* Search */}
          <form onSubmit={search} className="flex-1 flex gap-2 max-w-2xl">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Bạn cần tìm gì?"
              className="flex-1 px-4 py-2 rounded text-sm outline-none"
            />
            <button type="submit" className="bg-white text-primary font-semibold px-4 py-2 rounded text-sm hover:bg-orange-50">
              🔍 Tìm
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            <Link to="/dang-tin" className="bg-white text-primary font-semibold px-3 py-1.5 rounded text-sm hover:bg-orange-50 hidden sm:block">
              + Đăng tin
            </Link>
            {user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowMenu(v => !v)} className="flex items-center gap-2 text-white text-sm">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  <span className="hidden md:block">{user.name.split(' ').pop()}</span>
                  <span>▾</span>
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded shadow-lg w-44 py-1 z-50 border">
                    <Link to="/tai-khoan" onClick={() => setShowMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50">Tài khoản của tôi</Link>
                    <Link to="/tai-khoan?tab=listings" onClick={() => setShowMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50">Tin đăng của tôi</Link>
                    <Link to="/tai-khoan?tab=saved" onClick={() => setShowMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50">Tin đã lưu</Link>
                    <hr className="my-1" />
                    <button onClick={() => { logout(); setShowMenu(false); navigate('/'); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-1">
                <Link to="/dang-nhap" className="text-white text-sm px-3 py-1.5 rounded hover:bg-primary-dark">Đăng nhập</Link>
                <Link to="/dang-ky" className="bg-white text-primary text-sm font-semibold px-3 py-1.5 rounded hover:bg-orange-50">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category bar */}
      <div className="border-b overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 px-4 py-1.5 max-w-6xl mx-auto">
          <Link to="/" className="flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-primary hover:bg-orange-50 rounded whitespace-nowrap">
            🏠 Tất cả
          </Link>
          {categories.map(cat => (
            <Link key={cat.id} to={`/danh-muc/${cat.slug}`}
              className="flex-shrink-0 flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-primary hover:bg-orange-50 rounded whitespace-nowrap">
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
