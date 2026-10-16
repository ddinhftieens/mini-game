import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2, VolumeX, AlertTriangle, Settings, RefreshCw, X } from 'lucide-react';
import AICamera, { TiltDirection } from './AICamera';
import { HEAD_TILT_GOOGLE_SHEET_URL } from '../../utils/constants';
import './HeadTiltQuiz.css';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: number;
  question: string;
  emoji?: string;
  difficulty?: number; // 1: Dễ, 2: Trung bình, 3: Nâng cao
  leftAnswer: { text: string; correct: boolean };
  rightAnswer: { text: string; correct: boolean };
}

interface HeadTiltQuizProps {
  questions?: QuizQuestion[];
}

// ─── Utility: Xáo trộn ngẫu nhiên mảng câu hỏi ──────────────────────────────

function shuffleQuestions<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Default questions ────────────────────────────────────────────────────────

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Số liền sau của số 7 là số mấy?',
    difficulty: 1,
    leftAnswer: { text: 'Số 6', correct: false },
    rightAnswer: { text: 'Số 8', correct: true },
  },
  {
    id: 2,
    question: 'Hình nào dưới đây có các cạnh bằng nhau và có 4 góc vuông?',
    difficulty: 2,
    leftAnswer: { text: 'Hình vuông', correct: true },
    rightAnswer: { text: 'Hình tam giác', correct: false },
  },
  {
    id: 3,
    question: 'Mẹ mua 5 quả cam, ăn hết 2 quả. Hỏi còn lại mấy quả?',
    difficulty: 3,
    leftAnswer: { text: '3 quả', correct: true },
    rightAnswer: { text: '7 quả', correct: false },
  },
  {
    id: 4,
    question: 'Từ nào dưới đây viết đúng chính tả?',
    difficulty: 1,
    leftAnswer: { text: 'Quả chanh', correct: true },
    rightAnswer: { text: 'Quả tranh', correct: false },
  },
  {
    id: 5,
    question: 'Bộ phận nào trên cơ thể giúp chúng ta lắng nghe âm thanh xung quanh?',
    difficulty: 1,
    leftAnswer: { text: 'Đôi tai', correct: true },
    rightAnswer: { text: 'Chiếc mũi', correct: false },
  },
  {
    id: 6,
    question: 'Con vật nào dưới đây chuyên gáy báo thức vào buổi sáng sớm?',
    difficulty: 2,
    leftAnswer: { text: 'Con gà trống', correct: true },
    rightAnswer: { text: 'Con vịt bầu', correct: false },
  },
  {
    id: 7,
    question: 'Cây gì có lá, có thân nhưng lại không có quả và không bao giờ biết đi?',
    difficulty: 2,
    leftAnswer: { text: 'Cây xanh', correct: true },
    rightAnswer: { text: 'Cây kem', correct: false },
  },
  {
    id: 8,
    question: 'Khi trời mưa to, chúng ta thường dùng vật dụng gì để che mưa?',
    difficulty: 3,
    leftAnswer: { text: 'Cái ô (cái dù)', correct: true },
    rightAnswer: { text: 'Chiếc quạt giấy', correct: false },
  },
];

// ─── Tilt hold constants ──────────────────────────────────────────────────────

const HOLD_MS = 1200; // how long to hold tilt before selecting
const COOLDOWN_MS = 2000; // wait after answering before next question

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ─── Fetch questions from Google Sheet Apps Script ────────────────────────────

export async function fetchHeadTiltQuestions(customUrl?: string): Promise<QuizQuestion[]> {
  const url = customUrl?.trim() || HEAD_TILT_GOOGLE_SHEET_URL;
  if (!url) {
    throw new Error('Chưa cấu hình đường dẫn Google Sheet Apps Script URL.');
  }

  const MAX_RETRIES = 3;
  let lastError: Error = new Error('Không thể kết nối đến Google Sheet.');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Mã lỗi máy chủ: ${res.status}`);
      }
      const data = await res.json();

      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.questions)) {
        list = data.questions;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      }

      if (!list || list.length === 0) {
        throw new Error('Google Sheet trống hoặc không tìm thấy dòng câu hỏi nào.');
      }

      // 1. Lọc bỏ các dòng trống không có nội dung hợp lệ
      const validRows = list.filter((item) => {
        const q = String(item.question || item['Câu hỏi'] || item['cau_hoi'] || item['Question'] || '').trim();
        const a = String(item.A ?? item['a'] ?? item['Đáp án A'] ?? '').trim();
        const b = String(item.B ?? item['b'] ?? item['Đáp án B'] ?? '').trim();
        return q.length > 0 && (a.length > 0 || b.length > 0);
      });

      if (validRows.length === 0) {
        throw new Error('Bảng tính không có câu hỏi hợp lệ (vui lòng kiểm tra lại cột Câu hỏi và các cột Đáp án A, B).');
      }

      // 2. Chuyển đổi dữ liệu và chuẩn hóa đáp án
      const parsed: QuizQuestion[] = validRows.map((item, idx) => {
        const qText = String(item.question || item['Câu hỏi'] || item['cau_hoi'] || item['Question'] || `Câu hỏi ${idx + 1}`).trim();
        const optA = String(item.A ?? item['a'] ?? item['Đáp án A'] ?? 'Đáp án A').trim();
        const optB = String(item.B ?? item['b'] ?? item['Đáp án B'] ?? 'Đáp án B').trim();
        
        // Chuẩn hóa linh hoạt: nhận diện 'A', '1', 'A.', 'ĐÁP ÁN A' hoặc trùng nội dung text đáp án A
        const rawAns = String(item.answer || item['Đáp án'] || item['dap_an'] || 'A').trim().toUpperCase();
        const cleanAns = rawAns.replace(/[^A-Z0-9]/g, '');
        const isACorrect = 
          cleanAns === 'A' || 
          cleanAns === '1' || 
          cleanAns.startsWith('A') ||
          rawAns === optA.toUpperCase();

        const diffNum = Number(item.difficulty || item['Mức độ'] || item['muc_do'] || item['Độ khó'] || 1);

        return {
          id: idx + 1,
          question: qText,
          difficulty: isNaN(diffNum) || diffNum < 1 ? 1 : diffNum,
          leftAnswer: {
            text: optA,
            correct: isACorrect,
          },
          rightAnswer: {
            text: optB,
            correct: !isACorrect,
          },
        };
      });

      // 3. Xáo trộn ngẫu nhiên toàn bộ danh sách câu hỏi
      return shuffleQuestions(parsed).map((q, idx) => ({
        ...q,
        id: idx + 1,
      }));

    } catch (err: any) {
      const isAbort = err.name === 'AbortError';
      let viMsg = 'Không thể kết nối đến máy chủ Google Sheet';
      const rawMsg = String(err.message || '');

      if (isAbort) {
        viMsg = 'Hết thời gian chờ phản hồi (12 giây)';
      } else if (rawMsg.includes('Failed to fetch') || rawMsg.includes('NetworkError') || rawMsg.includes('Load failed')) {
        viMsg = 'Không thể kết nối mạng hoặc liên kết Sheet chưa mở quyền truy cập công khai';
      } else if (rawMsg.includes('Mã lỗi máy chủ')) {
        viMsg = rawMsg;
      } else if (rawMsg.includes('trống') || rawMsg.includes('không tìm thấy') || rawMsg.includes('không có câu hỏi')) {
        viMsg = rawMsg;
      }

      lastError = new Error(viMsg);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

// ─── Component ────────────────────────────────────────────────────────────────

const HeadTiltQuiz: React.FC<HeadTiltQuizProps> = ({ questions: initialQuestions }) => {
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    const saved = localStorage.getItem('head_tilt_quiz_sheet_url');
    // Nếu chưa lưu hoặc lưu nhầm link library không có đuôi /exec thì lấy HEAD_TILT_GOOGLE_SHEET_URL
    if (!saved || !saved.includes('/exec')) {
      return HEAD_TILT_GOOGLE_SHEET_URL;
    }
    return saved;
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => initialQuestions || DEFAULT_QUESTIONS);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>(sheetUrl);

  const [gameStarted, setGameStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // Bộ đếm thời gian từ khi bắt đầu
  const [tiltDir, setTiltDir] = useState<TiltDirection>(null);
  const [heldDir, setHeldDir] = useState<'left' | 'right' | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ correct: boolean; dir: 'left' | 'right' }[]>([]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const inCooldownRef = useRef(false);
  // FIX-3: Keep a ref for cameraReady so handleTilt does not need it as a dep
  const cameraReadyRef = useRef(cameraReady);
  cameraReadyRef.current = cameraReady;
  // FIX-2: Keep a ref for currentIndex so selectAnswer never reads a stale closure
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // Tự động tải câu hỏi từ Google Sheet lúc khởi tạo
  const loadQuestionsFromSheet = async (targetUrl?: string) => {
    setLoadingQuestions(true);
    setLoadError(null);
    try {
      const fetched = await fetchHeadTiltQuestions(targetUrl || sheetUrl);
      if (fetched && fetched.length > 0) {
        setQuestions(fetched);
      }
    } catch (err: any) {
      console.warn('Không tải được câu hỏi từ Sheet, sử dụng danh sách câu hỏi dự phòng:', err);
      setLoadError(err.message || 'Lỗi kết nối tới Google Sheet');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (!initialQuestions) {
      loadQuestionsFromSheet();
    }
  }, []);

  const handleSaveSettings = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed.includes('/exec')) {
      alert('Đường dẫn Web App URL của Google Apps Script phải kết thúc bằng /exec.');
      return;
    }
    setSheetUrl(trimmed);
    localStorage.setItem('head_tilt_quiz_sheet_url', trimmed);
    setShowSettingsModal(false);
    loadQuestionsFromSheet(trimmed);
  };

  // Chuẩn hóa đường dẫn file nhạc nền tương thích cả Vite dev server lẫn GitHub Pages
  const bgMusicUrl = `${(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')}/camera/nhac_nen.mp3`;

  // Khởi tạo đối tượng Audio một lần duy nhất qua Ref
  useEffect(() => {
    const audio = new Audio(bgMusicUrl);
    audio.loop = true;
    audio.volume = 0.5;

    audio.onplay = () => setIsMusicPlaying(true);
    audio.onpause = () => setIsMusicPlaying(false);
    audio.onerror = (e) => {
      console.warn('Audio error:', e);
      setIsMusicPlaying(false);
    };

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [bgMusicUrl]);

  const playMusic = async () => {
    if (!audioRef.current) return;
    try {
      if (!audioRef.current.src || audioRef.current.src === '') {
        audioRef.current.src = bgMusicUrl;
      }
      await audioRef.current.play();
    } catch (err: any) {
      console.warn('Không thể phát nhạc nền:', err);
    }
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;
    if (!audioRef.current.paused) {
      audioRef.current.pause();
    } else {
      await playMusic();
    }
  };

  const currentQ = questions[currentIndex] ?? questions[0];

  const clearTimers = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    holdTimer.current = null;
    cooldownTimer.current = null;
  }, []);

  const selectAnswer = useCallback(
    (dir: 'left' | 'right') => {
      if (inCooldownRef.current) return;
      inCooldownRef.current = true;
      clearTimers();
      setHeldDir(dir); // Retain active answer card highlight during cooldown

      // FIX-2: Read currentIndex from ref to avoid stale closure
      const currentIdx = currentIndexRef.current;
      const q = questions[currentIdx] ?? questions[0];
      const chosen = dir === 'left' ? q.leftAnswer : q.rightAnswer;
      const isCorrect = chosen.correct;

      setFeedback(isCorrect ? 'correct' : 'wrong');
      // FIX-1: Always record answer (both correct and wrong) for full history
      setAnswers((prev) => [...prev, { correct: isCorrect, dir }]);
      if (isCorrect) {
        setScore((s) => s + 1);
      }

      cooldownTimer.current = setTimeout(() => {
        setFeedback(null);
        setHeldDir(null);
        inCooldownRef.current = false;

        if (isCorrect) {
          // [BUG-1 FIX]: Tách setGameOver ra ngoài updater function
          const nextIndex = currentIdx + 1;
          if (nextIndex >= questions.length) {
            setGameOver(true);
          } else {
            currentIndexRef.current = nextIndex;
            setCurrentIndex(nextIndex);
          }
        }
      }, COOLDOWN_MS);
    },
    [questions, clearTimers]
  );

  // Bộ đếm thời gian liên tục từ khi bắt đầu cho đến khi hoàn thành
  useEffect(() => {
    if (!gameStarted || gameOver) {
      if (elapsedTimer.current) {
        clearInterval(elapsedTimer.current);
        elapsedTimer.current = null;
      }
      return;
    }

    elapsedTimer.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (elapsedTimer.current) {
        clearInterval(elapsedTimer.current);
        elapsedTimer.current = null;
      }
    };
  }, [gameStarted, gameOver]);

  const handleTilt = useCallback(
    (dir: TiltDirection) => {
      // FIX-3: Use ref instead of state to avoid recreating handleTilt on cameraReady change
      if (!cameraReadyRef.current) setCameraReady(true);
      setTiltDir(dir);

      // Do not accept tilt actions or clear answer state while in cooldown
      if (inCooldownRef.current) return;

      if (dir === 'left' || dir === 'right') {
        setHeldDir(dir);
        clearTimers();

        // [OPT-1 FIX]: SVG ring dùng CSS animation 1.2s mượt mà, không cần progressTimer set 33 re-render/s
        holdTimer.current = setTimeout(() => {
          clearTimers();
          selectAnswer(dir);
        }, HOLD_MS);
      } else {
        clearTimers();
        setHeldDir(null);
      }
    },
    [clearTimers, selectAnswer]
  );

  // cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current);
        cooldownTimer.current = null;
      }
      if (elapsedTimer.current) {
        clearInterval(elapsedTimer.current);
        elapsedTimer.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [clearTimers]);

  const restart = () => {
    clearTimers();
    if (cooldownTimer.current) {
      clearTimeout(cooldownTimer.current);
      cooldownTimer.current = null;
    }
    if (elapsedTimer.current) {
      clearInterval(elapsedTimer.current);
      elapsedTimer.current = null;
    }
    inCooldownRef.current = false;
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    setScore(0);
    setElapsedTime(0);
    setFeedback(null);
    setGameOver(false);
    setGameStarted(true);
    setAnswers([]);
    setHeldDir(null);
    setTiltDir(null);
    // Xáo trộn ngẫu nhiên lại danh sách câu hỏi cho lượt chơi mới
    setQuestions((prev) => shuffleQuestions(prev).map((q, idx) => ({ ...q, id: idx + 1 })));
  };

  // ── Render: Master Tree ───────────────────────────────────────────────────
  const leftActive = heldDir === 'left';
  const rightActive = heldDir === 'right';
  const total = questions.length;
  const pct = Math.round((score / total) * 100);

  return (
    <div className="htq-root">
      {/* Nút Cài đặt Sheet ở góc trên bên phải */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 50, display: 'flex', gap: '8px' }}>
        <button
          onClick={() => loadQuestionsFromSheet()}
          disabled={loadingQuestions}
          title="Tải lại câu hỏi từ Google Sheet"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '99px',
            padding: '8px 14px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: loadingQuestions ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: 700,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
        >
          <RefreshCw size={16} className={loadingQuestions ? 'animate-spin' : ''} style={{ animation: loadingQuestions ? 'spin 1s linear infinite' : 'none' }} />
          <span>{loadingQuestions ? 'Đang nạp...' : 'Nạp lại'}</span>
        </button>

        <button
          onClick={() => {
            setInputUrl(sheetUrl);
            setShowSettingsModal(true);
          }}
          title="Cài đặt liên kết Google Sheet"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '99px',
            padding: '8px 14px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 700,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
        >
          <Settings size={16} />
          <span>Cấu hình Sheet</span>
        </button>
      </div>

      {/* Màn hình Bắt đầu */}
      {!gameStarted && (
        <div className="htq-startcard">
          <div className="htq-startcard-badge">TRÒ CHƠI AI CAMERA</div>

          <h1 className="htq-startcard__title">Đố Vui Vận Động</h1>

          <p className="htq-startcard__desc">
            Bé hãy nhìn vào camera và <strong>nghiêng đầu</strong> sang <strong>Trái</strong> hoặc <strong>Phải</strong> để chọn đáp án đúng nhé!
          </p>

          {/* Vùng trạng thái tải câu hỏi từ Google Sheet */}
          <div style={{ minHeight: '68px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {loadingQuestions ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 28px',
                borderRadius: '18px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1.5px solid rgba(253, 224, 71, 0.25)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                whiteSpace: 'nowrap',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '3.5px solid rgba(253, 224, 71, 0.2)',
                  borderTopColor: '#fde047',
                  animation: 'htq-spin 0.8s linear infinite'
                }} />
                <span style={{ fontSize: '0.92rem', color: '#fef08a', fontWeight: 800, letterSpacing: '0.2px' }}>
                  Đang tải câu hỏi từ Google Sheet...
                </span>
              </div>
            ) : loadError ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                maxWidth: '460px',
              }}>
                <div style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(185, 28, 28, 0.24) 100%)',
                  border: '1.5px solid rgba(248, 113, 113, 0.45)',
                  borderRadius: '16px',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)',
                  boxSizing: 'border-box',
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <AlertTriangle size={20} color="#f87171" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fca5a5' }}>
                      Tải câu hỏi không thành công
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#fecaca', lineHeight: 1.4 }}>
                      {loadError}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => loadQuestionsFromSheet()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 24px',
                    borderRadius: '99px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: '1.5px solid rgba(254, 240, 138, 0.5)',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.45)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.filter = 'brightness(1)';
                  }}
                >
                  <RefreshCw size={17} />
                  <span>Thử tải lại</span>
                </button>
              </div>
            ) : (
              <div style={{
                fontSize: '0.95rem',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1.5px solid rgba(52, 211, 153, 0.4)',
                padding: '7px 20px',
                borderRadius: '99px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.2)'
              }}>
                <span style={{ fontSize: '1.1rem' }}>✓</span>
                <span>Đã nạp thành công <strong>{questions.length}</strong> câu hỏi</span>
              </div>
            )}
          </div>

          <button
            className="htq-btn htq-btn--start"
            disabled={loadingQuestions || !!loadError}
            style={{
              opacity: (loadingQuestions || !!loadError) ? 0.45 : 1,
              cursor: (loadingQuestions || !!loadError) ? 'not-allowed' : 'pointer',
              filter: (loadingQuestions || !!loadError) ? 'grayscale(0.6)' : 'none',
              transform: (loadingQuestions || !!loadError) ? 'none' : undefined,
              boxShadow: (loadingQuestions || !!loadError) ? 'none' : undefined,
            }}
            onClick={() => {
              if (loadingQuestions || loadError) return;
              setGameStarted(true);
              setElapsedTime(0);
              playMusic();
            }}
          >
            {loadingQuestions ? 'ĐANG TẢI...' : 'BẮT ĐẦU'}
          </button>
        </div>
      )}

      {/* Màn hình Kết thúc */}
      {gameStarted && gameOver && (
        <div className="htq-gameover">
          <div className="htq-gameover-badge">KẾT QUẢ</div>

          {/* Glowing Animated Trophy Icon */}
          <div className="htq-gameover-trophy">
            <svg viewBox="0 0 100 100" className="htq-trophy-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="46" fill="url(#trophy-glow-grad)" />
              {/* Handles */}
              <path d="M28 32 C18 32, 16 52, 28 54 L32 54" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
              <path d="M72 32 C82 32, 84 52, 72 54 L68 54" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
              {/* Cup */}
              <path d="M30 26 H70 V46 C70 57, 61 64, 50 64 C39 64, 30 57, 30 46 Z" fill="url(#cup-grad)" stroke="#fef08a" strokeWidth="2.5" />
              {/* Star on Cup */}
              <path d="M50 35 L52.5 41 L59 41.5 L54 45.5 L55.5 52 L50 48 L44.5 52 L46 45.5 L41 41.5 L47.5 41 Z" fill="#ffffff" />
              {/* Stem & Base */}
              <path d="M46 64 H54 V74 H46 Z" fill="#d97706" />
              <rect x="34" y="74" width="32" height="10" rx="4" fill="#b45309" stroke="#fef08a" strokeWidth="2" />
              <defs>
                <radialGradient id="trophy-glow-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fde047" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                </radialGradient>
                <linearGradient id="cup-grad" x1="30" y1="26" x2="70" y2="64" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fde047" />
                  <stop offset="1" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h2 className="htq-gameover__title">
            {pct >= 80 ? 'Xuất Sắc!' : pct >= 50 ? 'Làm Tốt Lắm!' : 'Cố Gắng Lên Nhé!'}
          </h2>

          <div className="htq-gameover-scorebox">
            <div className="htq-gameover-score-row">
              <span className="htq-gameover-score-number">{score} / {total}</span>
            </div>
            <div className="htq-gameover-time-spent">
              Thời gian: <strong>{formatTime(elapsedTime)}</strong>
            </div>
          </div>

          <button className="htq-btn htq-btn--start htq-btn--replay" onClick={restart}>
            CHƠI LẠI
          </button>
        </div>
      )}

      {/* Màn hình Chơi chính */}
      {gameStarted && !gameOver && (
        <>
          {/* Header */}
          <div className="htq-header">
            <span className="htq-progress-text">
              Câu {currentIndex + 1} / {questions.length}
            </span>
            <div className="htq-progress-bar">
              <div
                className="htq-progress-bar__fill"
                style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
              />
            </div>

            {/* Bộ đếm thời gian chơi */}
            <div className="htq-timer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>{formatTime(elapsedTime)}</span>
            </div>

            <span className="htq-score">Điểm: {score}</span>
          </div>

          {/* Question */}
          <div className={`htq-question-card ${feedback ? `htq-question-card--${feedback}` : ''}`}>
            {/* Header: Dàn đều 2 đầu (Bên trái: CÂU X - Bên phải: Mức độ khó) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: '0.85rem',
            }}>
              {/* Badge số câu hỏi bên trái (chỉ CÂU 1, CÂU 2...) */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 16px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #fde047 0%, #f59e0b 100%)',
                color: '#1e1b4b',
                fontWeight: 900,
                fontSize: '0.86rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                boxShadow: '0 3px 12px rgba(245, 158, 11, 0.45)',
              }}>
                <span>CÂU {currentIndex + 1}</span>
              </div>

              {/* Badge mức độ khó bên phải */}
              {(() => {
                const diff = Number(currentQ.difficulty) || 1;
                let label = 'Dễ';
                let tagBg = 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.35) 100%)';
                let tagBorder = 'rgba(52, 211, 153, 0.5)';
                let textColor = '#6ee7b7';
                let starCount = 1;

                if (diff === 2) {
                  label = 'Trung bình';
                  tagBg = 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.35) 100%)';
                  tagBorder = 'rgba(251, 191, 36, 0.5)';
                  textColor = '#fde047';
                  starCount = 2;
                } else if (diff >= 3) {
                  label = 'Nâng cao';
                  tagBg = 'linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(220, 38, 38, 0.35) 100%)';
                  tagBorder = 'rgba(248, 113, 113, 0.5)';
                  textColor = '#fca5a5';
                  starCount = 3;
                }

                return (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    background: tagBg,
                    border: `1.5px solid ${tagBorder}`,
                    color: textColor,
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.25)',
                    backdropFilter: 'blur(10px)',
                  }}>
                    {/* Ngôi sao */}
                    <div style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
                      {[1, 2, 3].map((starIdx) => (
                        <span
                          key={starIdx}
                          style={{
                            fontSize: '0.82rem',
                            lineHeight: 1,
                            color: starIdx <= starCount ? textColor : 'rgba(255, 255, 255, 0.2)',
                            filter: starIdx <= starCount ? 'drop-shadow(0 0 3px currentColor)' : 'none',
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <span>Mức độ: {label}</span>
                  </div>
                );
              })()}
            </div>

            <h2 className="htq-question-text">{currentQ.question}</h2>
          </div>

          {/* Main area: answer + camera + answer */}
          <div className="htq-arena">
            {/* Left Answer */}
            <div
              onClick={() => {
                if (!inCooldownRef.current) selectAnswer('left');
              }}
              role="button"
              tabIndex={0}
              style={{ pointerEvents: feedback ? 'none' : 'auto' }}
              className={`htq-answer-card htq-answer-card--left
            ${leftActive ? 'htq-answer-card--active' : ''}
            ${feedback && heldDir === 'left' ? `htq-answer-card--${feedback}` : ''}
          `}
            >
              <div className="htq-answer-content">
                <div className="htq-answer-text">{currentQ.leftAnswer.text}</div>
              </div>
            </div>

            {/* Camera Center - Tích hợp vòng tròn đếm ngược sinh trắc học */}
            <div className="htq-camera-wrap">
              <div className={`htq-camera-ring htq-camera-ring--${tiltDir ?? 'center'}`}>
                {/* SVG Vòng đếm ngược sinh trắc học quét quanh Camera */}
                <svg
                  className="htq-camera-scan-svg"
                  viewBox="0 0 256 256"
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '-10px',
                    width: 'calc(100% + 20px)',
                    height: 'calc(100% + 20px)',
                    pointerEvents: 'none',
                    zIndex: 15,
                    overflow: 'visible',
                  }}
                >
                  <defs>
                    <linearGradient id="htq-scan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fde047" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#fde047" />
                    </linearGradient>
                    <filter id="htq-scan-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Vòng nền mờ trang trí chuẩn sinh trắc học */}
                  <circle
                    cx="128"
                    cy="128"
                    r="124"
                    fill="none"
                    stroke={heldDir ? 'rgba(253, 224, 71, 0.25)' : 'rgba(255, 255, 255, 0.12)'}
                    strokeWidth="3.5"
                    strokeDasharray={heldDir ? 'none' : '4 6'}
                    style={{ transition: 'stroke 0.3s ease' }}
                  />

                  {/* Vòng quét đếm ngược khi phát hiện nghiêng đầu (heldDir) */}
                  {heldDir && (
                    <circle
                      className="htq-camera-progress-fill"
                      cx="128"
                      cy="128"
                      r="124"
                      fill="none"
                      stroke="url(#htq-scan-gradient)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      filter="url(#htq-scan-glow)"
                      transform="rotate(-90 128 128)"
                    />
                  )}
                </svg>

                <AICamera
                  onTilt={handleTilt}
                  onReady={() => {
                    setCameraReady(true);
                    setCameraError(null);
                  }}
                  onError={(msg) => {
                    setCameraError(msg);
                  }}
                  tiltThreshold={14}
                  width={220}
                  height={220}
                />
              </div>
              <div className="htq-tilt-status-pill">
                <span className={`htq-status-dot ${cameraError ? 'htq-status-dot--warning' : ''}`}></span>
                <span className="htq-tilt-hint">
                  {cameraError
                    ? 'Không có camera (chạm/click đáp án)'
                    : !cameraReady
                      ? 'Đang khởi động camera...'
                      : tiltDir === 'left'
                        ? 'Nghiêng trái'
                        : tiltDir === 'right'
                          ? 'Nghiêng phải'
                          : 'Nhìn thẳng'}
                </span>
              </div>
            </div>

            {/* Right Answer */}
            <div
              onClick={() => {
                if (!inCooldownRef.current) selectAnswer('right');
              }}
              role="button"
              tabIndex={0}
              style={{ pointerEvents: feedback ? 'none' : 'auto' }}
              className={`htq-answer-card htq-answer-card--right
            ${rightActive ? 'htq-answer-card--active' : ''}
            ${feedback && heldDir === 'right' ? `htq-answer-card--${feedback}` : ''}
          `}
            >
              <div className="htq-answer-content">
                <div className="htq-answer-text">{currentQ.rightAnswer.text}</div>
              </div>
            </div>
          </div>

          {/* Feedback overlay */}
          {feedback && (
            <div className={`htq-feedback-backdrop htq-feedback-backdrop--${feedback}`}>
              <div className={`htq-feedback-card htq-feedback-card--${feedback}`}>
                <div className="htq-feedback-icon-wrap">
                  {feedback === 'correct' ? (
                    <svg className="htq-feedback-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg className="htq-feedback-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  )}
                </div>
                <div className="htq-feedback-info">
                  <span className="htq-feedback-title">
                    {feedback === 'correct' ? 'CHÍNH XÁC!' : 'CHƯA ĐÚNG!'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Instruction */}
          <p className="htq-instruction">
            Nghiêng đầu sang trái hoặc phải để chọn đáp án • Giữ {HOLD_MS / 1000}s để xác nhận
          </p>
        </>
      )}

      {/* Camera Error / Warning Dialog */}
      {cameraError && (
        <div className="htq-modal-backdrop">
          <div className="htq-error-card">
            <div className="htq-error-icon-wrap">
              <AlertTriangle size={36} color="#fbbf24" />
            </div>
            <div className="htq-error-body">
              <h3 className="htq-error-title">Thông Báo Camera</h3>
              <p className="htq-error-message">{cameraError}</p>
            </div>
            <button
              className="htq-error-btn"
              onClick={() => setCameraError(null)}
              autoFocus
            >
              ĐÃ HIỂU & TIẾP TỤC
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal (Cấu hình Google Sheet URL) */}
      {showSettingsModal && (
        <div className="htq-modal-backdrop" style={{ zIndex: 100 }}>
          <div className="htq-error-card" style={{ maxWidth: '540px', width: '90%', textAlign: 'left', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: 'rgba(56, 189, 248, 0.2)', borderRadius: '10px' }}>
                  <Settings size={22} color="#38bdf8" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>Cấu hình Google Sheet</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Nhập link Web App URL Google Apps Script đã triển khai với quyền <em>Anyone (Bất kỳ ai)</em>:
            </p>

            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#fff',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
                marginBottom: '16px',
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveSettings}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
                }}
              >
                Lưu & Tải Lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Music toggle button bottom right */}
      <button
        className={`htq-music-toggle ${isMusicPlaying ? 'htq-music-toggle--playing' : ''}`}
        onClick={toggleMusic}
        title={isMusicPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
        aria-label={isMusicPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
      >
        {isMusicPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>
    </div>
  );
};

export default HeadTiltQuiz;
