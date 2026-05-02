import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(form.phone, form.password); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || 'Đăng nhập thất bại'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <Link to="/" className="flex items-center justify-center gap-1 mb-2">
            <span className="bg-primary text-white font-bold text-2xl px-2 py-0.5 rounded">chợ</span>
            <span className="font-bold text-2xl">tốt</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Đăng nhập</h1>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
              placeholder="09xxxxxxxx" className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
              placeholder="••••••" className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white font-semibold py-2 rounded hover:bg-primary-dark disabled:opacity-50">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Chưa có tài khoản? <Link to="/dang-ky" className="text-primary font-medium">Đăng ký ngay</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-3">Demo: 0901234567 / user123</p>
      </div>
    </div>
  );
}
