# 🔍 Code Review: HeadTiltQuiz Feature

## Phạm vi phân tích
- [`HeadTiltQuizPage.tsx`](file:///d:/my/mini-game/src/HeadTiltQuizPage.tsx)
- [`HeadTiltQuiz.tsx`](file:///d:/my/mini-game/src/components/camera/HeadTiltQuiz.tsx)
- [`AICamera.tsx`](file:///d:/my/mini-game/src/components/camera/AICamera.tsx)
- [`mediapipe.d.ts`](file:///d:/my/mini-game/src/types/mediapipe.d.ts)

---

## 1. 🐛 Lỗi tiềm ẩn (Bugs)

### 🔴 [BUG-1] `gameOver` set bên trong `setCurrentIndex` callback — race condition
**File:** [`HeadTiltQuiz.tsx:169-175`](file:///d:/my/mini-game/src/components/camera/HeadTiltQuiz.tsx#L169-L175)

```tsx
// HIỆN TẠI – sai
setCurrentIndex((prev) => {
  if (prev + 1 >= questions.length) {
    setGameOver(true); // ❌ Gọi setState bên trong updater fn của setState khác
    return prev;
  }
  return prev + 1;
});
```

React **không đảm bảo** các `setState` lồng trong updater function sẽ flush đúng thứ tự trong mọi chế độ (Concurrent Mode). Đây là anti-pattern có thể gây re-render không nhất quán.

```tsx
// SỬA – tách ra ngoài
const nextIndex = currentIndexRef.current + 1;
if (nextIndex >= questions.length) {
  setGameOver(true);
} else {
  setCurrentIndex(nextIndex);
}
```

---

### 🔴 [BUG-2] `width`/`height` thay đổi → `AICamera` restart hoàn toàn (FaceMesh + stream)
**File:** [`AICamera.tsx:266`](file:///d:/my/mini-game/src/components/camera/AICamera.tsx#L266)

```tsx
}, [width, height, handleResults]);
```

`HeadTiltQuiz` truyền `width={220} height={220}` là literal → không ảnh hưởng hiện tại, nhưng nếu parent re-render với giá trị khác (ví dụ responsive), toàn bộ `FaceMesh` + `MediaStream` sẽ bị teardown và khởi tạo lại — **rất tốn kém** (mỗi lần ~500ms–2s delay).

**Đề xuất:** Dùng `useRef` cho `width`/`height` bên trong `AICamera`, chỉ áp dụng vào canvas/video style, không đưa vào deps của `useEffect`.

---

### 🟡 [BUG-3] `onReady` callback type không khớp
**File:** [`AICamera.tsx:9`](file:///d:/my/mini-game/src/components/camera/AICamera.tsx#L9) vs [`HeadTiltQuiz.tsx:459-462`](file:///d:/my/mini-game/src/components/camera/HeadTiltQuiz.tsx#L459-L462)

```ts
// AICamera props khai báo:
onReady?: (ready: boolean) => void;

// Nhưng HeadTiltQuiz gọi:
onReady={() => {
  setCameraReady(true);
  setCameraError(null);
}}
```

`onReady` nhận tham số `boolean` nhưng callback trong `HeadTiltQuiz` **bỏ qua** tham số đó. Hiện không gây lỗi runtime, nhưng `onErrorRef.current?.(msg)` và `onReadyRef.current?.(true)` — nếu sau này `onReady(false)` được gọi (ví dụ camera mất kết nối), `HeadTiltQuiz` sẽ **không xử lý** trường hợp đó.

**Đề xuất:** Đổi signature thành `onReady?: () => void` hoặc xử lý tham số `ready: boolean` trong callback.

---

### 🟡 [BUG-4] `processFrame` có thể bị gọi sau khi `faceMesh` đã `close()`
**File:** [`AICamera.tsx:203-222`](file:///d:/my/mini-game/src/components/camera/AICamera.tsx#L203-L222)

```tsx
const processFrame = async (timestamp: number) => {
  if (!isMounted) return;
  // ...
  await faceMesh.send({ image: video }); // ❌ có thể throw nếu faceMesh đã close()
```

`isMounted = false` được set ở cleanup, nhưng nếu `faceMesh.send()` đang `await` thì cleanup chạy song song. Guard `!isMounted` sau await check thứ nhất **không ngăn được** trường hợp:
1. `processFrame` vào, `isMounted = true` ✅
2. Await `faceMesh.send()` bắt đầu  
3. Cleanup chạy: `isMounted = false`, `faceMesh.close()`
4. `faceMesh.send()` resolve/reject khi `faceMesh` đã closed → lỗi **bị bắt nhưng silent**

Hiện được catch bằng `try/catch` → không crash, nhưng cần thêm `faceMeshRef.current` guard.

---

### 🟡 [BUG-5] `video.pause()` trong cleanup không await `play()` promise
**File:** [`AICamera.tsx:256-257`](file:///d:/my/mini-game/src/components/camera/AICamera.tsx#L256-L257)

```tsx
videoRef.current.pause();
videoRef.current.srcObject = null;
```

Nếu `video.play()` đang pending (promise chưa resolve) khi cleanup gọi `pause()`, trình duyệt sẽ throw `AbortError`. Mặc dù không crash UI, có thể gây warning trong console.

**Đề xuất:** Bắt lỗi hoặc track `playPromise`:
```tsx
const playPromise = video.play();
playPromise.catch(() => {}); // ignore AbortError on cleanup
```

---

## 2. 💾 Rủi ro Bộ nhớ (Memory Leaks)

### 🔴 [MEM-1] Canvas `2D context` bị lấy lại mỗi frame
**File:** [`AICamera.tsx:66`](file:///d:/my/mini-game/src/components/camera/AICamera.tsx#L66)

```tsx
const ctx = canvas.getContext('2d'); // gọi mỗi frame (~30 fps)
```

`getContext('2d')` mỗi lần gọi sẽ **tra cứu internal map** trong browser. Dù không tạo object mới (context được cache), đây vẫn là overhead không cần thiết.

**Đề xuất:** Cache context vào ref:
```tsx
const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
// Sau khi canvas mounted:
ctxRef.current = canvasRef.current?.getContext('2d') ?? null;
```

---

### 🔴 [MEM-2] `progressTimer` (setInterval 30ms) không được clear khi component unmount từ ngoài
**File:** [`HeadTiltQuiz.tsx:102-104`](file:///d:/my/mini-game/src/components/camera/HeadTiltQuiz.tsx#L102-L104)

`clearTimers()` chỉ clear `holdTimer` và `progressTimer`. Cleanup effect tại line 240 gọi `clearTimers()` — **đúng**. Tuy nhiên nếu `progressTimer` đang chạy trong khoảng giữa `handleTilt` gọi `clearTimers()` và `setTimeout` callback của `holdTimer` thực thi `selectAnswer` → không có issue hiện tại.

**Nhận xét:** Cleanup đã đầy đủ, nhưng nên đảm bảo `cooldownTimer` cũng được clear trong `clearTimers()` để tập trung logic:

```tsx
const clearTimers = useCallback(() => {
  if (holdTimer.current) clearTimeout(holdTimer.current);
  if (progressTimer.current) clearInterval(progressTimer.current);
  if (cooldownTimer.current) clearTimeout(cooldownTimer.current); // thêm vào đây
  holdTimer.current = null;
  progressTimer.current = null;
  cooldownTimer.current = null;
}, []);
```

---

### 🟡 [MEM-3] `<audio>` element không bị destroy đúng cách nếu `src` đang load
**File:** [`HeadTiltQuiz.tsx:251-256`](file:///d:/my/mini-game/src/components/camera/HeadTiltQuiz.tsx#L251-L256)

```tsx
audioRef.current.pause();
audioRef.current.onended = null;
audioRef.current.src = '';
audioRef.current.load(); // flush buffer
```

Đây là pattern đúng (FIX-4 đã xử lý). Tuy nhiên nếu audio đang trong trạng thái `NETWORK_LOADING`, `load()` sau khi clear `src` sẽ cancel network request — **OK**.

Vấn đề nhỏ: không xóa các event listener khác (`onerror`, `oncanplay`...) nếu sau này được thêm vào.

---

### 🟡 [MEM-4] FaceMesh WASM resources (~8–15 MB) không được release ở mức OS
**File:** [`AICamera.tsx:259-264`](file:///d:/my/mini-game/src/components/camera/AICamera.tsx#L259-L264)

`faceMesh.close()` giải phóng WebGL textures/buffers nhưng WASM module vẫn nằm trong memory của tab. Đây là **hành vi bình thường** của MediaPipe — không thể unload WASM một phần. Chỉ cần lưu ý: nếu component mount/unmount nhiều lần (ví dụ routing), WASM không được tải lại nhưng internal state có thể leak nếu `close()` không thành công.

**Đề xuất:** Bọc `faceMesh.close()` trong try-catch (đã có) và log warning khi fail.

---

## 3. ⚡ Tối ưu Hiệu năng

### 🟢 [OPT-1] `holdProgress` update 30ms gây 33 re-render/giây khi đang giữ
**File:** [`HeadTiltQuiz.tsx:219-223`](file:///d:/my/mini-game/src/components/camera/HeadTiltQuiz.tsx#L219-L223)

`setHoldProgress` mỗi 30ms → re-render toàn bộ `HeadTiltQuiz` (bao gồm question card, camera wrap, answer cards). Với SVG ring animation, có thể dùng **CSS animation** thay vì JS state:

```css
/* CSS animation 1.2s fill từ 0→100% */
@keyframes ring-fill {
  from { stroke-dasharray: 0 100; }
  to   { stroke-dasharray: 100 100; }
}
.htq-ring-fill--active {
  animation: ring-fill 1.2s linear forwards;
}
```

→ Giảm từ 33 re-render/s xuống 0 khi giữ tilt.

---

### 🟢 [OPT-2] `handleResults` vẽ canvas mỗi 30fps ngay cả khi direction không đổi
**File:** [`AICamera.tsx:69`](file:///d:/my/mini-game/src/components/camera/AICamera.tsx#L69)

```tsx
ctx.clearRect(0, 0, canvas.width, canvas.height);
// vẽ arc + line mọi frame
```

Nếu `direction` không thay đổi, có thể **skip redraw**:
```tsx
if (direction === lastDirectionRef.current && direction !== null) {
  // Không cần vẽ lại nếu không có gì thay đổi
  return;
}
```

→ Tiết kiệm ~10–20% GPU draw calls khi người dùng giữ đầu thẳng/ổn định.

---

### 🟢 [OPT-3] `currentQ` có thể undefined khi `currentIndex` vượt quá `questions.length`
**File:** [`HeadTiltQuiz.tsx:132`](file:///d:/my/mini-game/src/components/camera/HeadTiltQuiz.tsx#L132)

```tsx
const currentQ = questions[currentIndex]; // có thể undefined
```

Nếu `gameOver = true` và render path `{gameStarted && !gameOver && (...)}` không chặn hoàn toàn, `currentQ.question` sẽ throw. Hiện tại logic render có guard nhưng nên thêm fallback:

```tsx
const currentQ = questions[currentIndex] ?? questions[0];
```

---

### 🟢 [OPT-4] `pct` tính toán ngay trong render body dù không dùng khi game đang chơi
**File:** [`HeadTiltQuiz.tsx:288`](file:///d:/my/mini-game/src/components/camera/HeadTiltQuiz.tsx#L288)

```tsx
const pct = Math.round((score / total) * 100); // chỉ dùng trong gameOver screen
```

Di chuyển vào block `gameOver` hoặc dùng `useMemo` (không cần thiết cho phép tính đơn giản này — **low priority**).

---

### 🟢 [OPT-5] `toggleMusic` không dùng `useCallback` → tạo mới mỗi render
**File:** [`HeadTiltQuiz.tsx:118`](file:///d:/my/mini-game/src/components/camera/HeadTiltQuiz.tsx#L118)

```tsx
const toggleMusic = () => { ... }; // tạo mới mỗi render
```

Bọc bằng `useCallback` với dep `[isMusicPlaying]`.

---

## 4. 🔒 Vấn đề Khác

### 🟡 [SEC-1] CDN MediaPipe không có SRI hash
**File:** [`AICamera.tsx:146-147`](file:///d:/my/mini-game/src/components/camera/AICamera.tsx#L146-L147)

```tsx
`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
```

Nếu CDN bị compromise, WASM độc hại có thể được inject. Với app trẻ em (nội dung game), nên cân nhắc **bundle WASM locally** hoặc thêm CSP header.

---

### 🟡 [A11Y-1] Answer cards dùng `div` với `role="button"` nhưng thiếu `onKeyDown`
**File:** [`HeadTiltQuiz.tsx:412-452`](file:///d:/my/mini-game/src/components/camera/HeadTiltQuiz.tsx#L412-L452)

```tsx
<div role="button" tabIndex={0} onClick={...}>
```

Thiếu `onKeyDown` handler cho phím `Enter`/`Space` → không accessible với keyboard-only users.

---

## 5. 📊 Tóm tắt & Ưu tiên

| ID | Mức độ | Loại | Mô tả ngắn |
|----|--------|------|------------|
| BUG-1 | 🔴 Cao | Bug | setState lồng trong setState updater |
| BUG-2 | 🔴 Cao | Perf/Bug | width/height dep restart FaceMesh |
| MEM-1 | 🔴 Cao | Memory | getContext('2d') mỗi frame |
| OPT-1 | 🟢 Trung | Perf | 33 re-render/s khi giữ tilt → CSS animation |
| OPT-2 | 🟢 Trung | Perf | Skip canvas redraw khi direction ổn định |
| BUG-3 | 🟡 Thấp | Bug | onReady type mismatch |
| BUG-4 | 🟡 Thấp | Bug | processFrame race với faceMesh.close() |
| BUG-5 | 🟡 Thấp | Bug | video.pause() vs play() AbortError |
| MEM-2 | 🟡 Thấp | Memory | cooldownTimer nên vào clearTimers() |
| OPT-3 | 🟢 Thấp | Safety | currentQ undefined guard |
| A11Y-1 | 🟡 Thấp | A11Y | Thiếu onKeyDown cho answer cards |
| SEC-1 | 🟡 Thấp | Security | CDN không có SRI |

