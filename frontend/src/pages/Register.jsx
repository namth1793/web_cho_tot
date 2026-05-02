import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await register(form); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || 'Đăng ký thất bại'); }
    finally { setLoading(false); }
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm(v => ({...v, [k]: e.target.value})) });

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <Link to="/" className="flex items-center justify-center gap-1 mb-2">
            <span className="bg-primary text-white font-bold text-2xl px-2 py-0.5 rounded">chợ</span>
            <span className="font-bold text-2xl">tốt</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Đăng ký tài khoản</h1>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          {[['name','Họ và tên','Nguyễn Văn A','text'],['phone','Số điện thoại','09xxxxxxxx','tel'],['email','Email (tuỳ chọn)','email@gmail.com','email'],['password','Mật khẩu','••••••','password']].map(([k,label,ph,type]) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} placeholder={ph} {...f(k)} className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white font-semibold py-2 rounded hover:bg-primary-dark disabled:opacity-50 mt-1">
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Đã có tài khoản? <Link to="/dang-nhap" className="text-primary font-medium">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
