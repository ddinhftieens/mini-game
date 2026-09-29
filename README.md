# 🎮 Mini Game - Thử Thách Tri Thức Vui Nhộn 🌟

Trò chơi trắc nghiệm tương tác học tập trực quan, sinh động dành cho học sinh tiểu học và hỗ trợ quý thầy cô giáo trong công tác giảng dạy, tổ chức hoạt động khởi động/củng cố bài học. 

Được xây dựng bằng **React + TypeScript + Vite**, dễ dàng triển khai lên **GitHub Pages** và nạp dữ liệu câu hỏi linh hoạt từ **Google Sheet (qua Google Apps Script)**.

---

## 🌟 Các Tính Năng Nổi Bật

### 1. 🎨 Giao Diện Bắt Mắt & Trải Nghiệm Tương Tác Trực Quan
- **Màn hình bắt đầu (Start Screen):** Giới thiệu chủ đề trực quan, hỗ trợ cấu hình nhanh và chọn chủ đề hấp dẫn.
- **Bố cục 3 cột thông minh khi chơi:**
  - **Cột 1 (Bên trái):** Danh sách toàn bộ các câu hỏi với trạng thái trực quan (⭐ Độ khó tăng dần, Đang làm, Đã trả lời Đúng/Sai).
  - **Cột 2 (Chính giữa):** Thẻ câu hỏi và 4 phương án A, B, C, D to rõ, màu sắc tươi sáng; có tính năng **Đọc to câu hỏi & đáp án (Text-to-Speech)** tiếng Việt chuẩn và **Bộ đếm thời gian**.
  - **Cột 3 (Bên phải):** Sân khấu hoạt họa tương tác mô phỏng hành trình nhân vật tiến bước về đích theo từng câu trả lời đúng.

---

### 2. 🎭 4 Chủ Đề Trò Chơi Sinh Động
- 🐸 **Giải cứu Ếch Xanh**: Nhảy qua từng chiếc lá sen bồng bềnh để lên bờ an toàn.
- 🐌 **Giải cứu Ốc Sên**: Kiên trì leo từng bậc đá lên khỏi miệng giếng đón ánh nắng rực rỡ.
- 🐝 **Ong Vàng Tìm Mật**: Bay lượn qua các bông hoa thơm để mang mật ngọt về tổ khổng lồ.
- 🐧 **Giải cứu Chim Cánh Cụt**: Lướt qua các tảng băng trôi dạt để về ngôi nhà tuyết Igloo ấm áp.

---

### 3. 🔊 Hệ Thống Âm Thanh & Thuyết Minh Thông Minh
- **Thuyết minh chủ đề (`description.mp3`):** Tự động phát lời kể mô tả hấp dẫn khi nhấp chọn từng chủ đề; tự động ngắt tối ưu khi nhấn **Bắt đầu chơi**, **Tiếp tục** hoặc mở cấu hình.
- **Đọc tự động (Text-to-Speech):** Hỗ trợ giọng đọc tiếng Việt cho câu hỏi và đáp án.
- **Hiệu ứng âm thanh Web Audio API:**
  - Tiếng click phản hồi nhanh.
  - Chuỗi 4 nốt chuông ngân tươi vui khi trả lời đúng (Đô - Mi - Sol - Đố).
  - Tiếng nhảy bậc nhân vật sinh động.
  - Âm báo sai 2 nhịp êm dịu, khích lệ.
  - Tiếng tích tắc đồng hồ kịch tính.
  - Hiệu ứng pháo hoa rực rỡ kèm tiếng nổ sống động khi về đích thành công.

---

### 4. 📊 Tích Hợp Google Sheet Thời Gian Thực
- Đồng bộ ngân hàng câu hỏi trực tiếp từ Google Sheet qua Apps Script URL (hỗ trợ cơ chế tự động thử lại khi mạng chập chờn).
- Tùy biến linh hoạt **Số bước thử thách / Số câu hỏi mỗi lượt chơi** (ví dụ: 3, 5, 10 câu hoặc toàn bộ).
- Tự động xáo trộn và sắp xếp câu hỏi theo mức độ khó tăng dần (Độ khó 1 → 2 → 3...).

---

## 📋 Hướng Dẫn Chuẩn Bị Google Sheet

Tạo một bảng tính Google Sheet với dòng đầu tiên (Header) gồm các cột:

| Câu hỏi | A | B | C | D | Đáp án | Mức độ khó | Giải thích |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| Thủ đô của Việt Nam là gì? | Hà Nội | TP. Hồ Chí Minh | Đà Nẵng | Hải Phòng | A | 1 | Hà Nội là thủ đô của nước CHXHCN Việt Nam. |
| Kết quả của phép tính 25 + 15 là bao nhiêu? | 30 | 35 | 40 | 45 | C | 1 | 25 + 15 = 40 |
| Hành tinh nào gần Mặt Trời nhất? | Trái Đất | Sao Thủy | Sao Kim | Sao Hỏa | B | 2 | Sao Thủy (Mercury) là hành tinh gần Mặt Trời nhất. |

> **Lưu ý về tên cột:** Hệ thống tự động nhận diện cả tiếng Việt có dấu (`Câu hỏi`, `Đáp án A`, `Đáp án`, `Mức độ khó`, `Giải thích`) lẫn không dấu/tiếng Anh (`question`, `A`, `B`, `C`, `D`, `answer`, `difficulty`, `explanation`).

---

## 🚀 Triển Khai Google Apps Script Web App

1. Trên bảng Google Sheet vừa tạo, chọn **Tiện ích mở rộng (Extensions)** → **Apps Script**.
2. Xóa code mặc định và dán đoạn mã sau:

```javascript
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (!data || data.length < 2) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
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

3. Bấm **Deploy (Triển khai)** → **New deployment (Tùy chọn triển khai mới)**:
   - Loại triển khai: **Web app**
   - Execute as: **Me (Tôi)**
   - Who has access: **Anyone (Bất kỳ ai)**
4. Bấm **Deploy**, sao chép đường dẫn **Web App URL** và dán vào nút **⚙️ Cài đặt** trên góc giao diện trò chơi.

---

## 🛠️ Cài Đặt & Chạy Cục Bộ (Local Development)

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev

# 3. Biên dịch và kiểm tra lỗi TypeScript / đóng gói production
npm run build
```

---

## 📦 Công Nghệ Sử Dụng

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** CSS3, Tailwind CSS Utilities, Glassmorphism, CSS Keyframe Animations
- **Icons:** Lucide React
- **Audio:** Web Audio API & HTML5 Audio Management
- **Effects:** Canvas Confetti
- **Deploy:** GitHub Pages
