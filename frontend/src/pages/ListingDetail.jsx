import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { formatPrice, timeAgo } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    setLoading(true); setImgIdx(0);
    api.get(`/listings/${id}`).then(r => { setListing(r.data); setSaved(r.data.isSaved); }).catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSave = async () => {
    if (!user) return navigate('/dang-nhap');
    const r = await api.post(`/listings/${id}/save`);
    setSaved(r.data.saved);
  };

  const sendMsg = async () => {
    if (!user) return navigate('/dang-nhap');
    if (!msg.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { receiver_id: listing.user_id, listing_id: listing.id, content: msg });
      setMsgSent(true); setMsg('');
    } finally { setSending(false); }
  };

  const deleteListing = async () => {
    if (!confirm('Xoá tin đăng này?')) return;
    await api.delete(`/listings/${id}`);
    navigate('/tai-khoan');
  };

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-8 text-center text-gray-400">Đang tải...</div>;
  if (!listing) return null;

  const imgs = listing.images?.length ? listing.images : [`https://picsum.photos/seed/ph${id}/800/600`];

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-3">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        {listing.cat_slug && <> / <Link to={`/danh-muc/${listing.cat_slug}`} className="hover:text-primary">{listing.cat_name}</Link></>}
        <> / <span className="text-gray-700">{listing.title}</span></>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left col */}
        <div className="flex-1">
          {/* Images */}
          <div className="bg-white rounded-xl overflow-hidden mb-3">
            <div className="relative aspect-[4/3] bg-gray-100">
              <img src={imgs[imgIdx]} alt={listing.title} className="w-full h-full object-contain"
                onError={e => { e.target.src = `https://picsum.photos/seed/err${id}/800/600`; }} />
              {imgs.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i-1+imgs.length)%imgs.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center">‹</button>
                  <button onClick={() => setImgIdx(i => (i+1)%imgs.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center">›</button>
                </>
              )}
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-1 p-2 overflow-x-auto">
                {imgs.map((img, i) => (
                  <img key={i} src={img} onClick={() => setImgIdx(i)}
                    className={`w-16 h-12 object-cover rounded cursor-pointer flex-shrink-0 border-2 ${imgIdx===i?'border-primary':'border-transparent'}`} />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-white rounded-xl p-5 mb-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h1 className="text-xl font-bold text-gray-800 flex-1">{listing.title}</h1>
              <button onClick={toggleSave} className={`flex-shrink-0 text-2xl ${saved ? 'text-red-500' : 'text-gray-300'} hover:text-red-400`}>
                {saved ? '❤️' : '🤍'}
              </button>
            </div>
            <div className="text-2xl font-bold text-primary mb-1">
              {formatPrice(listing.price)}
              {listing.negotiable && <span className="text-sm text-gray-400 font-normal ml-2">• Thương lượng</span>}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-3">
              <span>📍 {listing.province}{listing.district ? `, ${listing.district}` : ''}</span>
              <span>🕐 {timeAgo(listing.created_at)}</span>
              <span>👁️ {listing.views} lượt xem</span>
              {listing.item_condition && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs">{listing.item_condition==='new'?'Mới':'Đã sử dụng'}</span>}
            </div>

            <hr className="my-4" />
            <h2 className="font-semibold text-gray-800 mb-2">Mô tả</h2>
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{listing.description || 'Không có mô tả.'}</p>

            {user && user.id === listing.user_id && (
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Link to={`/dang-tin?edit=${listing.id}`} className="flex-1 text-center border border-primary text-primary py-2 rounded text-sm hover:bg-orange-50">Chỉnh sửa</Link>
                <button onClick={deleteListing} className="flex-1 border border-red-400 text-red-500 py-2 rounded text-sm hover:bg-red-50">Xoá tin</button>
              </div>
            )}
          </div>
        </div>

        {/* Right col – seller + contact */}
        <div className="md:w-72 flex-shrink-0 space-y-3">
          {/* Seller */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <img src={listing.seller_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.seller_name||'U')}&background=FF5C00&color=fff`}
                alt={listing.seller_name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-gray-800">{listing.seller_name}</p>
                <p className="text-xs text-gray-400">Thành viên từ {listing.seller_joined ? new Date(listing.seller_joined).getFullYear() : '2024'}</p>
              </div>
            </div>
            {showPhone ? (
              <a href={`tel:${listing.seller_phone}`} className="block w-full bg-primary text-white text-center font-semibold py-2.5 rounded-lg hover:bg-primary-dark">
                📞 {listing.seller_phone}
              </a>
            ) : (
              <button onClick={() => setShowPhone(true)} className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dark">
                📞 Xem số điện thoại
              </button>
            )}
          </div>

          {/* Message */}
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 mb-2 text-sm">Nhắn tin cho người bán</h3>
            {msgSent ? (
              <div className="text-center py-3 text-green-600 text-sm">✅ Đã gửi tin nhắn thành công!</div>
            ) : (
              <>
                <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3}
                  placeholder="Bạn quan tâm đến sản phẩm này, xin liên hệ..."
                  className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
                <button onClick={sendMsg} disabled={sending || !msg.trim()}
                  className="w-full mt-2 border border-primary text-primary font-medium py-2 rounded hover:bg-orange-50 disabled:opacity-50 text-sm">
                  {sending ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </>
            )}
          </div>

          {/* Safety */}
          <div className="bg-orange-50 rounded-xl p-4 text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-orange-700 mb-2">🛡️ An toàn giao dịch</p>
            <p>• Gặp mặt trực tiếp để kiểm tra hàng</p>
            <p>• Không chuyển khoản trước khi nhận hàng</p>
            <p>• Kiểm tra kỹ thông tin người bán</p>
          </div>
        </div>
      </div>

      {/* Related */}
      {listing.related?.length > 0 && (
        <div className="mt-6">
          <h2 className="font-bold text-gray-800 mb-3">Tin đăng tương tự</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {listing.related.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </div>
      )}
    </div>
  );
}
