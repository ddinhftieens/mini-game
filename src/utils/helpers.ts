import { RawQuestion, QuestionItem } from '../types';
import { GOOGLE_SHEET_APPS_SCRIPT_URL } from './constants';

/**
 * Xáo trộn ngẫu nhiên mảng (Fisher-Yates)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Xử lý lấy ngẫu nhiên các câu hỏi từ danh sách tải về từ Google Sheet.
 * - Xáo trộn ngẫu nhiên toàn bộ danh sách câu hỏi.
 * - Nếu cấu hình targetSteps (> 0 và < tổng số câu hỏi) -> lấy ngẫu nhiên đúng targetSteps câu.
 * - Sắp xếp danh sách câu hỏi đã chọn theo mức độ khó tăng dần (difficulty từ nhỏ đến lớn).
 * - Nếu cùng độ khó thì giữ nguyên thứ tự xáo trộn ngẫu nhiên.
 * - Đánh số thứ tự id từ 1 đến hết và đặt câu 1 là active.
 */
export function processQuestionsByDifficulty(rawList: RawQuestion[], targetSteps?: number): QuestionItem[] {
  // 1. Xáo trộn ngẫu nhiên toàn bộ danh sách câu hỏi từ Google Sheet
  const shuffledRaw = shuffleArray(rawList);

  // 2. Cắt bớt theo targetSteps nếu có cấu hình
  let selected = shuffledRaw;
  if (targetSteps && targetSteps > 0 && targetSteps < shuffledRaw.length) {
    selected = shuffledRaw.slice(0, targetSteps);
  }

  // 3. Sắp xếp theo mức độ khó (difficulty) tăng dần từ nhỏ tới lớn
  const sorted = [...selected].sort((a, b) => {
    const diffA = Number(a.difficulty) || 1;
    const diffB = Number(b.difficulty) || 1;
    return diffA - diffB;
  });

  // 4. Đánh số thứ tự id từ 1 đến hết và đặt câu 1 là active
  const result: QuestionItem[] = sorted.map((item, idx) => ({
    ...item,
    id: idx + 1,
    originalIndex: idx + 1,
    status: idx === 0 ? 'active' : 'pending',
  }));

  return result;
}

/**
 * Fetch câu hỏi từ Google Sheet qua Apps Script URL.
 * Nếu không có URL hoặc tải lỗi, trả về lỗi để giao diện hiển thị thông báo.
 */
export async function fetchQuestionsFromGoogleSheet(customUrl?: string): Promise<{
  questions: RawQuestion[];
  isCustomSource: boolean;
}> {
  const urlToUse = customUrl?.trim() || GOOGLE_SHEET_APPS_SCRIPT_URL;

  if (!urlToUse) {
    throw new Error('Chưa cấu hình đường dẫn Google Apps Script Web App URL. Vui lòng bấm vào nút "⚙️ Sheet" ở góc trên để cấu hình.');
  }

  try {
    const response = await fetch(urlToUse);
    if (!response.ok) {
      throw new Error(`Máy chủ Google phản hồi lỗi HTTP ${response.status}`);
    }
    const data = await response.json();

    let rawList: any[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data && Array.isArray(data.data)) {
      rawList = data.data;
    } else if (data && Array.isArray(data.questions)) {
      rawList = data.questions;
    }

    if (rawList.length === 0) {
      throw new Error('Google Sheet không có dữ liệu câu hỏi nào. Hãy kiểm tra lại bảng tính của bạn.');
    }

    // Map chuẩn hóa cấu trúc
    const formatted: RawQuestion[] = rawList.map((item, idx) => ({
      id: item.id || idx + 1,
      question: item.question || item['Câu hỏi'] || item['cau_hoi'] || item['Question'] || `Câu hỏi ${idx + 1}`,
      A: String(item.A ?? item['a'] ?? item['Đáp án A'] ?? item['A'] ?? ''),
      B: String(item.B ?? item['b'] ?? item['Đáp án B'] ?? item['B'] ?? ''),
      C: String(item.C ?? item['c'] ?? item['Đáp án C'] ?? item['C'] ?? ''),
      D: String(item.D ?? item['d'] ?? item['Đáp án D'] ?? item['D'] ?? ''),
      answer: String(item.answer || item['Đáp án'] || item['dap_an'] || item['Answer'] || 'A').trim().toUpperCase(),
      difficulty: Number(item.difficulty || item['Mức độ khó'] || item['muc_do_kho'] || item['Difficulty'] || 1),
      explanation: item.explanation || item['Giải thích'] || '',
    }));

    return {
      questions: formatted,
      isCustomSource: true,
    };
  } catch (error: any) {
    console.error('Lỗi khi tải từ Google Apps Script:', error);
    throw new Error(error.message || 'Không thể kết nối đến Google Apps Script. Hãy kiểm tra lại URL và quyền truy cập (Anyone).');
  }
}

/**
 * Tạo âm thanh vui nhộn trực tiếp bằng Web Audio API (không cần tải file ngoài)
 */
export function playSound(type: 'correct' | 'wrong' | 'click' | 'jump' | 'countdown') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'countdown') {
      // Tiếng tích tắc đồng hồ kịch tính, hồi hộp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.95, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'jump') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.9, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'correct') {
      // Chuỗi 4 nốt chuông ngân dài, tươi vui (Đô - Mi - Sol - Đố) kéo dài ~1.2 giây
      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0, dur: 0.5 },     // C5
        { freq: 659.25, time: 0.12, dur: 0.5 },  // E5
        { freq: 783.99, time: 0.24, dur: 0.6 },  // G5
        { freq: 1046.50, time: 0.38, dur: 0.9 }, // C6
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + time;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.95, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } else if (type === 'wrong') {
      // Âm thanh báo sai 2 nhịp rõ ràng, kéo dài hơn (~0.65 giây)
      const now = ctx.currentTime;
      const buzzes = [
        { start: now, dur: 0.28, from: 300, to: 200 },
        { start: now + 0.24, dur: 0.38, from: 240, to: 150 },
      ];

      buzzes.forEach(({ start, dur, from, to }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(from, start);
        osc.frequency.exponentialRampToValueAtTime(to, start + dur);

        gain.gain.setValueAtTime(0.9, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Tạo âm thanh tiếng nổ pháo hoa sống động bằng AudioContext Noise + Filter
 */
export function playFireworkSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // 1. Tiếng xé gió vút lên (Whistle/Rise)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 400, now + 0.25);
    oscGain.gain.setValueAtTime(0.45, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    // 2. Tiếng nổ pháo hoa đùng (Boom / Crackle)
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800 + Math.random() * 400, now + 0.2);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.6);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0, now);
    noiseGain.gain.setValueAtTime(1.0, now + 0.22);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now + 0.2);
    whiteNoise.stop(now + 0.65);
  } catch (err) {
    console.error(err);
  }
}

