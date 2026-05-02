import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { PROVINCES } from '../utils/api';
import ListingCard from '../components/ListingCard';

export default function Search() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '';
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ province: sp.get('province')||'', condition: '', minPrice:'', maxPrice:'', sort:'newest' });
  const [categories, setCategories] = useState([]);

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    const params = new URLSearchParams({ q, page, limit: 20, ...filters });
    Object.keys(filters).forEach(k => !filters[k] && params.delete(k));
    api.get(`/listings?${params}`).then(r => {
      setListings(r.data.listings); setTotal(r.data.total); setTotalPages(r.data.totalPages);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [q, page, filters]);

  const setF = (k, v) => { setFilters(f => ({...f, [k]: v})); setPage(1); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <h1 className="text-lg font-bold text-gray-800 mb-4">
        {q ? <>Kết quả tìm kiếm: "<span className="text-primary">{q}</span>" ({total} tin)</> : 'Tất cả tin đăng'}
      </h1>
      <div className="flex gap-4">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 hidden md:block space-y-3">
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Bộ lọc</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Danh mục</label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {categories.map(c => (
                    <Link key={c.id} to={`/danh-muc/${c.slug}?q=${q}`}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-primary py-0.5">
                      {c.icon} {c.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Khu vực</label>
                <select value={filters.province} onChange={e => setF('province', e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm outline-none focus:border-primary">
                  <option value="">Toàn quốc</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tình trạng</label>
                <select value={filters.condition} onChange={e => setF('condition', e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm outline-none focus:border-primary">
                  <option value="">Tất cả</option>
                  <option value="new">Mới</option>
                  <option value="used">Đã qua sử dụng</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Giá từ</label>
                <input type="number" value={filters.minPrice} onChange={e => setF('minPrice', e.target.value)}
                  placeholder="0" className="w-full border rounded px-2 py-1.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Giá đến</label>
                <input type="number" value={filters.maxPrice} onChange={e => setF('maxPrice', e.target.value)}
                  placeholder="Không giới hạn" className="w-full border rounded px-2 py-1.5 text-sm outline-none focus:border-primary" />
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">{total} tin đăng</span>
            <select value={filters.sort} onChange={e => setF('sort', e.target.value)}
              className="border rounded px-2 py-1 text-sm outline-none focus:border-primary">
              <option value="newest">Mới nhất</option>
              <option value="popular">Xem nhiều nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{[...Array(6)].map((_,i) => <div key={i} className="h-60 bg-gray-200 rounded animate-pulse" />)}</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-medium">Không tìm thấy kết quả cho "{q}"</p>
              <p className="text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {listings.map(l => <ListingCard key={l.id} listing={l} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-1 mt-4">
                  {[...Array(Math.min(totalPages,10))].map((_,i) => (
                    <button key={i} onClick={() => setPage(i+1)}
                      className={`w-8 h-8 rounded text-sm ${page===i+1?'bg-primary text-white':'bg-white hover:bg-orange-50'}`}>
                      {i+1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
