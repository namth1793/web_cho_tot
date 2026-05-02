import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-8">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-primary text-white font-bold text-lg px-2 py-0.5 rounded">chợ</span>
            <span className="font-bold text-xl text-gray-800">tốt</span>
          </div>
          <p className="text-sm text-gray-500">Mua bán nhanh, giá tốt</p>
          <p className="text-xs text-gray-400 mt-2">© 2024 Chợ Tốt. All rights reserved.</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Về Chợ Tốt</h4>
          <ul className="space-y-1.5 text-sm text-gray-500">
            <li><a href="#" className="hover:text-primary">Giới thiệu</a></li>
            <li><a href="#" className="hover:text-primary">Quy chế hoạt động</a></li>
            <li><a href="#" className="hover:text-primary">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-primary">Điều khoản dịch vụ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Hỗ trợ</h4>
          <ul className="space-y-1.5 text-sm text-gray-500">
            <li><a href="#" className="hover:text-primary">Trung tâm trợ giúp</a></li>
            <li><a href="#" className="hover:text-primary">An toàn giao dịch</a></li>
            <li><a href="#" className="hover:text-primary">Liên hệ</a></li>
            <li><a href="#" className="hover:text-primary">Báo cáo vi phạm</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Tải ứng dụng</h4>
          <div className="space-y-2">
            <a href="#" className="flex items-center gap-2 bg-black text-white rounded-lg px-3 py-1.5 text-sm hover:bg-gray-800">
              <span>🍎</span> App Store
            </a>
            <a href="#" className="flex items-center gap-2 bg-black text-white rounded-lg px-3 py-1.5 text-sm hover:bg-gray-800">
              <span>▶</span> Google Play
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
