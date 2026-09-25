# Mini Game - Vui Học Cùng Bé (Dành Cho Tiểu Học) 🎮🐸

Dự án Mini Game trắc nghiệm tương tác trực quan, vui nhộn phục vụ công tác giảng dạy cho các thầy cô giáo tiểu học. Được xây dựng để dễ dàng triển khai lên **GitHub Pages** và kết nối trực tiếp với **Google Sheet (qua Google Apps Script)**.

---

## 🌟 Các tính năng nổi bật

1. **Bố cục 3 phần trực quan (UI/UX tối ưu cho trẻ em):**
   - **Bên trái:** Danh sách toàn bộ các câu hỏi kèm trạng thái hoàn thành (Đúng / Sai / Đang làm), sắp xếp ngẫu nhiên theo độ khó từ nhỏ tới lớn (⭐ Dễ → ⭐⭐ Vừa → ⭐⭐⭐ Khó).
   - **Chính giữa:** Giao diện câu hỏi và 4 lựa chọn A, B, C, D rõ ràng, chữ to, có tính năng **Đọc to câu hỏi (Text-to-Speech)** giúp bé dễ tiếp thu.
   - **Bên phải:** Sân khấu tương tác sinh động với hành trình của nhân vật (ví dụ: *Giải cứu Chú Ếch Xanh* nhảy qua từng lá sen, *Giải cứu Công chúa*, *Ốc sên leo miệng giếng*). Số lá sen/bước có thể cấu hình tùy biến trong `constants.ts`.

2. **Menu chọn chủ đề trước khi bắt đầu:**
   - 🐸 **Giải cứu Chú Ếch Xanh**: Nhảy lá sen vào bờ.
   - 🏰 **Giải cứu Công Chúa**: Vượt ải các tầng tháp.
   - 🐌 **Ốc Sên Leo Miệng Giếng**: Kiên trì vươn tới ánh mặt trời.

3. **Kết nối Google Sheet thời gian thực:**
   - Hỗ trợ lấy dữ liệu câu hỏi trực tiếp từ Google Sheet qua Apps Script Web App API (không cần tài khoản phức tạp, chỉ cần public quyền Web App).
   - Có sẵn bộ câu hỏi mẫu mặc định nếu không nhập Sheet.

4. **Hiệu ứng & Âm thanh tương tác:**
   - Web Audio API phát âm thanh vui nhộn khi click, trả lời đúng, nhảy bậc, báo sai nhẹ nhàng và nhạc chiến thắng cùng pháo hoa (Canvas Confetti).

---

## 📋 Cấu trúc bảng Google Sheet

Tạo 1 bảng Google Sheet với các cột tiêu đề ở dòng 1:

| Câu hỏi | A | B | C | D | Đáp án | Mức độ khó |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Trường Tiểu học Cự Khối thuộc phường nào? | Phường Bồ Đề | Phường Long Biên | Phường Hoàn Kiếm | Phường Ba Đình | B | 1 |
| Kết quả phép tính 25 + 15 là bao nhiêu? | 30 | 35 | 40 | 45 | C | 1 |

---

## 🚀 Triển khai Google Apps Script

1. Trong file Google Sheet, vào **Tiện ích mở rộng (Extensions)** → **Apps Script**.
2. Dán đoạn code sau:
   ```javascript
   function doGet(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data = sheet.getDataRange().getValues();
     var headers = data[0];
     var rows = data.slice(1);
     
     var result = rows.map(function(row) {
       var obj = {};
       headers.forEach(function(header, index) {
         obj[header] = row[index];
       });
       return obj;
     });
     
     return ContentService.createTextOutput(JSON.stringify(result))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```
3. Nhấn **Deploy** (Triển khai) → **New deployment** (Tùy chọn triển khai mới) → Chọn loại **Web app** → Access: **Anyone (Bất kỳ ai)**.
4. Sao chép URL Web App và dán vào nút **Cài đặt Nguồn Sheet** trên giao diện trò chơi (hoặc cấu hình cố định trong `src/utils/constants.ts`).

---

## 🛠️ Cài đặt và Chạy Thử trên máy

```bash
# Cài đặt thư viện
npm install

# Chạy server phát triển
npm run dev

# Build đóng gói chạy GitHub Pages
npm run build
```
