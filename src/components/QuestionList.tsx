import React, { useEffect, useRef } from 'react';
import { QuestionItem } from '../types';
import { CheckCircle2, CircleDot, XCircle, Lock, Trophy } from 'lucide-react';

interface QuestionListProps {
  questions: QuestionItem[];
  currentIndex: number;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  currentIndex,
}) => {
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn đến câu hỏi hiện tại để người chơi dễ quan sát tiến trình
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentIndex]);

  const correctCount = questions.filter(q => q.status === 'correct').length;
  const progressPercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '24px',
      padding: '14px 12px',
      boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08)',
      border: '3px solid #ffffff',
      backdropFilter: 'blur(12px)',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Header Tiến Trình */}
      <div style={{
        paddingBottom: '10px',
        borderBottom: '2px dashed #e2e8f0',
        marginBottom: '10px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            margin: 0,
            whiteSpace: 'nowrap',
          }}>
            <Trophy size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
            <span>Lộ Trình Thử Thách</span>
          </h2>
          <span style={{
            fontSize: '0.92rem',
            fontWeight: 800,
            color: '#3b82f6',
            background: '#eff6ff',
            padding: '3px 10px',
            borderRadius: '10px',
            flexShrink: 0,
          }}>
            {correctCount}/{questions.length}
          </span>
        </div>

        {/* Thanh tiến độ mini */}
        <div style={{
          width: '100%',
          height: '6px',
          background: '#f1f5f9',
          borderRadius: '999px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #10b981)',
            borderRadius: '999px',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
      </div>

      {/* Danh sách các câu hỏi - Chế độ quan sát (Read-only) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '9px',
        overflowY: 'auto',
        overflowX: 'hidden',
        flex: 1,
        padding: '2px 2px 2px 0px',
        boxSizing: 'border-box',
      }}>
        {questions.map((q, idx) => {
          const isActive = idx === currentIndex;
          const isDone = q.status === 'correct';
          const isFailed = q.status === 'wrong';
          const isPastOrCurrent = idx <= currentIndex || isDone || isFailed;

          let bg = '#f8fafc';
          let border = '#e2e8f0';
          let badgeBg = '#f1f5f9';
          let badgeColor = '#94a3b8';
          let icon = <Lock size={16} color="#cbd5e1" style={{ flexShrink: 0 }} />;

          if (isDone) {
            bg = 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
            border = '#86efac';
            badgeBg = '#22c55e';
            badgeColor = '#ffffff';
            icon = <CheckCircle2 size={19} color="#16a34a" style={{ flexShrink: 0 }} />;
          } else if (isFailed) {
            bg = 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';
            border = '#fca5a5';
            badgeBg = '#ef4444';
            badgeColor = '#ffffff';
            icon = <XCircle size={19} color="#dc2626" style={{ flexShrink: 0 }} />;
          }

          if (isActive) {
            border = '#3b82f6';
            bg = 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)';
            badgeBg = '#2563eb';
            badgeColor = '#ffffff';
            icon = <CircleDot size={19} color="#2563eb" style={{ flexShrink: 0 }} />;
          }

          return (
            <div
              key={q.id}
              ref={isActive ? activeItemRef : null}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '14px',
                background: bg,
                border: `1.5px solid ${border}`,
                boxShadow: isActive
                  ? '0 3px 10px rgba(59, 130, 246, 0.2)'
                  : '0 1px 3px rgba(0,0,0,0.02)',
                userSelect: 'none',
                cursor: 'default',
                transition: 'all 0.2s ease',
                opacity: isPastOrCurrent ? 1 : 0.65,
                boxSizing: 'border-box',
                width: '100%',
                minHeight: '52px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: badgeBg,
                  color: badgeColor,
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none',
                  flexShrink: 0,
                }}>
                  {idx + 1}
                </span>

                {/* Nội dung câu hỏi: CHỈ hiện khi đã tới câu đó hoặc câu trước, câu chưa tới thì ẩn đi */}
                {isPastOrCurrent ? (
                  <div
                    style={{
                      fontSize: '1.02rem',
                      fontWeight: 700,
                      color: isActive ? '#1e3a8a' : '#1e293b',
                      lineHeight: 1.35,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      wordBreak: 'break-word',
                      minWidth: 0,
                      flex: 1,
                    }}
                    title={q.question}
                  >
                    {q.question}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontStyle: 'italic',
                      color: '#94a3b8',
                      fontWeight: 600,
                      userSelect: 'none',
                    }}
                  >
                    Câu hỏi chưa mở khóa...
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginLeft: '6px', flexShrink: 0 }}>
                {icon}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
