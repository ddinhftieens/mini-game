import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2, VolumeX, AlertTriangle, X } from 'lucide-react';
import AICamera, { TiltDirection } from './AICamera';
import './HeadTiltQuiz.css';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: number;
  question: string;
  emoji?: string;
  leftAnswer: { text: string; correct: boolean };
  rightAnswer: { text: string; correct: boolean };
}

interface HeadTiltQuizProps {
  questions?: QuizQuestion[];
}

// ─── Default questions ────────────────────────────────────────────────────────

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Con mèo kêu như thế nào?',
    leftAnswer: { text: 'Gâu gâu', correct: false },
    rightAnswer: { text: 'Meo meo', correct: true },
  },
  {
    id: 2,
    question: 'Kết quả của phép tính: 3 + 4 = ?',
    leftAnswer: { text: '7', correct: true },
    rightAnswer: { text: '8', correct: false },
  },
  {
    id: 3,
    question: 'Loại quả nào thường có vỏ màu vàng khi chín?',
    leftAnswer: { text: 'Táo đỏ', correct: false },
    rightAnswer: { text: 'Chuối chín', correct: true },
  },
  {
    id: 4,
    question: 'Mặt trời thường mọc ở hướng nào?',
    leftAnswer: { text: 'Phía Đông', correct: true },
    rightAnswer: { text: 'Phía Tây', correct: false },
  },
  {
    id: 5,
    question: 'Kết quả của phép tính: 5 × 2 = ?',
    leftAnswer: { text: '10', correct: true },
    rightAnswer: { text: '15', correct: false },
  },
  {
    id: 6,
    question: 'Đâu là loài động vật có khả năng bay lượn?',
    leftAnswer: { text: 'Con chó', correct: false },
    rightAnswer: { text: 'Con chim', correct: true },
  },
  {
    id: 7,
    question: 'Màu sắc đặc trưng của bầu trời vào ngày nắng đẹp là gì?',
    leftAnswer: { text: 'Xanh lam', correct: true },
    rightAnswer: { text: 'Đỏ thắm', correct: false },
  },
  {
    id: 8,
    question: 'Kết quả của phép tính: 12 - 5 = ?',
    leftAnswer: { text: '6', correct: false },
    rightAnswer: { text: '7', correct: true },
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

// ─── Component ────────────────────────────────────────────────────────────────

const HeadTiltQuiz: React.FC<HeadTiltQuizProps> = ({ questions = DEFAULT_QUESTIONS }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // Bộ đếm thời gian từ khi bắt đầu
  const [tiltDir, setTiltDir] = useState<TiltDirection>(null);
  const [heldDir, setHeldDir] = useState<'left' | 'right' | null>(null);
  const [holdProgress, setHoldProgress] = useState(0); // 0-100
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ correct: boolean; dir: 'left' | 'right' }[]>([]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartRef = useRef<number>(0);
  const inCooldownRef = useRef(false);

  // Background Music URL compatible with GitHub Pages base URL
  const bgMusicUrl = `${import.meta.env.BASE_URL || '/'}camera/nhac_nen.mp3`.replace(/\/+/g, '/');

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch((err) => {
        console.warn('Cannot autoplay or play audio:', err);
      });
    }
  };

  const currentQ = questions[currentIndex];

  const clearTimers = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (progressTimer.current) clearInterval(progressTimer.current);
    holdTimer.current = null;
    progressTimer.current = null;
  }, []);

  const selectAnswer = useCallback(
    (dir: 'left' | 'right') => {
      if (inCooldownRef.current) return;
      inCooldownRef.current = true;
      clearTimers();
      setHoldProgress(0);
      setHeldDir(null);

      const q = questions[currentIndex];
      const chosen = dir === 'left' ? q.leftAnswer : q.rightAnswer;
      const isCorrect = chosen.correct;

      setFeedback(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) {
        setScore((s) => s + 1);
        setAnswers((prev) => [...prev, { correct: true, dir }]);
      }

      cooldownTimer.current = setTimeout(() => {
        setFeedback(null);
        setHeldDir(null);
        setHoldProgress(0);
        inCooldownRef.current = false;

        if (isCorrect) {
          // Trả lời đúng -> Chuyển sang câu hỏi tiếp theo an toàn
          setCurrentIndex((prev) => {
            if (prev + 1 >= questions.length) {
              setGameOver(true);
              return prev;
            }
            return prev + 1;
          });
        }
      }, COOLDOWN_MS);
    },
    [questions.length, clearTimers]
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
      if (!cameraReady) setCameraReady(true);
      setTiltDir(dir);

      if (dir === 'left' || dir === 'right') {
        if (inCooldownRef.current) return;
        setHeldDir(dir);
        holdStartRef.current = Date.now();

        clearTimers();

        progressTimer.current = setInterval(() => {
          const elapsed = Date.now() - holdStartRef.current;
          const pct = Math.min((elapsed / HOLD_MS) * 100, 100);
          setHoldProgress(pct);
        }, 30);

        holdTimer.current = setTimeout(() => {
          clearTimers();
          setHoldProgress(0);
          selectAnswer(dir);
        }, HOLD_MS);
      } else {
        clearTimers();
        setHeldDir(null);
        setHoldProgress(0);
      }
    },
    [cameraReady, clearTimers, selectAnswer]
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
        audioRef.current.src = '';
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
    setCurrentIndex(0);
    setScore(0);
    setElapsedTime(0);
    setFeedback(null);
    setGameOver(false);
    setGameStarted(true);
    setAnswers([]);
    setHeldDir(null);
    setHoldProgress(0);
    setTiltDir(null);
  };

  // ── Render: Master Tree ───────────────────────────────────────────────────
  const leftActive = heldDir === 'left';
  const rightActive = heldDir === 'right';
  const total = questions.length;
  const pct = Math.round((score / total) * 100);

  return (
    <div className="htq-root">
      {/* Audio nền duy nhất, tự động phát lặp lại liên tục khi hết bài */}
      <audio
        ref={audioRef}
        src={bgMusicUrl}
        loop
        preload="auto"
      />

      {/* Màn hình Bắt đầu */}
      {!gameStarted && (
        <div className="htq-startcard">
          <div className="htq-startcard-badge">TRÒ CHƠI</div>

          <h1 className="htq-startcard__title">Đố Vui Vận Động</h1>

          <p className="htq-startcard__desc">
            Bé hãy nhìn vào camera và <strong>nghiêng đầu</strong> sang <strong>Trái</strong> hoặc <strong>Phải</strong> để chọn đáp án đúng nhé!
          </p>

          <button
            className="htq-btn htq-btn--start"
            onClick={() => {
              setGameStarted(true);
              setElapsedTime(0);
            }}
          >
            BẮT ĐẦU
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
        <div className="htq-question-badge">
          <span>CÂU HỎI {currentIndex + 1}</span>
        </div>
        <h2 className="htq-question-text">{currentQ.question}</h2>
      </div>

      {/* Main area: answer + camera + answer */}
      <div className="htq-arena">
        {/* Left Answer */}
        <div
          onClick={() => handleTilt('left')}
          role="button"
          tabIndex={0}
          className={`htq-answer-card htq-answer-card--left
            ${leftActive ? 'htq-answer-card--active' : ''}
            ${feedback && heldDir === 'left' ? `htq-answer-card--${feedback}` : ''}
          `}
        >
          <div className="htq-answer-side-indicator">
            <span className="htq-key-tag">Trái</span>
            <span className="htq-arrow-icon">◀</span>
          </div>
          <div className="htq-answer-content">
            <div className="htq-answer-text">{currentQ.leftAnswer.text}</div>
          </div>
          {leftActive && (
            <div className="htq-hold-ring">
              <svg viewBox="0 0 36 36" className="htq-ring-svg">
                <circle
                  className="htq-ring-bg"
                  cx="18" cy="18" r="15.9"
                  fill="none"
                  strokeWidth="3.5"
                />
                <circle
                  className="htq-ring-fill"
                  cx="18" cy="18" r="15.9"
                  fill="none"
                  strokeWidth="3.5"
                  strokeDasharray={`${holdProgress} 100`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Camera Center */}
        <div className="htq-camera-wrap">
          <div className={`htq-camera-ring htq-camera-ring--${tiltDir ?? 'center'}`}>
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
          onClick={() => handleTilt('right')}
          role="button"
          tabIndex={0}
          className={`htq-answer-card htq-answer-card--right
            ${rightActive ? 'htq-answer-card--active' : ''}
            ${feedback && heldDir === 'right' ? `htq-answer-card--${feedback}` : ''}
          `}
        >
          <div className="htq-answer-side-indicator">
            <span className="htq-key-tag">Phải</span>
            <span className="htq-arrow-icon">▶</span>
          </div>
          <div className="htq-answer-content">
            <div className="htq-answer-text">{currentQ.rightAnswer.text}</div>
          </div>
          {rightActive && (
            <div className="htq-hold-ring">
              <svg viewBox="0 0 36 36" className="htq-ring-svg">
                <circle
                  className="htq-ring-bg"
                  cx="18" cy="18" r="15.9"
                  fill="none"
                  strokeWidth="3.5"
                />
                <circle
                  className="htq-ring-fill"
                  cx="18" cy="18" r="15.9"
                  fill="none"
                  strokeWidth="3.5"
                  strokeDasharray={`${holdProgress} 100`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
            </div>
          )}
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
