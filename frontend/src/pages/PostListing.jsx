import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { PROVINCES } from '../utils/api';

export default function PostListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', negotiable: false,
    category_id: '', province: 'Hà Nội', district: '', address: '',
    item_condition: 'used', images: []
  });
  const [imgUrl, setImgUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate('/dang-nhap');
    api.get('/categories').then(r => {
      const all = [];
      r.data.forEach(p => { all.push(p); p.subcategories?.forEach(s => all.push({...s, parentName: p.name})); });
      setCategories(all);
    }).catch(() => {});
  }, [user]);

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const addImg = () => {
    if (imgUrl.trim() && form.images.length < 6) { set('images', [...form.images, imgUrl.trim()]); setImgUrl(''); }
  };

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const r = await api.post('/listings', { ...form, price: +form.price || 0 });
      navigate(`/tin/${r.data.id}`);
    } catch (err) { setError(err.response?.data?.error || 'Lỗi khi đăng tin'); }
    finally { setLoading(false); }
  };

  const Label = ({ children }) => <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
  const Input = (props) => <input {...props} className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary" />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Link to="/" className="text-gray-400 hover:text-primary">←</Link>
        <h1 className="text-xl font-bold text-gray-800">Đăng tin mới</h1>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded">{error}</div>}

        <div>
          <Label>Danh mục <span className="text-red-500">*</span></Label>
          <select value={form.category_id} onChange={e => set('category_id', e.target.value)} required
            className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Chọn danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.parentName ? `  └ ${c.icon} ${c.name}` : `${c.icon} ${c.name}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Tiêu đề tin đăng <span className="text-red-500">*</span></Label>
          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="VD: iPhone 15 Pro Max 256GB Natural Titanium" required maxLength={100} />
          <p className="text-xs text-gray-400 mt-1">{form.title.length}/100 ký tự</p>
        </div>

        <div>
          <Label>Mô tả chi tiết</Label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5}
            placeholder="Mô tả tình trạng, xuất xứ, lý do bán..." maxLength={2000}
            className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Label>Giá (VNĐ)</Label>
            <Input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0 = Miễn phí" min="0" />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input type="checkbox" checked={form.negotiable} onChange={e => set('negotiable', e.target.checked)} className="w-4 h-4 accent-primary" />
              Thương lượng
            </label>
          </div>
        </div>

        <div>
          <Label>Tình trạng</Label>
          <div className="flex gap-3">
            {[['used','Đã qua sử dụng'],['new','Mới']].map(([v,l]) => (
              <label key={v} className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded cursor-pointer text-sm ${form.item_condition===v?'border-primary text-primary bg-orange-50':'text-gray-600'}`}>
                <input type="radio" name="condition" value={v} checked={form.item_condition===v} onChange={() => set('item_condition', v)} className="hidden" />
                {l}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Tỉnh/Thành phố <span className="text-red-500">*</span></Label>
            <select value={form.province} onChange={e => set('province', e.target.value)} required
              className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary">
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <Label>Quận/Huyện</Label>
            <Input value={form.district} onChange={e => set('district', e.target.value)} placeholder="VD: Cầu Giấy" />
          </div>
        </div>

        <div>
          <Label>Hình ảnh (tối đa 6 ảnh)</Label>
          <div className="flex gap-2 mb-2">
            <Input value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="Dán URL hình ảnh vào đây" />
            <button type="button" onClick={addImg} disabled={form.images.length >= 6}
              className="px-3 py-2 border border-primary text-primary rounded text-sm hover:bg-orange-50 disabled:opacity-50 flex-shrink-0">
              + Thêm
            </button>
          </div>
          {form.images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {form.images.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} className="w-20 h-20 object-cover rounded border" onError={e => e.target.style.display='none'} />
                  <button type="button" onClick={() => set('images', form.images.filter((_,j)=>j!==i))}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">Có thể dùng URL từ picsum.photos/seed/abc/400/300</p>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark disabled:opacity-50 text-base">
          {loading ? 'Đang đăng tin...' : '🚀 Đăng tin ngay'}
        </button>
      </form>
    </div>
  );
}
