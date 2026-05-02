import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { formatPrice, timeAgo } from '../utils/api';

function ListingRow({ listing, onDelete }) {
  return (
    <div className="flex gap-3 bg-white rounded-lg p-3 shadow-sm">
      <img src={listing.images?.[0] || `https://picsum.photos/seed/ph${listing.id}/200/150`}
        alt={listing.title} className="w-20 h-16 object-cover rounded flex-shrink-0"
        onError={e => { e.target.src = `https://picsum.photos/seed/err${listing.id}/200/150`; }} />
      <div className="flex-1 min-w-0">
        <Link to={`/tin/${listing.id}`} className="font-medium text-gray-800 text-sm hover:text-primary line-clamp-1">{listing.title}</Link>
        <p className="text-primary font-bold text-sm mt-0.5">{formatPrice(listing.price)}</p>
        <p className="text-xs text-gray-400">{timeAgo(listing.created_at)} · {listing.views||0} lượt xem</p>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <Link to={`/tin/${listing.id}`} className="text-xs border rounded px-2 py-1 text-gray-600 hover:border-primary hover:text-primary">Xem</Link>
        <button onClick={() => onDelete(listing.id)} className="text-xs border border-red-300 rounded px-2 py-1 text-red-500 hover:bg-red-50">Xoá</button>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [tab, setTab] = useState(sp.get('tab') || 'listings');
  const [myListings, setMyListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!user) navigate('/dang-nhap'); }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      api.get(`/listings/user/${user.id}`).then(r => setMyListings(r.data)),
      api.get('/listings/saved').then(r => setSavedListings(r.data)),
    ]).finally(() => setLoading(false));
  }, [user]);

  const deleteListng = async (id) => {
    if (!confirm('Xoá tin này?')) return;
    await api.delete(`/listings/${id}`);
    setMyListings(l => l.filter(x => x.id !== id));
  };

  if (!user) return null;

  const tabs = [['listings',`Tin của tôi (${myListings.length})`],['saved',`Đã lưu (${savedListings.length})`],['info','Thông tin']];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 mb-4 flex items-center gap-4 shadow-sm">
        <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.phone}</p>
          {user.email && <p className="text-xs text-gray-400">{user.email}</p>}
        </div>
        <Link to="/dang-tin" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark flex-shrink-0">
          + Đăng tin
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {tabs.map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab===v?'bg-primary text-white':'bg-white text-gray-600 hover:bg-orange-50'}`}>
            {l}
          </button>
        ))}
        <button onClick={() => { logout(); navigate('/'); }} className="ml-auto px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded-full hover:bg-red-50">
          Đăng xuất
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-24 bg-white rounded-lg animate-pulse" />)}</div>
      ) : tab === 'listings' ? (
        myListings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">📝</div>
            <p>Bạn chưa có tin đăng nào</p>
            <Link to="/dang-tin" className="mt-3 inline-block bg-primary text-white px-5 py-2 rounded-full text-sm">Đăng tin ngay</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myListings.map(l => <ListingRow key={l.id} listing={l} onDelete={deleteListng} />)}
          </div>
        )
      ) : tab === 'saved' ? (
        savedListings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">❤️</div>
            <p>Bạn chưa lưu tin đăng nào</p>
            <Link to="/" className="mt-3 inline-block bg-primary text-white px-5 py-2 rounded-full text-sm">Khám phá ngay</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {savedListings.map(l => <ListingRow key={l.id} listing={l} onDelete={() => {}} />)}
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Thông tin tài khoản</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Họ tên</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Số điện thoại</span>
              <span className="font-medium">{user.phone}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{user.email || '—'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Tham gia</span>
              <span className="font-medium">{new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-xs text-gray-400">Để thay đổi thông tin, vui lòng liên hệ hỗ trợ.</p>
          </div>
        </div>
      )}
    </div>
  );
}
