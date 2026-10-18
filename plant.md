# TÀI LIỆU KỸ THUẬT DỰ ÁN: MÔ ĐUN TUYÊN TRUYỀN VÀ GÂY QUỸ CỘNG ĐỒNG - HAUI

## 1. Giới thiệu tổng quan

Hệ thống quản lý tuyên truyền hoàn cảnh khó khăn và gây quỹ cộng đồng (Crowdfunding) phục vụ cho sinh viên, giảng viên và ban quản trị trường Đại học Công nghiệp Hà Nội (HaUI). Dự án cung cấp nền tảng để đăng tải các hoàn cảnh cần giúp đỡ, thực hiện quyên góp trực tuyến, theo dõi tiến độ thời gian thực và đảm bảo tính minh bạch tài chính.

## 2. Cấu trúc thư mục dự án (Project Structure)

Dựa trên cấu trúc thư mục chuẩn của dự án full-stack Node.js (Backend) kết hợp React Vite (Frontend):

```
Backen-ttcsn/
├── frontend/                     # Thư mục chứa mã nguồn ReactJS (Vite)
│   ├── node_modules/             # Thư viện phụ thuộc phía Client
│   ├── public/                   # Tài nguyên tĩnh công khai (favicon, images...)
│   ├── src/                      # Mã nguồn chính của Front-end
│   │   ├── assets/               # Hình ảnh, icon, file style thô
│   │   ├── App.css               # Style chung của ứng dụng
│   │   ├── App.jsx               # Component gốc điều phối giao diện & Router
│   │   ├── index.css             # Thiết lập CSS toàn cục
│   │   └── main.jsx              # Điểm khởi chạy React DOM root
│   ├── .eslintrc.cjs             # Cấu hình kiểm tra lỗi code (ESLint)
│   ├── .gitignore                # Các file/thư mục bỏ qua khi commit git
│   ├── index.html                # Template HTML chính
│   ├── package-lock.json         # Khóa phiên bản gói thư viện FE
│   ├── package.json              # Khai báo cấu hình và dependencies FE
│   ├── README.md                 # Tài liệu hướng dẫn Front-end
│   └── vite.config.js            # Cấu hình trình biên dịch Vite
│
├── node_modules/                 # Thư viện phụ thuộc phía Server
├── src/                          # Mã nguồn chính của Back-end (Node.js / Express)
│   ├── config/                   # Cấu hình hệ thống (Kết nối MySQL, biến môi trường)
│   ├── controllers/              # Xơ đồ xử lý logic nghiệp vụ (Request/Response handler)
│   ├── models/                   # Tương tác cơ sở dữ liệu (MySQL queries / ORM models)
│   ├── routes/                   # Định nghĩa các API endpoints theo resource
│   └── utils/                    # Các hàm tiện ích dùng chung (Gửi email, mã hóa, xử lý ảnh)
├── server.js                     # File khởi chạy ứng dụng Express Server chính
├── .env                          # Biến môi trường bảo mật (DB config, JWT secret, Mailer)
├── .gitignore                    # Các file/thư mục bỏ qua khi commit git
├── package-lock.json             # Khóa phiên bản gói thư viện BE
├── package.json                  # Khai báo cấu hình và dependencies BE
└── README.md                     # Tài liệu tổng quan dự án Back-end

```

### Chức năng chi tiết của từng thư mục:

#### A. Front-end (`frontend/src/`)

* **`assets/`**: Lưu trữ các file hình ảnh minh họa, logo HaUI, icon tĩnh phục vụ giao diện.

* **`App.jsx`**: Quản lý cấu trúc định tuyến (React Router) phân chia các trang (Trang chủ, Chi tiết chiến dịch, Trang cá nhân, Trang quản trị Admin).

* **`main.jsx`**: Điểm neo kết nối React App vào DOM của file `index.html`.

* **`App.css` / `index.css`**: Định nghĩa style giao diện, màu sắc chủ đạo và layout của ứng dụng.

#### B. Back-end (`src/`)

* **`config/`**: Chứa các file thiết lập kết nối cơ sở dữ liệu MySQL (`db.js`) và cấu hình các dịch vụ tích hợp.

* **`controllers/`**: Nơi viết toàn bộ code logic xử lý chính: nhận request từ route, gọi model lấy dữ liệu, xử lý nghiệp vụ (ví dụ: tính toán tiến độ tiền quỹ, xử lý logic đăng nhập) và trả về JSON cho client.

* **`models/`**: Tương tác trực tiếp với cơ sở dữ liệu MySQL (thực thi câu lệnh SQL hoặc ORM) cho từng đối tượng (Users, Campaigns, Donations...).

* **`routes/`**: Định nghĩa các đường dẫn API endpoint và gắn middleware xác thực trước khi trỏ tới Controller tương ứng.

* **`utils/`**: Các hàm hỗ trợ độc lập như cấu hình Nodemailer gửi email xác nhận, cấu hình mã hóa mật khẩu `bcryptjs`, hoặc thiết lập kết nối Socket.io theo thời gian thực.

## 3. Danh sách Thư viện sử dụng (Dependencies)

### A. Front-end Dependencies (`frontend/package.json`)

```
{
  "dependencies": {
    "axios": "1.6.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-router-dom": "6.3.0",
    "react-toastify": "9.1.3",
    "socket.io-client": "4.8.3"
  },
  "devDependencies": {
    "@types/react": "18.2.15",
    "@types/react-dom": "18.2.7",
    "@vitejs/plugin-react": "4.0.3",
    "eslint": "8.45.0",
    "eslint-plugin-react": "7.32.2",
    "eslint-plugin-react-hooks": "4.6.0",
    "eslint-plugin-react-refresh": "0.4.3",
    "vite": "4.4.5"
  }
}

```

### B. Back-end Dependencies (`package.json`)

```
{
  "dependencies": {
    "bcryptjs": "3.0.3",
    "dotenv": "16.0.3",
    "express": "4.18.2",
    "jsonwebtoken": "9.0.3",
    "mysql2": "2.3.3",
    "nodemailer": "8.0.7",
    "socket.io": "4.8.3"
  },
  "devDependencies": {
    "concurrently": "7.6.0",
    "nodemon": "2.0.20"
  }
}

```

## 4. Thiết kế Cơ sở dữ liệu (Dựa trên ERD)

Hệ thống sử dụng cơ sở dữ liệu quan hệ MySQL gồm các bảng cốt lõi sau:

1. **`Users` (Người dùng):**

   * `user_id` (PK, BIGINT, Auto Increment)

   * `full_name` (VARCHAR 100)

   * `email` (VARCHAR 100, Unique - ưu tiên email `@haui.edu.vn`)

   * `password_hash` (VARCHAR 255)

   * `phone_number` (VARCHAR 15)

   * `avatar_url` (VARCHAR 255)

   * `role` (ENUM: 'STUDENT', 'LECTURER', 'CAMPAIGN_MANAGER', 'ADMIN')

   * `created_at` (TIMESTAMP)

2. **`Categories` (Danh mục chiến dịch):**

   * `category_id` (PK, INT, Auto Increment)

   * `name` (VARCHAR 100)

   * `description` (TEXT)

3. **`Campaigns` (Chiến dịch gây quỹ / Tuyên truyền):**

   * `campaign_id` (PK, BIGINT, Auto Increment)

   * `title` (VARCHAR 255)

   * `slug` (VARCHAR 255)

   * `description` (TEXT)

   * `content` (LONGTEXT)

   * `target_amount` (DECIMAL 15,2) - Mục tiêu quỹ

   * `current_amount` (DECIMAL 15,2) - Số tiền đã nhận thực tế

   * `thumbnail_url` (VARCHAR 255)

   * `status` (ENUM: 'PENDING', 'ACTIVE', 'COMPLETED', 'CLOSED')

   * `start_date` (TIMESTAMP), `end_date` (TIMESTAMP)

   * `category_id` (FK -> `Categories.category_id`)

   * `created_by` (FK -> `Users.user_id`)

   * `created_at` (TIMESTAMP)

4. **`Donations` (Lịch sử quyên góp):**

   * `donation_id` (PK, BIGINT, Auto Increment)

   * `campaign_id` (FK -> `Campaigns.campaign_id`)

   * `user_id` (FK -> `Users.user_id`, Nullable nếu ủng hộ ẩn danh)

   * `donor_name` (VARCHAR 100)

   * `amount` (DECIMAL 15,2)

   * `message` (TEXT)

   * `payment_method` (ENUM: 'MOMO', 'VNPAY', 'BANK_TRANSFER')

   * `transaction_code` (VARCHAR 100)

   * `status` (ENUM: 'PENDING', 'SUCCESS', 'FAILED')

   * `is_anonymous` (BOOLEAN)

   * `created_at` (TIMESTAMP)

5. **`Disbursements` (Giải ngân minh bạch tài chính):**

   * `disbursement_id` (PK, BIGINT, Auto Increment)

   * `campaign_id` (FK -> `Campaigns.campaign_id`)

   * `amount` (DECIMAL 15,2)

   * `proof_image_url` (VARCHAR 255) - Ảnh chụp biên nhận / sao kê

   * `note` (TEXT)

   * `created_by` (FK -> `Users.user_id`)

   * `created_at` (TIMESTAMP)

6. **`Likes` (Tương tác bài viết - Phase 2):**

   * `like_id` (PK, BIGINT)

   * `user_id` (FK -> `Users.user_id`)

   * `campaign_id` (FK -> `Campaigns.campaign_id`)

7. **`Badges` & `User_Badges` (Huy hiệu vinh danh nhà hảo tâm - Phase 2):**

   * Quản lý danh hiệu khi người dùng đóng góp đạt mốc nhất định.

8. **`Notifications` (Hệ thống thông báo - Phase 2):**


   * Lưu thông báo gửi tới người dùng khi có biến động quỹ hoặc tin tức mới.

## 5. Danh sách API Endpoints cốt lõi (Backend Routes)

### A. Auth Routes (`/api/auth`)

* `POST /api/auth/register`: Đăng ký tài khoản mới (sinh viên/giảng viên).

* `POST /api/auth/login`: Đăng nhập hệ thống, trả về JWT Token.

* `GET /api/auth/profile`: Lấy thông tin chi tiết tài khoản hiện tại (Yêu cầu Token).

### B. Campaign Routes (`/api/campaigns`)

* `GET /api/campaigns`: Lấy danh sách toàn bộ chiến dịch (Hỗ trợ phân trang, lọc theo danh mục, trạng thái).

* `GET /api/campaigns/:id`: Xem chi tiết nội dung tuyên truyền và tiến độ một chiến dịch.

* `POST /api/campaigns`: Tạo mới một chiến dịch gây quỹ (Dành cho Admin/Quản lý).

* `PUT /api/campaigns/:id`: Cập nhật thông tin chiến dịch.

* `PATCH /api/campaigns/:id/status`: Duyệt hoặc đóng chiến dịch (Dành cho Admin).

### C. Donation Routes (`/api/donations`)

* `POST /api/donations`: Tạo một yêu cầu quyên góp mới (gửi kèm số tiền, mã giao dịch/bill chuyển khoản).

* `GET /api/campaigns/:campaign_id/donations`: Lấy danh sách nhà hảo tâm đã ủng hộ cho một chiến dịch cụ thể.

* `GET /api/users/me/donations`: Xem lịch sử đóng góp cá nhân của người dùng đăng nhập.

### D. Disbursement Routes (`/api/disbursements`)

* `POST /api/disbursements`: Thêm chứng từ giải ngân quỹ (tải lên ảnh biên nhận thực tế).

* `GET /api/campaigns/:campaign_id/disbursements`: Xem lịch sử giải ngân minh bạch tài chính của chiến dịch.

## 6. Biểu đồ luồng hoạt động (Activity Flow / Logic Workflow)

### 6.1. Luồng Xác thực người dùng (Authentication & Authorization Flow)
* **Chức năng:** Đăng nhập hệ thống và phân quyền truy cập các chức năng bảo mật.
1. **Bước 1 (Client):** Người dùng nhập `Email` và `Password` trên giao diện Đăng nhập (`/login`).
2. **Bước 2 (Client Validation):** Frontend kiểm tra cú pháp email (bắt buộc đúng định dạng/đuôi HaUI) trước khi gửi `POST /api/auth/login`.
3. **Bước 3 (Server Verification):** 
   * Server tìm kiếm thông tin tài khoản trong cơ sở dữ liệu MySQL theo `email`.
   * So sánh mật khẩu nhập vào với `password_hash` trong DB bằng thư viện `bcryptjs`.
4. **Bước 4 (Token Generation):** 
   * Nếu thành công: Server tạo mã `JWT Token` (chứa `user_id`, `email`, `role`) có thời hạn sử dụng và trả về Client.
   * Nếu thất bại: Trả về lỗi `401 Unauthorized` (Tài khoản hoặc mật khẩu không chính xác).
5. **Bước 5 (Client Storage & Auth Context):** 
   * Client lưu `JWT Token` vào `localStorage` hoặc `Cookie`.
   * Đính kèm Header `Authorization: Bearer <Token>` cho tất cả các request bảo mật tiếp theo.

---

### 6.2. Luồng Tạo & Duyệt chiến dịch gây quỹ (Campaign Creation & Approval Flow)
* **Chức năng:** Quản lý đăng tải thông tin tuyên truyền hoàn cảnh khó khăn và kiểm duyệt trước khi công khai.
1. **Bước 1 (Client - Campaign Manager):** Ban quản lý/Đoàn trường nhập thông tin chiến dịch (Tiêu đề, Mô tả, Bài viết chi tiết, Mục tiêu số tiền, Hạn gây quỹ, Thumbnail) và bấm "Gửi kiểm duyệt".
2. **Bước 2 (Server Processing):** 
   * Middleware kiểm tra `JWT Token` và `role` của tài khoản (yêu cầu quyền `CAMPAIGN_MANAGER` hoặc `ADMIN`).
   * Kiểm tra tính hợp lệ của dữ liệu đầu vào.
   * Lưu thông tin chiến dịch vào bảng `Campaigns` với trạng thái mặc định `status = 'PENDING'`.
3. **Bước 3 (Admin Review):**
   * Quản trị viên (Admin) truy cập trang Dashboard Quản trị (`/admin/campaigns`), xem danh sách các chiến dịch đang ở trạng thái `PENDING`.
   * Admin bấm "Duyệt" (`PATCH /api/campaigns/:id/status` với body `{ status: 'ACTIVE' }`) hoặc "Từ chối" (`{ status: 'CLOSED' }`).
4. **Bước 4 (Publication):**
   * Chiến dịch được chuyển sang trạng thái `ACTIVE` sẽ tự động xuất hiện trên trang chủ để toàn thể sinh viên/giảng viên có thể xem và đóng góp.

---

### 6.3. Luồng Quyên góp & Cập nhật thời gian thực (Donation Flow)
* **Chức năng:** Thực hiện ủng hộ tài chính và cập nhật số tiền nhận được lập tức qua Socket.io.
1. **Bước 1 (Client):** Người dùng truy cập trang chi tiết chiến dịch (`/campaigns/:id`), nhập số tiền muốn ủng hộ, lời nhắn, chọn ẩn danh (nếu muốn) và quét mã QR chuyển khoản.
2. **Bước 2 (Client):** Bấm nút "Xác nhận đã chuyển khoản" kèm mã giao dịch. Frontend gửi request `POST /api/donations` lên Backend.
3. **Bước 3 (Server):**
   * Backend tiếp nhận dữ liệu, ghi bản ghi mới vào bảng `Donations` với trạng thái `SUCCESS` (hoặc `PENDING` nếu xác thực thủ công).
   * Cập nhật cộng dồn số tiền ủng hộ vào cột `current_amount` của bảng `Campaigns`.
4. **Bước 4 (Real-time Socket.io):**
   * Server phát sự kiện WebSocket (`io.emit('update_progress', { campaign_id, current_amount, new_donation })`) tới toàn bộ các Client đang mở trang chiến dịch đó.
   * Trang web phía Client nhận dữ liệu và tự động tăng giá trị tiến độ trên thanh `Progress Bar` mà không cần F5.
5. **Bước 5 (Email Notification):** Server sử dụng `Nodemailer` gửi email xác nhận và thư cảm ơn tự động tới địa chỉ email của người đóng góp.

---

### 6.4. Luồng Giải ngân & Cập nhật sao kê minh bạch (Disbursement & Transparency Flow)
* **Chức năng:** Cập nhật bằng chứng chi tiêu/sao kê tiền quỹ đã được trao tới hoàn cảnh khó khăn.
1. **Bước 1 (Client - Admin/Manager):** Ban quản trị tải lên hình ảnh biên nhận, hóa đơn hoặc ảnh chụp trao quà thực tế, kèm số tiền giải ngân và ghi chú nội dung.
2. **Bước 2 (Server Processing):**
   * Server thực thi request `POST /api/disbursements`.
   * Kiểm tra xem số tiền giải ngân có hợp lệ (nhỏ hơn hoặc bằng số tiền quỹ hiện có `current_amount` của chiến dịch) hay không.
   * Ghi nhận dữ liệu vào bảng `Disbursements`.
3. **Bước 3 (Public Transparency View):**
   * Dữ liệu giải ngân được liên kết trực tiếp với chiến dịch tương ứng (`campaign_id`).
   * Người dùng công khai có thể chuyển sang tab "Minh bạch tài chính / Giải ngân" trên trang chi tiết chiến dịch để xem danh sách toàn bộ các đợt giải ngân kèm ảnh bằng chứng rõ ràng.


## 7. YÊU CẦU KỸ THUẬT & TÍNH NĂNG BỔ SUNG

1. Middleware bảo mật & Xác thực:
   - Tạo verifyToken middleware để kiểm tra JWT Header Authorization: Bearer <token>.
   - Tạo verifyRole() để phân quyền truy cập endpoint.

2. Xử lý Real-time với Socket.io:
   - Kết nối Socket.io ở server.js.


3. Gửi Email tự động (Nodemailer):


4. Xử lý Transaction Database:
   - cần sử dụng MySQL Transaction (connection.beginTransaction(), commit(), rollback()) để đảm bảo tính toàn vẹn dữ liệu.

### Cấu hình triển khai
- Sao chép `.env.example` thành `.env` và cấu hình MySQL, JWT, SMTP cùng `PAYMENT_WEBHOOK_SECRET`.
- Áp dụng migration `database/migrations/001_appointment_email_reminders.sql` trước khi bật `ENABLE_APPOINTMENT_REMINDERS=true`.
- Webhook thanh toán nhận chữ ký HMAC-SHA256 của raw request body qua header `X-Payment-Signature`.
- Socket.io xác thực token qua `auth.token`; các sự kiện lịch hẹn là `appointment:new` và `appointment:status`.
- Truy vấn SQL và thao tác persistence nằm trong `src/models/`; controllers xử lý HTTP, kiểm tra nghiệp vụ và điều phối transaction qua model.

## 8. các tính năng
1. Feature 1: Authorization (Xác thực tài khoản / Đăng nhập, đăng ký)   
2. Feature 2: List of fundraisers (Hiển thị danh sách các chiến dịch gây quỹ)   
3. Feature 3: Profile (Trang thông tin hồ sơ cá nhân)   
4. Feature 4: Search (Tính năng tìm kiếm chiến dịch)   
5. Feature 5: Track the progress (Theo dõi tiến độ thời gian thực của chiến dịch)   
6. Feature 6: Badges (Huy hiệu thành tích / Người ủng hộ tích cực)   
7. Feature 7: Notifications (Hệ thống gửi thông báo)   
8. Feature 8: Donations (Thực hiện giao dịch quyên góp/ủng hộ)   
9. Feature 9: Like (Thả tim hoặc thích bài viết/chiến dịch)   
10. Feature 10: Fundraiser goal (Thiết lập mục tiêu số tiền gây quỹ)   
11. Feature 11: Withdraw funds (Rút tiền từ quỹ của chiến dịch)   