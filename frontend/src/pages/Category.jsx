import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api, { PROVINCES } from '../utils/api';
import ListingCard from '../components/ListingCard';

export default function Category() {
  const { slug } = useParams();
  const [sp] = useSearchParams();
  const [cat, setCat] = useState(null);
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ province: '', condition: '', minPrice: '', maxPrice: '', sort: 'newest' });

  useEffect(() => {
    api.get(`/categories/${slug}`).then(r => setCat(r.data)).catch(() => {});
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ category: slug, page, limit: 20, ...filters });
    Object.keys(filters).forEach(k => !filters[k] && params.delete(k));
    api.get(`/listings?${params}`).then(r => {
      setListings(r.data.listings); setTotal(r.data.total);
      setTotalPages(r.data.totalPages); setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug, page, filters]);

  const setFilter = (k, v) => { setFilters(f => ({...f, [k]: v})); setPage(1); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-3">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        {cat?.parent && <> / <Link to={`/danh-muc/${cat.parent.slug}`} className="hover:text-primary">{cat.parent.name}</Link></>}
        {cat && <> / <span className="text-gray-800">{cat.name}</span></>}
      </div>

      {cat && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">{cat.icon}</span>
          <h1 className="text-xl font-bold text-gray-800">{cat.name}</h1>
          <span className="text-sm text-gray-500">({total} tin)</span>
        </div>
      )}

      {/* Subcategories */}
      {cat?.subcategories?.length > 0 && (
        <div className="bg-white rounded-xl p-3 mb-4 flex flex-wrap gap-2">
          {cat.subcategories.map(s => (
            <Link key={s.id} to={`/danh-muc/${s.slug}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm hover:border-primary hover:text-primary transition-colors">
              {s.icon} {s.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        {/* Sidebar filters */}
        <aside className="w-52 flex-shrink-0 hidden md:block space-y-3">
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">Bộ lọc</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Khu vực</label>
                <select value={filters.province} onChange={e => setFilter('province', e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm outline-none focus:border-primary">
                  <option value="">Toàn quốc</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tình trạng</label>
                <select value={filters.condition} onChange={e => setFilter('condition', e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm outline-none focus:border-primary">
                  <option value="">Tất cả</option>
                  <option value="new">Mới</option>
                  <option value="used">Đã qua sử dụng</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Giá từ (đ)</label>
                <input type="number" value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)}
                  placeholder="VD: 1000000" className="w-full border rounded px-2 py-1.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Giá đến (đ)</label>
                <input type="number" value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)}
                  placeholder="VD: 50000000" className="w-full border rounded px-2 py-1.5 text-sm outline-none focus:border-primary" />
              </div>
              <button onClick={() => setFilters({ province:'', condition:'', minPrice:'', maxPrice:'', sort:'newest' })}
                className="w-full text-sm text-gray-500 border rounded py-1.5 hover:bg-gray-50">
                Xoá bộ lọc
              </button>
            </div>
          </div>
        </aside>

        {/* Listings grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">{total} kết quả</span>
            <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)}
              className="border rounded px-2 py-1 text-sm outline-none focus:border-primary">
              <option value="newest">Mới nhất</option>
              <option value="popular">Xem nhiều</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{[...Array(6)].map((_,i) => <div key={i} className="h-60 bg-gray-200 rounded animate-pulse" />)}</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p>Không có tin đăng nào</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {listings.map(l => <ListingCard key={l.id} listing={l} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-1 mt-4">
                  {[...Array(totalPages)].map((_,i) => (
                    <button key={i} onClick={() => setPage(i+1)}
                      className={`w-8 h-8 rounded text-sm ${page===i+1 ? 'bg-primary text-white' : 'bg-white hover:bg-orange-50'}`}>
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
