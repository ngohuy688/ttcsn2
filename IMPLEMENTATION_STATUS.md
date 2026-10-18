# Tổng hợp tiến độ dự án HaUI Crowdfunding

Cập nhật: 2026-10-18

## Những phần đã thực hiện

- Xây dựng frontend React/Vite và backend Express cho quy trình gây quỹ HaUI.
- Thêm đăng nhập JWT và phân quyền cho Quản lý chiến dịch/Admin.
- Thêm API danh sách/chi tiết/tạo/cập nhật chiến dịch, duyệt trạng thái, quyên góp và giải ngân.
- Tách truy vấn SQL/persistence vào các model trong `src/models/`; controller không còn giữ cache trong bộ nhớ hay gọi SQL trực tiếp.
- Kết nối frontend tới backend tại `http://localhost:8081`; địa chỉ mặc định của Vite là `http://localhost:5173/`.
- Cấu hình MySQL `tuthienhaui`, tự khởi tạo schema, charset UTF-8 và dữ liệu ban đầu.
- Lưu người dùng, chiến dịch, quyên góp và giải ngân trong MySQL.
- Thêm trang tạo chiến dịch có phân quyền và gửi chiến dịch ở trạng thái chờ duyệt.
- Tách từng trang frontend thành module riêng trong `frontend/src/pages/`; `App.jsx` chỉ giữ router và trạng thái dùng chung. Header nằm riêng ở `frontend/src/components/AppHeader.jsx`; đăng nhập và đăng ký có route/trang riêng (`/login`, `/register`) và dùng chung thành phần form nhỏ.
- Điều chỉnh trải nghiệm gây quỹ theo các mẫu UX phổ biến: lời kêu gọi rõ ràng, thanh tiến độ có ngữ nghĩa hỗ trợ truy cập, CTA ủng hộ trên thẻ và trang chiến dịch, cùng bảng màu xanh lá riêng của HaUI Care; không sao chép thương hiệu/tài sản GoFundMe.
- Tạo trang tìm kiếm chiến dịch riêng tại `/search` với khu vực tìm kiếm, trạng thái kết quả/trống, thẻ chiến dịch và CTA; chỉ truy vấn từ khóa sau khi người dùng nhấn “Tìm kiếm” hoặc Enter.
- Nối Socket.IO ở trang chi tiết để nhận cập nhật tiến độ quyên góp theo thời gian thực.
- Hiển thị lịch sử quyên góp và các đợt giải ngân/chứng từ trên trang chi tiết.
- Chỉ hiển thị chiến dịch `ACTIVE` trên trang chủ và từ chối quyên góp vào chiến dịch chưa được duyệt/đã đóng.
- Ghi nhận quyên góp và cập nhật tổng tiền trong transaction; khóa hàng chiến dịch để tránh ghi nhận đua.
- Chặn giải ngân vượt số dư khả dụng (tổng quyên góp trừ tổng đã giải ngân) trong transaction.
- Loại bỏ store/cache đồng bộ toàn bộ bảng trong RAM; model đọc/ghi trực tiếp MySQL theo từng thao tác.

## Đối chiếu với `plant.md`

| Yêu cầu | Hiện trạng |
| --- | --- |
| Users, categories, campaigns, donations, disbursements, likes | Các bảng lõi được tạo; badges/notifications thuộc Phase 2 chưa làm. |
| Đăng ký/đăng nhập/profile và miền email HaUI | Backend kiểm tra miền email HaUI; frontend có trang riêng `/login`, `/register` và `/profile`. Tự đăng ký chỉ có vai trò STUDENT/LECTURER. |
| Tạo/duyệt chiến dịch | Có API, màn hình tạo dành cho Quản lý/Admin và màn hình duyệt Admin. |
| Quyên góp/lịch sử cá nhân | Có form quyên góp; API và trang hồ sơ hiển thị lịch sử cá nhân kèm tên chiến dịch. |
| Cập nhật thời gian thực | Trang chi tiết tham gia room Socket.IO và nhận sự kiện cập nhật tiền/quyên góp mới. |
| Minh bạch quyên góp/giải ngân | Trang chi tiết hiển thị danh sách nhà hảo tâm và chứng từ giải ngân. |
| Kiểm tra ngân sách giải ngân | Đã kiểm tra số dư khả dụng và ghi nhận trong transaction. |
| Email xác nhận quyên góp | Chưa có luồng gửi; SMTP hiện chỉ có biến cấu hình mẫu, chưa được cấu hình. |
| Xác thực thanh toán | Mã giao dịch hiện được ghi nhận trực tiếp; chưa xác minh qua cổng thanh toán/webhook. |
| Các bổ sung ở mục 7 | Truy vấn/persistence và transaction liên quan đã được đưa vào model. Các mục về doctor/patient, lịch hẹn khám, QR lịch khám và email nhắc lịch không thuộc nghiệp vụ crowdfunding hiện tại nên chưa triển khai. |

## Đối chiếu mục 8 — Các tính năng

| # | Tính năng trong `plant.md` | Mức độ | Hiện trạng |
| --- | --- | --- | --- |
| 1 | Authorization: đăng nhập/đăng ký | Có | Frontend có trang riêng `/login` và `/register`; backend cấp JWT, kiểm tra miền email HaUI và chỉ cho phép tự đăng ký STUDENT/LECTURER. |
| 2 | List of fundraisers | Có | Trang chủ lấy danh sách chiến dịch `ACTIVE` từ API, hiển thị tiến độ và CTA xem câu chuyện/ủng hộ trên từng thẻ. |
| 3 | Profile | Có | Có mục Hồ sơ trên thanh điều hướng; trang riêng tải thông tin tài khoản và lịch sử quyên góp qua API có xác thực. |
| 4 | Search | Có | Trang `/search` tìm theo tên/mô tả/nội dung; chỉ gửi truy vấn khi submit bằng nút “Tìm kiếm” hoặc Enter. API tìm kiếm trong MySQL, kết hợp được với status/category và phân trang. |
| 5 | Track the progress | Có | Trang chi tiết đăng ký Socket.IO theo campaign và cập nhật số tiền/quyên góp mới theo thời gian thực. |
| 6 | Badges | Chưa có | Chưa có bảng/model/API hoặc giao diện huy hiệu thành tích. |
| 7 | Notifications | Chưa có | Chưa có hệ thống thông báo cho người dùng. Sự kiện cập nhật tiến độ Socket.IO hiện chỉ cập nhật trang chiến dịch, không phải hộp thông báo/inbox. |
| 8 | Donations | Có, với giới hạn | Có form quyên góp, lưu MySQL và cập nhật tổng tiền. Hiện mã giao dịch gửi từ client được ghi nhận thành công mà chưa xác minh với nhà cung cấp thanh toán. |
| 9 | Like | Chưa hoàn chỉnh | Có bảng `likes` trong khởi tạo schema, nhưng chưa có model/API để thích/bỏ thích, cũng chưa có điều khiển trên giao diện. |
| 10 | Fundraiser goal | Có | Có trường mục tiêu `target_amount`, form tạo chiến dịch cho nhập mục tiêu và giao diện hiển thị tiến độ so với mục tiêu. |
| 11 | Withdraw funds | Một phần | Backend ghi nhận chứng từ giải ngân và giới hạn tổng giải ngân không vượt số tiền đã quyên góp. Chưa tích hợp chuyển tiền/rút tiền thực tế hoặc quy trình phê duyệt thanh toán. |

## Kiểm tra

- `npm run build --prefix frontend`: thành công.
- `npm run lint --prefix frontend`: thành công.
- `node --check` cho các module backend vừa sửa: thành công.
- Tìm kiếm MySQL theo từ khóa tiếng Việt trả đúng chiến dịch; chuỗi không khớp và ký tự `%` literal không trả kết quả.
- API profile/history: request chưa đăng nhập nhận 401; sau login, profile và lịch sử đều trả 200.
- Kiểm tra API trên MySQL cục bộ: đăng nhập Admin và lấy chiến dịch/lịch sử thành công; trang chủ chỉ nhận chiến dịch `ACTIVE`.
- Quyên góp cho chiến dịch đang chờ duyệt và giải ngân vượt số dư đều nhận HTTP 400, không tạo bản ghi mới.
- Đối chiếu mục 8 dựa trên route, controller/model và component frontend hiện có.

## Việc còn lại

- Làm badges, notifications và like theo phạm vi cần thiết.
- Nếu “Withdraw funds” yêu cầu chuyển tiền thực tế, cần xác định nhà cung cấp thanh toán và quy trình kiểm soát/duyệt trước khi tích hợp.
- Tích hợp gửi email xác nhận sau khi cấu hình SMTP.
- Tích hợp xác minh thanh toán thực tế/webhook; không coi mã giao dịch do client gửi là bằng chứng thanh toán.

## Lưu ý cấu hình

`.env` là cấu hình cục bộ của máy. Giữ thông tin xác thực ở môi trường local, không đưa credentials vào tài liệu hoặc source control.
