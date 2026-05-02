import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5024/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('ct_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const formatPrice = (price) => {
  if (!price || price === 0) return 'Miễn phí';
  if (price >= 1000000000) return `${(price / 1000000000).toFixed(price % 1000000000 === 0 ? 0 : 1)} tỷ`;
  if (price >= 1000000) return `${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 0)} triệu`;
  if (price >= 1000) return `${(price / 1000).toFixed(0)} nghìn`;
  return `${price.toLocaleString('vi-VN')}đ`;
};

export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (d > 30) return new Date(date).toLocaleDateString('vi-VN');
  if (d > 0) return `${d} ngày trước`;
  if (h > 0) return `${h} giờ trước`;
  return `${m} phút trước`;
};

export const PROVINCES = ['Hà Nội','TP. Hồ Chí Minh','Đà Nẵng','Hải Phòng','Cần Thơ','Bình Dương','Đồng Nai','An Giang','Bà Rịa - Vũng Tàu','Bắc Giang','Bắc Kạn','Bắc Ninh','Bến Tre','Bình Định','Bình Phước','Bình Thuận','Cà Mau','Cao Bằng','Đắk Lắk','Đắk Nông','Điện Biên','Đồng Tháp','Gia Lai','Hà Giang','Hà Nam','Hà Tĩnh','Hải Dương','Hậu Giang','Hòa Bình','Hưng Yên','Khánh Hòa','Kiên Giang','Kon Tum','Lai Châu','Lạng Sơn','Lào Cai','Long An','Nam Định','Nghệ An','Ninh Bình','Ninh Thuận','Phú Thọ','Phú Yên','Quảng Bình','Quảng Nam','Quảng Ngãi','Quảng Ninh','Quảng Trị','Sóc Trăng','Sơn La','Tây Ninh','Thái Bình','Thái Nguyên','Thanh Hóa','Thừa Thiên Huế','Tiền Giang','Trà Vinh','Tuyên Quang','Vĩnh Long','Vĩnh Phúc','Yên Bái'];

export default api;
