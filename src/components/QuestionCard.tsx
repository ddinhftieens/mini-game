import React, { useState, useEffect, useRef } from 'react';
import { QuestionItem } from '../types';
import { Sparkles, AlertCircle, CheckCircle, Timer, Star, Clock } from 'lucide-react';
import { playSound, formatElapsedTime } from '../utils/helpers';

interface QuestionCardProps {
  question: QuestionItem;
  currentIndex: number;
  totalQuestions: number;
  elapsedSeconds?: number;
  onAnswer: (selectedOption: 'A' | 'B' | 'C' | 'D') => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  elapsedSeconds = 0,
  onAnswer,
}) => {

  const [animatingWrong, setAnimatingWrong] = useState(false);
  // State đếm ngược 5 giây hồi hộp
  const [pendingOption, setPendingOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref riêng để cleanup timeout animate-shake (sai đáp án)
  const wrongAnimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const options: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  // Reset khi chuyển câu hỏi mới
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Cancel cả timeout animate-shake khỏi động lại sớm
    if (wrongAnimTimerRef.current) {
      clearTimeout(wrongAnimTimerRef.current);
      wrongAnimTimerRef.current = null;
      setAnimatingWrong(false);
    }
    setPendingOption(null);
    setCountdown(null);
  }, [currentIndex, question.id]);

  // Logic đếm ngược 5 giây
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      playSound('countdown');
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0 && pendingOption) {
      // Kết thúc 5s -> Kiểm tra kết quả
      const opt = pendingOption;
      setPendingOption(null);
      setCountdown(null);

      if (opt !== question.answer) {
        setAnimatingWrong(true);
        // Lưu ref để cancel nếu cần (chuyển câu trước 500ms)
        if (wrongAnimTimerRef.current) clearTimeout(wrongAnimTimerRef.current);
        wrongAnimTimerRef.current = setTimeout(() => {
          wrongAnimTimerRef.current = null;
          setAnimatingWrong(false);
        }, 500);
      }
      onAnswer(opt);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown, pendingOption]);

  const handleSelect = (opt: 'A' | 'B' | 'C' | 'D') => {
    // Nếu câu này đã hoàn thành đúng rồi hoặc đang trong lúc đếm ngược 5s thì không bấm lại
    if (question.status === 'correct' || countdown !== null) return;

    // Bắt đầu đếm ngược 5s hồi hộp
    setPendingOption(opt);
    setCountdown(5);
  };

  const isDoneCorrect = question.status === 'correct';
  const isWrongAttempt = question.status === 'wrong';
  const isCountingDown = countdown !== null;

  return (
    <div
      className={animatingWrong ? 'animate-shake' : 'animate-pop'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'rgba(255, 255, 255, 0.96)',
        borderRadius: '24px',
        padding: 'clamp(14px, 2.5vw, 22px)',
        boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08)',
        border: '3px solid #ffffff',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Top Header Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'clamp(8px, 1.5vh, 14px)',
        flexWrap: 'wrap',
        gap: '8px',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          color: '#1d4ed8',
          padding: '6px 12px',
          borderRadius: '12px',
          fontWeight: 900,
          fontSize: 'clamp(0.8rem, 1.8vw, 0.92rem)',
          border: '1.5px solid #bfdbfe',
          boxShadow: '0 2px 6px rgba(59, 130, 246, 0.1)',
        }}>
          <span>CÂU HỎI {currentIndex + 1} / {totalQuestions}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Bộ đếm thời gian làm thử thách */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              color: '#92400e',
              border: '1.5px solid #fcd34d',
              padding: '5px 10px',
              borderRadius: '12px',
              fontSize: 'clamp(0.78rem, 1.8vw, 0.88rem)',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.15)',
              fontFamily: 'monospace',
            }}
            title="Thời gian làm thử thách"
          >
            <Clock size={15} color="#d97706" />
            <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
              {formatElapsedTime(elapsedSeconds)}
            </span>
          </div>

          <span style={{
            background: question.difficulty === 1 ? '#dcfce7' : question.difficulty === 2 ? '#fef9c3' : '#fee2e2',
            color: question.difficulty === 1 ? '#15803d' : question.difficulty === 2 ? '#a16207' : '#b91c1c',
            border: `1.5px solid ${question.difficulty === 1 ? '#86efac' : question.difficulty === 2 ? '#fde047' : '#fca5a5'}`,
            padding: '5px 10px',
            borderRadius: '12px',
            fontSize: 'clamp(0.78rem, 1.8vw, 0.88rem)',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              {Array.from({ length: question.difficulty || 1 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={question.difficulty === 1 ? '#16a34a' : question.difficulty === 2 ? '#d97706' : '#dc2626'}
                  color={question.difficulty === 1 ? '#16a34a' : question.difficulty === 2 ? '#d97706' : '#dc2626'}
                />
              ))}
            </span>
            <span>
              {question.difficulty === 1 ? 'Dễ' : question.difficulty === 2 ? 'Vừa' : 'Khó'}
            </span>
          </span>
        </div>
      </div>

      {/* Khối nội dung câu hỏi */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
        border: '2px solid #86efac',
        borderRadius: '16px',
        padding: 'clamp(12px, 2vh, 18px) clamp(14px, 2.5vw, 20px)',
        marginBottom: 'clamp(10px, 1.5vh, 14px)',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
        flexShrink: 0,
      }}>
        <p style={{
          fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)',
          fontWeight: 700,
          color: '#0f172a',
          lineHeight: 1.45,
          fontFamily: "'Times New Roman', Times, serif",
          margin: 0,
        }}>
          {question.question}
        </p>
      </div>

      {/* Lưới 4 Đáp án A, B, C, D */}
      <div
        className="question-options-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'clamp(8px, 1.5vh, 12px)',
          flex: 1,
          minHeight: 0,
        }}
      >
        {options.map((opt) => {
          const optText = question[opt];
          const isSelected = question.selectedAnswer === opt;
          const isPendingSelection = pendingOption === opt;

          // CHỈ HIỆN ĐÁP ÁN ĐÚNG KHI BÉ CHỌN ĐÚNG
          const isAnswerCorrect = isDoneCorrect && opt === question.answer;
          // KHI CHỌN SAI: CHỈ BÁO ĐỎ KHI KHÔNG TRONG LÚC ĐANG ĐẾM NGƯỢC CÂU MỚI (Tự động reset khi chọn lại)
          const isAnswerWrong = !isCountingDown && isWrongAttempt && isSelected;

          // Màu sắc cơ bản đồng bộ, sang trọng cho tất cả các đáp án
          let btnBg = '#ffffff';
          let borderCol = '#cbd5e1';
          let badgeBg = '#475569';
          let badgeColor = '#ffffff';
          let textColor = '#1e293b';
          let shadow = '0 3px 0 #cbd5e1, 0 4px 12px rgba(0, 0, 0, 0.04)';

          if (isPendingSelection) {
            btnBg = 'linear-gradient(145deg, #fefce8 0%, #fef08a 100%)';
            borderCol = '#f59e0b';
            badgeBg = '#d97706';
            badgeColor = '#ffffff';
            shadow = '0 0 0 3px rgba(245, 158, 11, 0.3), 0 6px 18px rgba(245, 158, 11, 0.35)';
          } else if (isAnswerCorrect) {
            btnBg = 'linear-gradient(145deg, #dcfce7 0%, #bbf7d0 100%)';
            borderCol = '#22c55e';
            badgeBg = '#16a34a';
            badgeColor = '#ffffff';
            textColor = '#14532d';
            shadow = '0 4px 0 #16a34a, 0 8px 18px rgba(34, 197, 94, 0.3)';
          } else if (isAnswerWrong) {
            btnBg = 'linear-gradient(145deg, #fee2e2 0%, #fecaca 100%)';
            borderCol = '#ef4444';
            badgeBg = '#dc2626';
            badgeColor = '#ffffff';
            textColor = '#7f1d1d';
            shadow = '0 4px 0 #dc2626, 0 8px 18px rgba(239, 68, 68, 0.3)';
          }

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={isDoneCorrect || isCountingDown}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 'clamp(8px, 1.5vh, 14px) clamp(10px, 1.5vw, 16px)',
                borderRadius: '16px',
                background: btnBg,
                border: `2px solid ${borderCol}`,
                cursor: (isDoneCorrect || isCountingDown) ? 'default' : 'pointer',
                boxShadow: shadow,
                transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                overflow: 'hidden',
                opacity: (isDoneCorrect && !isAnswerCorrect) || (isCountingDown && !isPendingSelection) ? 0.5 : 1,
                transform: isPendingSelection ? 'scale(1.02)' : 'scale(1)',
                minHeight: 'clamp(60px, 10vh, 100px)',
              }}
              onMouseEnter={(e) => {
                if (!isDoneCorrect && !isCountingDown) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.boxShadow = '0 5px 0 #94a3b8, 0 8px 16px rgba(0,0,0,0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDoneCorrect && !isCountingDown) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = borderCol;
                  e.currentTarget.style.boxShadow = shadow;
                }
              }}
            >
              {/* Header của từng thẻ: Huy hiệu A/B/C/D đồng nhất, đơn giản */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}>
                <div style={{
                  width: 'clamp(28px, 4vh, 34px)',
                  height: 'clamp(28px, 4vh, 34px)',
                  borderRadius: '9px',
                  background: badgeBg,
                  color: badgeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
                  fontWeight: 900,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                  letterSpacing: '-0.5px',
                  flexShrink: 0,
                }}>
                  {opt}
                </div>

                {/* Nhãn đếm ngược hồi hộp 5s */}
                {isPendingSelection && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#d97706',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '16px',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.4)',
                    animation: 'bounceSlow 1s infinite',
                  }}>
                    <Timer size={14} />
                    <span>{countdown}s</span>
                  </div>
                )}

                {/* Icon trạng thái khi chọn xong */}
                {isAnswerCorrect && !isCountingDown && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#22c55e',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 6px rgba(34, 197, 94, 0.4)',
                  }}>
                    <CheckCircle size={14} color="#ffffff" />
                    <span>Chính xác</span>
                  </div>
                )}
                {isAnswerWrong && !isCountingDown && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#ef4444',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                  }}>
                    <AlertCircle size={14} color="#ffffff" />
                    <span>Sai</span>
                  </div>
                )}
              </div>

              {/* Phần nội dung câu trả lời - Đặt ở trung tâm thẻ, chữ to & đậm nét */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '6px 2px',
                width: '100%',
              }}>
                <span style={{
                  fontSize: optText.length > 24 ? 'clamp(0.95rem, 1.8vw, 1.15rem)' : 'clamp(1.1rem, 2.2vw, 1.45rem)',
                  fontWeight: 800,
                  color: textColor,
                  lineHeight: 1.3,
                  fontFamily: "'Times New Roman', Times, serif",
                  letterSpacing: '0.2px',
                  wordBreak: 'break-word',
                }}>
                  {optText}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Thông báo hồi hộp trong 5s đếm ngược */}
      {isCountingDown && (
        <div style={{
          marginTop: 'clamp(8px, 1.5vh, 14px)',
          padding: '10px 14px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #f59e0b',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.15)',
          flexShrink: 0,
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: '#d97706',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.1rem',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(217, 119, 6, 0.4)',
          }}>
            {countdown}
          </div>
          <span style={{ color: '#92400e', fontWeight: 800, fontSize: 'clamp(0.82rem, 1.8vw, 0.92rem)' }}>
            ⏳ Đang kiểm tra đáp án... Chờ giây lát nhé! ({countdown}s)
          </span>
        </div>
      )}

      {/* Thông báo kết quả / Giải thích (Chỉ hiện sau khi hết 5s đếm ngược) */}
      {!isCountingDown && (isDoneCorrect || isWrongAttempt) && (
        <div style={{
          marginTop: 'clamp(8px, 1.5vh, 14px)',
          padding: '10px 14px',
          borderRadius: '14px',
          background: isDoneCorrect
            ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
            : 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
          border: `2px solid ${isDoneCorrect ? '#34d399' : '#f87171'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: isDoneCorrect
            ? '0 4px 14px rgba(16, 185, 129, 0.12)'
            : '0 4px 14px rgba(244, 63, 94, 0.12)',
          flexShrink: 0,
        }}>
          {isDoneCorrect ? (
            <>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Sparkles size={18} color="#ffffff" />
              </div>
              <span style={{ color: '#065f46', fontWeight: 800, fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)' }}>
                Chính xác! Con giỏi quá!
              </span>
            </>
          ) : (
            <>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <AlertCircle size={18} color="#ffffff" />
              </div>
              <span style={{ color: '#9f1239', fontWeight: 800, fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)' }}>
                Chưa chính xác rồi! Con hãy suy nghĩ và chọn lại nhé!
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

