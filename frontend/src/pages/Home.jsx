import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ListingCard from '../components/ListingCard';
import CategoryGrid from '../components/CategoryGrid';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [newest, setNewest] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [tab, setTab] = useState('newest');
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
    api.get('/listings?sort=newest&limit=16').then(r => setNewest(r.data.listings)).catch(() => {});
    api.get('/listings?featured=true&limit=8').then(r => setFeatured(r.data.listings)).catch(() => {});
  }, []);

  const search = (e) => { e.preventDefault(); if (q.trim()) navigate(`/tim-kiem?q=${encodeURIComponent(q.trim())}`); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      {/* Hero search */}
      <div className="bg-gradient-to-r from-primary to-orange-400 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Chợ Tốt – Mua bán nhanh, giá tốt!</h1>
        <p className="text-orange-100 text-sm mb-4">Hàng triệu tin đăng mua bán uy tín trên toàn quốc</p>
        <form onSubmit={search} className="flex gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm kiếm sản phẩm, xe cộ, nhà đất..."
            className="flex-1 px-4 py-2.5 rounded-lg text-gray-800 text-sm outline-none" />
          <button type="submit" className="bg-white text-primary font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-orange-50">
            🔍 Tìm kiếm
          </button>
        </form>
      </div>

      {/* Categories */}
      <section className="bg-white rounded-xl p-4">
        <h2 className="font-bold text-gray-800 mb-3">Danh mục sản phẩm</h2>
        <CategoryGrid categories={categories} />
      </section>

      {/* VIP listings */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-800">🌟 Tin VIP nổi bật</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {featured.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {/* Tabs + newest */}
      <section>
        <div className="flex items-center gap-4 mb-3">
          <h2 className="font-bold text-gray-800">Tin đăng</h2>
          <div className="flex gap-1">
            {[['newest','Mới nhất'],['popular','Xem nhiều']].map(([v,l]) => (
              <button key={v} onClick={() => {
                setTab(v);
                api.get(`/listings?sort=${v}&limit=16`).then(r => setNewest(r.data.listings)).catch(() => {});
              }}
                className={`px-3 py-1 rounded-full text-sm ${tab===v ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {newest.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
        <div className="text-center mt-4">
          <Link to="/tim-kiem" className="inline-block border border-primary text-primary px-6 py-2 rounded-full text-sm hover:bg-orange-50">
            Xem thêm tin đăng →
          </Link>
        </div>
      </section>

      {/* Quick category links */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { name: 'Bất động sản', slug: 'bat-dong-san', icon: '🏠', desc: 'Mua bán, cho thuê nhà đất' },
          { name: 'Xe cộ', slug: 'xe-co', icon: '🚗', desc: 'Ô tô, xe máy, xe đạp' },
          { name: 'Điện tử', slug: 'dien-tu', icon: '📱', desc: 'Điện thoại, laptop, tivi' },
          { name: 'Việc làm', slug: 'viec-lam', icon: '💼', desc: 'Tuyển dụng toàn quốc' },
        ].map(item => (
          <Link key={item.slug} to={`/danh-muc/${item.slug}`}
            className="bg-white rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <span className="text-3xl">{item.icon}</span>
            <div>
              <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
