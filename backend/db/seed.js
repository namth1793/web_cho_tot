import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
const db = new Database(join(dataDir, 'chotot.db'));

db.exec(`
  PRAGMA journal_mode=WAL;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, email TEXT UNIQUE, phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, avatar TEXT DEFAULT '', role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT '📦', color TEXT DEFAULT '#666', parent_id INTEGER REFERENCES categories(id)
  );
  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT DEFAULT '',
    price INTEGER DEFAULT 0, negotiable INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES categories(id), user_id INTEGER REFERENCES users(id),
    province TEXT DEFAULT 'Hà Nội', district TEXT DEFAULT '', address TEXT DEFAULT '',
    images TEXT DEFAULT '[]', status TEXT DEFAULT 'active', item_condition TEXT DEFAULT 'used',
    views INTEGER DEFAULT 0, is_featured INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS saved_listings (
    user_id INTEGER NOT NULL, listing_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, listing_id)
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id INTEGER NOT NULL, receiver_id INTEGER NOT NULL,
    listing_id INTEGER, content TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`DELETE FROM messages; DELETE FROM saved_listings; DELETE FROM listings; DELETE FROM categories; DELETE FROM users;`);

const insertCat = db.prepare('INSERT INTO categories (name,slug,icon,color,parent_id) VALUES (?,?,?,?,?)');
const ids = {};

const parents = [
  ['Bất động sản','bat-dong-san','🏠','#e74c3c'],
  ['Xe cộ','xe-co','🚗','#3498db'],
  ['Điện tử - Điện lạnh','dien-tu','📱','#9b59b6'],
  ['Nội thất - Đồ gia dụng','noi-that','🛋️','#e67e22'],
  ['Đồ dùng cá nhân','ca-nhan','👔','#1abc9c'],
  ['Mẹ & Bé','me-be','👶','#e91e63'],
  ['Thú nuôi','thu-nuoi','🐾','#795548'],
  ['Thể thao - Thú vui','the-thao','⚽','#27ae60'],
  ['Việc làm','viec-lam','💼','#2980b9'],
  ['Dịch vụ & Du lịch','dich-vu','🔧','#f39c12'],
  ['Cho tặng miễn phí','cho-tang','🎁','#e74c3c'],
];
for (const [name,slug,icon,color] of parents) { const r = insertCat.run(name,slug,icon,color,null); ids[slug]=r.lastInsertRowid; }

const subs = [
  ['Căn hộ/Chung cư','can-ho','🏢','#e74c3c','bat-dong-san'],
  ['Nhà ở riêng lẻ','nha-rieng','🏡','#e74c3c','bat-dong-san'],
  ['Đất','dat','🌍','#e74c3c','bat-dong-san'],
  ['Phòng trọ','phong-tro','🛏️','#e74c3c','bat-dong-san'],
  ['Văn phòng, Mặt bằng','van-phong','🏢','#e74c3c','bat-dong-san'],
  ['Ô tô','o-to','🚘','#3498db','xe-co'],
  ['Xe máy','xe-may','🛵','#3498db','xe-co'],
  ['Xe đạp','xe-dap','🚲','#3498db','xe-co'],
  ['Điện thoại','dien-thoai','📱','#9b59b6','dien-tu'],
  ['Máy tính','may-tinh','💻','#9b59b6','dien-tu'],
  ['Tivi - Âm thanh','tivi','📺','#9b59b6','dien-tu'],
  ['Máy lạnh - Tủ lạnh','dien-lanh','❄️','#9b59b6','dien-tu'],
  ['Sofa, Bàn ghế','sofa','🛋️','#e67e22','noi-that'],
  ['Giường, Tủ, Kệ','giuong-tu','🛏️','#e67e22','noi-that'],
  ['Bếp & Nhà bếp','bep','🍳','#e67e22','noi-that'],
  ['Quần áo nam','quan-ao-nam','👔','#1abc9c','ca-nhan'],
  ['Quần áo nữ','quan-ao-nu','👗','#1abc9c','ca-nhan'],
  ['Đồng hồ, Trang sức','dong-ho','⌚','#1abc9c','ca-nhan'],
  ['Giày dép','giay-dep','👟','#1abc9c','ca-nhan'],
  ['Chó','cho','🐕','#795548','thu-nuoi'],
  ['Mèo','meo','🐈','#795548','thu-nuoi'],
  ['Chim, Cá, Khác','chim-ca','🐦','#795548','thu-nuoi'],
];
for (const [name,slug,icon,color,parent] of subs) { const r = insertCat.run(name,slug,icon,color,ids[parent]); ids[slug]=r.lastInsertRowid; }

const insertUser = db.prepare('INSERT INTO users (name,phone,email,password,avatar) VALUES (?,?,?,?,?)');
const uids = [];
const users = [
  ['Nguyễn Văn An','0901234567','an@gmail.com'],
  ['Trần Thị Bình','0912345678','binh@gmail.com'],
  ['Lê Văn Cường','0923456789','cuong@gmail.com'],
  ['Phạm Thị Dung','0934567890','dung@gmail.com'],
  ['Hoàng Văn Em','0945678901','em@gmail.com'],
];
for (const [name,phone,email] of users) {
  const hash = bcrypt.hashSync('user123',10);
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF5C00&color=fff`;
  const r = insertUser.run(name,phone,email,hash,avatar);
  uids.push(r.lastInsertRowid);
}

const ins = db.prepare('INSERT INTO listings (title,description,price,negotiable,category_id,user_id,province,district,images,item_condition,is_featured) VALUES (?,?,?,?,?,?,?,?,?,?,?)');

const listings = [
  // BAT DONG SAN
  ['Căn hộ 2PN full nội thất ban công thoáng mát Cầu Giấy','Căn hộ 65m2, full nội thất cao cấp, view đẹp. Tòa nhà bảo vệ 24/7, thang máy, bãi xe. Gần siêu thị, trường học.',3500000,0,'can-ho',0,'Hà Nội','Cầu Giấy',['https://picsum.photos/seed/apt1a/800/600','https://picsum.photos/seed/apt1b/800/600'],'new',1],
  ['Nhà nguyên căn 3 tầng hẻm xe hơi Quận 3 cho thuê','4 phòng ngủ, 3 WC, 5x15m, hẻm thông thoáng. Gần chợ Tân Định, trung tâm thương mại.',18000000,1,'nha-rieng',1,'TP. Hồ Chí Minh','Quận 3',['https://picsum.photos/seed/house1a/800/600','https://picsum.photos/seed/house1b/800/600'],'new',1],
  ['Đất thổ cư 120m2 mặt đường Nguyễn Văn Linh Đà Nẵng','Lô đất 120m2 (6x20m), 100% thổ cư, mặt tiền đường lớn. Khu dân cư đông, thuận tiện kinh doanh.',3200000000,1,'dat',2,'Đà Nẵng','Hải Châu',['https://picsum.photos/seed/land1a/800/600'],'new',0],
  ['Phòng trọ cao cấp máy lạnh thang máy Đống Đa Hà Nội','25m2 cao cấp, WC riêng, máy lạnh, thang máy. An ninh 24/7, camera. Giá gồm internet, bãi xe.',3000000,0,'phong-tro',0,'Hà Nội','Đống Đa',['https://picsum.photos/seed/room1a/800/600','https://picsum.photos/seed/room1b/800/600'],'new',0],
  ['Căn hộ studio view biển Mỹ Khê cho thuê Đà Nẵng','Studio 28m2 mới xây 2023, view biển Mỹ Khê. Đủ nội thất: giường đôi, sofa, bếp điện, WC hiện đại.',7500000,0,'can-ho',2,'Đà Nẵng','Sơn Trà',['https://picsum.photos/seed/studio1a/800/600','https://picsum.photos/seed/studio1b/800/600'],'new',0],
  ['Nhà mặt phố Lê Thánh Tôn vị trí vàng Hải Phòng','5 tầng, 7 phòng ngủ, mặt tiền 5m. Thuận tiện kinh doanh mọi ngành.',15000000000,1,'nha-rieng',3,'Hải Phòng','Hồng Bàng',['https://picsum.photos/seed/shophouse1a/800/600'],'new',1],
  ['Văn phòng cho thuê tầng 8 tòa nhà hạng A Quận 1','200m2, full nội thất VP, 2 hướng view đẹp. Tòa nhà hạng A, 4 thang máy, bãi xe rộng.',45000000,1,'van-phong',1,'TP. Hồ Chí Minh','Quận 1',['https://picsum.photos/seed/office1a/800/600','https://picsum.photos/seed/office1b/800/600'],'new',0],
  ['Đất vườn 500m2 Phong Điền Cần Thơ giá rẻ','Mặt tiền đường bê tông 4m, cách TT TP 12km. Thích hợp xây nhà vườn, nghỉ dưỡng.',650000000,1,'dat',4,'Cần Thơ','Phong Điền',['https://picsum.photos/seed/garden1a/800/600'],'new',0],
  ['Biệt thự song lập Vinhomes Riverside Long Biên Hà Nội','280m2, 4PN, nội thất cao cấp nhập khẩu. Full tiện ích: hồ bơi, sân golf, TTTM.',35000000000,1,'nha-rieng',0,'Hà Nội','Long Biên',['https://picsum.photos/seed/villa1a/800/600','https://picsum.photos/seed/villa1b/800/600','https://picsum.photos/seed/villa1c/800/600'],'new',1],
  ['Phòng trọ 25m2 full nội thất Từ Liêm HN gần ĐH','Có ban công, WC riêng, bếp điện, tủ lạnh, máy giặt. An ninh đảm bảo, gần ĐH Thương mại.',2000000,0,'phong-tro',0,'Hà Nội','Từ Liêm',['https://picsum.photos/seed/miniapt1a/800/600'],'new',0],
  // XE CO
  ['Honda Wave Alpha 2022 chính chủ odo 3500km như mới','Màu đỏ đen, giấy tờ đầy đủ, không đâm đụng. Bảo dưỡng định kỳ đại lý.',15500000,1,'xe-may',0,'Hà Nội','Hoàng Mai',['https://picsum.photos/seed/wave1a/800/600','https://picsum.photos/seed/wave1b/800/600'],'used',0],
  ['Toyota Vios 1.5G 2020 odo 35.000km xe đẹp như mới','Bản G AT, màu bạc. Full lịch sử bảo dưỡng Toyota, không tai nạn, ngập nước.',475000000,1,'o-to',1,'TP. Hồ Chí Minh','Bình Thạnh',['https://picsum.photos/seed/vios1a/800/600','https://picsum.photos/seed/vios1b/800/600'],'used',1],
  ['Honda SH 150i ABS 2021 còn bảo hành biển số đẹp HN','Màu đen nhám, odo 8.000km. Còn bảo hành chính hãng, không hao nhớt. BS HN đẹp.',72000000,0,'xe-may',0,'Hà Nội','Cầu Giấy',['https://picsum.photos/seed/sh1a/800/600','https://picsum.photos/seed/sh1b/800/600'],'used',1],
  ['Ford Ranger Wildtrak 4x4 2019 full option odo 55.000km','AT, trắng ngọc trai. Camera 360, màn hình cảm ứng, đèn LED, ghế da cao cấp.',680000000,1,'o-to',3,'Hải Phòng','Hải An',['https://picsum.photos/seed/ranger1a/800/600','https://picsum.photos/seed/ranger1b/800/600'],'used',0],
  ['Xe đạp Giant ATX 810 2023 mới 100% chưa sử dụng','Khung nhôm, 21 tốc độ Shimano. Mới 100%, mua xong không đi, có hoá đơn.',5500000,0,'xe-dap',0,'Hà Nội','Hai Bà Trưng',['https://picsum.photos/seed/bike1a/800/600'],'new',0],
  ['Yamaha Exciter 155 VVA 2022 odo 12.000km chính chủ','Màu xanh đen, còn bảo hành. Giấy tờ đầy đủ.',46000000,1,'xe-may',1,'TP. Hồ Chí Minh','Quận 7',['https://picsum.photos/seed/exciter1a/800/600','https://picsum.photos/seed/exciter1b/800/600'],'used',0],
  ['Kia K5 2.0 Premium 2021 odo 20.000km bao test hãng','Màu đỏ đô. Sunroof, BLIS, camera 360, ghế da. Bao kiểm tra xe hãng.',880000000,1,'o-to',0,'Hà Nội','Thanh Xuân',['https://picsum.photos/seed/k51a/800/600','https://picsum.photos/seed/k51b/800/600'],'used',1],
  ['Honda Future 125 FI 2023 biển Cần Thơ mới 98%','Màu đỏ, odo 2.500km. Mới cứng, chính chủ, giấy tờ đủ.',33000000,0,'xe-may',4,'Cần Thơ','Ninh Kiều',['https://picsum.photos/seed/future1a/800/600'],'used',0],
  ['Mercedes C300 AMG 2019 full option nhập khẩu chính hãng','Đen, odo 45.000km. Nội thất kem, Burmester sound, sunroof.',1380000000,1,'o-to',1,'TP. Hồ Chí Minh','Quận 1',['https://picsum.photos/seed/merc1a/800/600','https://picsum.photos/seed/merc1b/800/600'],'used',1],
  ['Xe đạp điện DK Bike Belago 2 mới 100% màu trắng','Pin lithium 48V-12Ah, tốc độ max 40km/h, hành trình 60km/lần sạc.',7800000,0,'xe-dap',2,'Đà Nẵng','Thanh Khê',['https://picsum.photos/seed/ebike1a/800/600'],'new',0],
  // DIEN TU
  ['iPhone 15 Pro Max 256GB Natural Titanium Fullbox','Pin 100%, có AppleCare+. Mua tháng 10/2023, không trầy xước.',29000000,0,'dien-thoai',0,'Hà Nội','Hoàn Kiếm',['https://picsum.photos/seed/iphone1a/800/600','https://picsum.photos/seed/iphone1b/800/600'],'used',1],
  ['MacBook Air M2 2022 8GB 256GB Starlight còn BH Apple','Pin 100%, thân máy sạch, còn BH đến tháng 9/2025.',22000000,1,'may-tinh',1,'TP. Hồ Chí Minh','Quận 3',['https://picsum.photos/seed/mac1a/800/600','https://picsum.photos/seed/mac1b/800/600'],'used',1],
  ['Samsung Galaxy S24 Ultra 256GB Titanium Black Fullbox','Mới 99%, fullbox phụ kiện, S-Pen, camera 200MP.',24000000,0,'dien-thoai',2,'Đà Nẵng','Hải Châu',['https://picsum.photos/seed/s241a/800/600'],'used',0],
  ['Smart TV LG OLED C3 65 inch 4K 2023 mới 99%','webOS 23, Dolby Vision IQ, ThinQ AI. Còn BH 20 tháng.',22000000,1,'tivi',0,'Hà Nội','Đống Đa',['https://picsum.photos/seed/tv1a/800/600','https://picsum.photos/seed/tv1b/800/600'],'used',0],
  ['Máy lạnh Daikin 1.5HP Inverter 2023 còn bảo hành 18 tháng','Tiết kiệm điện, lọc không khí. Bao lắp đặt trong nội thành.',9500000,1,'dien-lanh',1,'TP. Hồ Chí Minh','Bình Thạnh',['https://picsum.photos/seed/ac1a/800/600'],'used',0],
  ['Laptop Dell XPS 15 9530 i7-13700H RTX4060 OLED 3.5K','16GB RAM, 512GB SSD. Phục vụ đồ họa, gaming nhẹ.',38000000,1,'may-tinh',0,'Hà Nội','Cầu Giấy',['https://picsum.photos/seed/laptop1a/800/600'],'used',0],
  ['Tủ lạnh Panasonic 380L 2 cửa Inverter mới 98%','Mua tháng 2/2024, ít dùng. Còn BH 23 tháng.',12000000,0,'dien-lanh',1,'TP. Hồ Chí Minh','Quận 10',['https://picsum.photos/seed/fridge1a/800/600'],'used',0],
  ['iPad Pro M2 12.9 inch WiFi 256GB kèm Apple Pencil 2','Pin 97%, máy đẹp. Kèm Magic Keyboard. Còn BH hãng.',21000000,1,'may-tinh',2,'Đà Nẵng','Hải Châu',['https://picsum.photos/seed/ipad1a/800/600'],'used',0],
  // NOI THAT
  ['Sofa da thật nhập khẩu Ý 3 chỗ + 2 đôn màu nâu','Khung gỗ tự nhiên, đệm mút cao su non 45kg/m3. Ít sử dụng.',18000000,1,'sofa',0,'Hà Nội','Tây Hồ',['https://picsum.photos/seed/sofa1a/800/600','https://picsum.photos/seed/sofa1b/800/600'],'used',0],
  ['Giường gỗ sồi Mỹ 1.8m có 4 hộc kéo MOHO','Đã dùng 1 năm, còn đẹp 90%. Thương hiệu MOHO cao cấp.',8500000,1,'giuong-tu',1,'TP. Hồ Chí Minh','Thủ Đức',['https://picsum.photos/seed/bed1a/800/600'],'used',0],
  ['Tủ bếp inox 304 chữ L 2.5m đã lắp đặt bán gấp','Nguyên tấm inox 304, tủ dưới + kệ trên. Còn rất đẹp.',12000000,1,'bep',2,'Đà Nẵng','Ngũ Hành Sơn',['https://picsum.photos/seed/kitchen1a/800/600'],'used',0],
  ['Bàn đứng Ergotron + ghế Herman Miller Aeron size B','Mua 2022, còn rất tốt. Lý tưởng cho dân văn phòng, developer.',15000000,1,'sofa',0,'Hà Nội','Hoàng Mai',['https://picsum.photos/seed/desk1a/800/600'],'used',0],
  ['Tủ quần áo 4 cánh gỗ MFC có gương soi toàn thân','2 cánh gương. Bản lề giảm chấn. KT: 2.0x0.55x2.2m.',5500000,0,'giuong-tu',1,'TP. Hồ Chí Minh','Gò Vấp',['https://picsum.photos/seed/wardrobe1a/800/600'],'used',0],
  // THU NUOI
  ['Corgi Pembroke thuần chủng 3 tháng đực vàng trắng','Có giấy tờ, tiêm đủ vaccine, tẩy giun. Bố mẹ đẹp chuẩn giống.',5500000,0,'cho',0,'Hà Nội','Hai Bà Trưng',['https://picsum.photos/seed/corgi1a/800/600','https://picsum.photos/seed/corgi1b/800/600'],'new',0],
  ['Mèo Anh lông ngắn xanh cái 4 tháng đã tiêm vaccine','Nặng 1.2kg, mắt vàng, lông xanh xám. Ăn tốt, thân thiện.',3800000,0,'meo',1,'TP. Hồ Chí Minh','Quận 5',['https://picsum.photos/seed/cat1a/800/600','https://picsum.photos/seed/cat1b/800/600'],'new',0],
  ['Vẹt Cockatiel đã thuần 8 tháng tuổi biết hót','Thuần, thân thiện với người. Kèm lồng và thức ăn 1 tháng.',900000,1,'chim-ca',2,'Đà Nẵng','Hải Châu',['https://picsum.photos/seed/bird1a/800/600'],'new',0],
  ['Hamster Teddy Bear 2 tháng tuổi kèm lồng + bánh xe','Trắng xám xinh xắn, khoẻ mạnh. Kèm lồng nhựa + bánh xe chạy.',250000,0,'chim-ca',0,'Hà Nội','Cầu Giấy',['https://picsum.photos/seed/hamster1a/800/600'],'new',0],
  ['Cá Koi Nhật dòng Kohaku 40cm màu trắng đỏ chuẩn','Nhập Nhật, màu sắc đẹp, khoẻ mạnh. Bao thùng xốp vận chuyển.',2500000,1,'chim-ca',1,'TP. Hồ Chí Minh','Bình Chánh',['https://picsum.photos/seed/fish1a/800/600'],'new',0],
  // CA NHAN
  ['Áo khoác da nam hàng xuất khẩu size XL màu đen','Da bò thật, lót lông ấm. Mặc vài lần, còn đẹp 95%.',550000,1,'quan-ao-nam',0,'Hà Nội','Hoàn Kiếm',['https://picsum.photos/seed/jacket1a/800/600'],'used',0],
  ['Túi Gucci Marmont GG Medium chính hãng fullbox','Mua tại Hàn Quốc có hoá đơn. Màu đen, ít dùng.',15000000,1,'quan-ao-nu',1,'TP. Hồ Chí Minh','Quận 1',['https://picsum.photos/seed/gucci1a/800/600','https://picsum.photos/seed/gucci1b/800/600'],'used',0],
  ['Đồng hồ Seiko 5 Sports SRPD63K1 chính hãng full set','Mua 2022, còn mới 98%. Kính sapphire, chống nước 100m.',3500000,0,'dong-ho',2,'Đà Nẵng','Hải Châu',['https://picsum.photos/seed/watch1a/800/600'],'used',0],
  ['Giày Nike Air Force 1 07 Low triple white size 42','Mới 100%, fullbox. Mua Sneaker VN, không vừa.',950000,0,'giay-dep',0,'Hà Nội','Cầu Giấy',['https://picsum.photos/seed/shoe1a/800/600'],'new',0],
  // THE THAO
  ['Bộ tạ đơn tổng 50kg + giá để tạ chắc chắn','Tạ gang chất lượng. Ít dùng, bán gấp.',1500000,1,'the-thao',0,'Hà Nội','Hà Đông',['https://picsum.photos/seed/gym1a/800/600'],'used',0],
  ['Vợt cầu lông Yonex Nanoflare 001 Feel chính hãng','Còn mới 90%, mua tại cửa hàng uỷ quyền. Kèm hộp.',1900000,0,'the-thao',1,'TP. Hồ Chí Minh','Quận Tân Bình',['https://picsum.photos/seed/badminton1a/800/600'],'used',0],
  ['Xe đạp leo núi Trek Marlin 7 2022 size M','Shimano Alivio 2x9, fork SR Suntour. Đi 500km, còn đẹp.',9500000,1,'the-thao',2,'Đà Nẵng','Liên Chiểu',['https://picsum.photos/seed/mtb1a/800/600'],'used',0],
  ['Lều cắm trại 4 người chống nước Coleman Sundome','2 phòng, dựng dễ, chống gió mưa tốt. Dùng 3 lần.',2000000,0,'the-thao',0,'Hà Nội','Đống Đa',['https://picsum.photos/seed/tent1a/800/600'],'used',0],
  // VIEC LAM
  ['Tuyển nhân viên kinh doanh BĐS lương 15-30tr tháng','Không yêu cầu kinh nghiệm, được đào tạo. Thu nhập không giới hạn theo hoa hồng.',15000000,0,'viec-lam',1,'Hà Nội','Cầu Giấy',['https://picsum.photos/seed/job1a/800/600'],'new',0],
  ['Cần tuyển kế toán tổng hợp lương 10-14tr Quận 3','Yêu cầu 2 năm kinh nghiệm, thành thạo Excel, MISA.',10000000,0,'viec-lam',1,'TP. Hồ Chí Minh','Quận 3',['https://picsum.photos/seed/job2a/800/600'],'new',0],
  ['Tuyển lập trình viên Frontend ReactJS lương 18-30tr','Senior/Mid-level. ReactJS, TypeScript, Git. Làm việc hybrid.',20000000,0,'viec-lam',2,'Đà Nẵng','Hải Châu',['https://picsum.photos/seed/job3a/800/600'],'new',1],
  ['Tuyển shipper part-time giao hàng Hà Nội 300k/ngày','Ca tối 18h-22h. Có xe máy, GPLX. Thu nhập thực tế 8-10tr/tháng.',8000000,0,'viec-lam',0,'Hà Nội','Hoàng Mai',['https://picsum.photos/seed/job4a/800/600'],'new',0],
  // DICH VU
  ['Sửa điện lạnh điều hoà tại nhà Hà Nội uy tín','Thợ chuyên 10 năm kinh nghiệm. Bảo hành 3 tháng. Gọi là có mặt trong 2h.',200000,0,'dich-vu',0,'Hà Nội','Đống Đa',['https://picsum.photos/seed/service1a/800/600'],'new',0],
  ['Dọn dẹp nhà theo giờ vệ sinh công nghiệp HCM','50k/giờ, nhân viên được đào tạo, mang theo dụng cụ. Đặt lịch trước 2h.',50000,0,'dich-vu',1,'TP. Hồ Chí Minh','Quận Bình Thạnh',['https://picsum.photos/seed/service2a/800/600'],'new',0],
  ['Chụp ảnh cưới trọn gói tại Đà Nẵng giá rẻ','Bao gồm: 8h chụp ngoại cảnh + album + USB ảnh gốc. Phong cách hiện đại.',5000000,1,'dich-vu',2,'Đà Nẵng','Sơn Trà',['https://picsum.photos/seed/photo1a/800/600','https://picsum.photos/seed/photo1b/800/600'],'new',0],
  // CHO TANG
  ['Cho tặng quần áo trẻ em size 1-3 tuổi 20 bộ','Còn rất đẹp, con không mặc nữa. Ai cần liên hệ lấy trực tiếp.',0,0,'cho-tang',0,'Hà Nội','Từ Liêm',['https://picsum.photos/seed/free1a/800/600'],'used',0],
  ['Cho tặng tủ gỗ cũ ai cần tự đến lấy HCM','Tủ 2 cánh gỗ còn dùng được. Tự thu xếp vận chuyển, không giao tận nơi.',0,0,'cho-tang',1,'TP. Hồ Chí Minh','Quận 9',['https://picsum.photos/seed/free2a/800/600'],'used',0],
  // ME BE
  ['Xe đẩy em bé Chicco Activ3 Air màu đen còn BH','Dùng 6 tháng, còn BH 18 tháng. Bánh bơm, có lắp ghế ngồi.',3500000,1,'me-be',3,'Hải Phòng','Lê Chân',['https://picsum.photos/seed/baby1a/800/600'],'used',0],
  ['Bộ quần áo sơ sinh 0-12 tháng 15 bộ mới 99%','Vải cotton thoáng mát, ít dùng, còn rất đẹp.',350000,0,'me-be',4,'Cần Thơ','Ninh Kiều',['https://picsum.photos/seed/baby2a/800/600'],'used',0],
];

for (const [title,desc,price,neg,catSlug,uidx,province,district,imgsArr,cond,feat] of listings) {
  ins.run(title, desc, price, neg, ids[catSlug], uids[uidx], province, district, JSON.stringify(imgsArr), cond, feat);
}

console.log(`✅ Seeded: ${users.length} users, ${parents.length+subs.length} categories, ${listings.length} listings`);
db.close();
