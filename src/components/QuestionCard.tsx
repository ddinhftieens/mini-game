import React, { useState, useEffect, useRef } from 'react';
import { QuestionItem } from '../types';
import { Sparkles, AlertCircle, CheckCircle, Timer, Star } from 'lucide-react';
import { playSound } from '../utils/helpers';

interface QuestionCardProps {
  question: QuestionItem;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (selectedOption: 'A' | 'B' | 'C' | 'D') => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
}) => {
  const [animatingWrong, setAnimatingWrong] = useState(false);
  // State đếm ngược 5 giây hồi hộp
  const [pendingOption, setPendingOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Ref riêng để cleanup timeout animate-shake (sai đáp án)
  const wrongAnimTimerRef = useRef<NodeJS.Timeout | null>(null);

  const options: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  // Reset khi chuyển câu hỏi mới
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
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
        padding: '24px',
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
        marginBottom: '16px',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          color: '#1d4ed8',
          padding: '8px 16px',
          borderRadius: '14px',
          fontWeight: 900,
          fontSize: '0.95rem',
          border: '1.5px solid #bfdbfe',
          boxShadow: '0 2px 6px rgba(59, 130, 246, 0.1)',
        }}>
          <span>CÂU HỎI {currentIndex + 1} / {totalQuestions}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: question.difficulty === 1 ? '#dcfce7' : question.difficulty === 2 ? '#fef9c3' : '#fee2e2',
            color: question.difficulty === 1 ? '#15803d' : question.difficulty === 2 ? '#a16207' : '#b91c1c',
            border: `1.5px solid ${question.difficulty === 1 ? '#86efac' : question.difficulty === 2 ? '#fde047' : '#fca5a5'}`,
            padding: '6px 14px',
            borderRadius: '14px',
            fontSize: '0.92rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              {Array.from({ length: question.difficulty || 1 }).map((_, i) => (
                <Star
                  key={i}
                  size={15}
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
        borderRadius: '18px',
        padding: '16px 22px',
        marginBottom: '14px',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
      }}>
        <p style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#0f172a',
          lineHeight: 1.5,
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
          gridAutoRows: '1fr',
          gap: '14px',
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
          let shadow = '0 4px 0 #cbd5e1, 0 6px 16px rgba(0, 0, 0, 0.04)';

          if (isPendingSelection) {
            btnBg = 'linear-gradient(145deg, #fefce8 0%, #fef08a 100%)';
            borderCol = '#f59e0b';
            badgeBg = '#d97706';
            badgeColor = '#ffffff';
            shadow = '0 0 0 4px rgba(245, 158, 11, 0.3), 0 8px 24px rgba(245, 158, 11, 0.35)';
          } else if (isAnswerCorrect) {
            btnBg = 'linear-gradient(145deg, #dcfce7 0%, #bbf7d0 100%)';
            borderCol = '#22c55e';
            badgeBg = '#16a34a';
            badgeColor = '#ffffff';
            textColor = '#14532d';
            shadow = '0 5px 0 #16a34a, 0 12px 24px rgba(34, 197, 94, 0.3)';
          } else if (isAnswerWrong) {
            btnBg = 'linear-gradient(145deg, #fee2e2 0%, #fecaca 100%)';
            borderCol = '#ef4444';
            badgeBg = '#dc2626';
            badgeColor = '#ffffff';
            textColor = '#7f1d1d';
            shadow = '0 5px 0 #dc2626, 0 12px 24px rgba(239, 68, 68, 0.3)';
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
                padding: '16px 20px',
                borderRadius: '20px',
                background: btnBg,
                border: `2.5px solid ${borderCol}`,
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
              }}
              onMouseEnter={(e) => {
                if (!isDoneCorrect && !isCountingDown) {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.boxShadow = '0 6px 0 #94a3b8, 0 12px 22px rgba(0,0,0,0.08)';
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
                  width: '36px',
                  height: '36px',
                  borderRadius: '11px',
                  background: badgeBg,
                  color: badgeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
                  letterSpacing: '-0.5px',
                }}>
                  {opt}
                </div>

                {/* Nhãn đếm ngược hồi hộp 5s */}
                {isPendingSelection && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#d97706',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.4)',
                    animation: 'bounceSlow 1s infinite',
                  }}>
                    <Timer size={16} />
                    <span>{countdown}s</span>
                  </div>
                )}

                {/* Icon trạng thái khi chọn xong */}
                {isAnswerCorrect && !isCountingDown && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#22c55e',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)',
                  }}>
                    <CheckCircle size={16} color="#ffffff" />
                    <span>Chính xác</span>
                  </div>
                )}
                {isAnswerWrong && !isCountingDown && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ef4444',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                  }}>
                    <AlertCircle size={16} color="#ffffff" />
                    <span>Chưa chính xác</span>
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
                padding: '12px 4px',
                width: '100%',
              }}>
                <span style={{
                  fontSize: optText.length > 20 ? '1.25rem' : '1.6rem',
                  fontWeight: 800,
                  color: textColor,
                  lineHeight: 1.35,
                  fontFamily: "'Times New Roman', Times, serif",
                  letterSpacing: '0.2px',
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
          marginTop: '16px',
          padding: '14px 18px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2.5px solid #f59e0b',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 6px 18px rgba(245, 158, 11, 0.2)',
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: '#d97706',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.25rem',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.4)',
          }}>
            {countdown}
          </div>
          <span style={{ color: '#92400e', fontWeight: 800, fontSize: '0.98rem' }}>
            ⏳ Đang kiểm tra đáp án... Con hãy chờ trong giây lát nhé! ({countdown} giây)
          </span>
        </div>
      )}

      {/* Thông báo kết quả / Giải thích (Chỉ hiện sau khi hết 5s đếm ngược) */}
      {!isCountingDown && (isDoneCorrect || isWrongAttempt) && (
        <div style={{
          marginTop: '16px',
          padding: '14px 18px',
          borderRadius: '18px',
          background: isDoneCorrect
            ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
            : 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
          border: `2.5px solid ${isDoneCorrect ? '#34d399' : '#f87171'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: isDoneCorrect
            ? '0 6px 18px rgba(16, 185, 129, 0.15)'
            : '0 6px 18px rgba(244, 63, 94, 0.15)',
        }}>
          {isDoneCorrect ? (
            <>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Sparkles size={20} color="#ffffff" />
              </div>
              <span style={{ color: '#065f46', fontWeight: 800, fontSize: '0.98rem' }}>
                Chính xác! Con giỏi quá!
              </span>
            </>
          ) : (
            <>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <AlertCircle size={20} color="#ffffff" />
              </div>
              <span style={{ color: '#9f1239', fontWeight: 800, fontSize: '0.98rem' }}>
                Chưa chính xác rồi! Con hãy suy nghĩ và chọn lại nhé!
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
