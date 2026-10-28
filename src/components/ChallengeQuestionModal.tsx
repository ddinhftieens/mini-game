import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// ============================================================
// KIỂU DỮ LIỆU CHO TỪNG LOẠI THỬ THÁCH
// ============================================================

/** Thử thách 1: Luyện đọc nhiều vần + từ ngữ */
export interface ChallengeTypeRhymes {
  type: 'rhymes';
  rhymes: Array<{
    rhyme: string;   // Vần, ví dụ: 'at'
    words: string[]; // Các từ ứng dụng
  }>;
}

/** Thử thách 2: Câu đố với đáp án ẩn */
export interface ChallengeTypeRiddle {
  type: 'riddle';
  lines: string[]; // Các dòng câu đố
  answer: string;  // Đáp án
}

/** Thử thách 3: Bài đọc ngắn */
export interface ChallengeTypePassage {
  type: 'passage';
  text: string; // Đoạn văn
}

export type ChallengeContent =
  | ChallengeTypeRhymes
  | ChallengeTypeRiddle
  | ChallengeTypePassage;

export interface ChallengeReadingData {
  id: number;
  step: 1 | 2 | 3;
  stepTitle: string;
  content: ChallengeContent;
}

// ============================================================
// CÁC COMPONENT NỘI DUNG THEO TỪNG LOẠI
// ============================================================

/** Thử thách 1: Hiển thị nhiều nhóm vần + từ ngữ */
function RhymesContent({ data }: { data: ChallengeTypeRhymes }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '100%',
    }}>
      {data.rhymes.map((group, idx) => (
        <div key={idx} style={{
          width: '100%',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '2.5px solid #facc15',
          boxShadow: '0 6px 20px rgba(234, 179, 8, 0.18)',
        }}>
          {/* Vần chính */}
          <div style={{
            background: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{
              fontSize: 'clamp(2rem, 7vw, 2.8rem)',
              fontWeight: 900,
              color: '#b45309',
              lineHeight: 1,
              letterSpacing: '2px',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              minWidth: '60px',
              textAlign: 'center',
            }}>
              {group.rhyme}
            </span>
            {/* Dải phân cách dọc */}
            <div style={{ width: '2px', height: '40px', background: 'rgba(180,130,0,0.25)', borderRadius: '1px' }} />
            {/* Các từ ngữ */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              flex: 1,
            }}>
              {group.words.map((word, wIdx) => (
                <div key={wIdx} style={{
                  padding: '7px 18px',
                  borderRadius: '12px',
                  background: '#fff',
                  border: '2px solid #fde68a',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                }}>
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Thử thách 2: Câu đố với nút hé lộ đáp án */
function RiddleContent({ data }: { data: ChallengeTypeRiddle }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      width: '100%',
    }}>
      {/* Khung câu đố */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '2.5px solid #93c5fd',
        borderRadius: '20px',
        padding: '20px 24px',
        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.14)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '1.5rem',
          marginBottom: '12px',
        }}>
          🤔
        </div>
        {data.lines.map((line, idx) => (
          <p key={idx} style={{
            margin: idx === 0 ? 0 : '4px 0 0',
            fontSize: 'clamp(1.05rem, 3vw, 1.3rem)',
            fontWeight: 800,
            color: '#1e40af',
            lineHeight: 1.65,
            fontStyle: 'italic',
          }}>
            {line}
          </p>
        ))}
      </div>

      {/* Nút hé lộ / hiển thị đáp án */}
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          style={{
            padding: '12px 32px',
            borderRadius: '16px',
            border: '2px solid #f59e0b',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            color: '#fff',
            fontWeight: 900,
            fontSize: '1.05rem',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>💡</span>
          <span>Xem đáp án</span>
        </button>
      ) : (
        <div style={{
          padding: '14px 36px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2.5px solid #4ade80',
          boxShadow: '0 6px 20px rgba(34, 197, 94, 0.2)',
          animation: 'answerReveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Đáp án
          </div>
          <div style={{
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            fontWeight: 900,
            color: '#15803d',
            letterSpacing: '1px',
          }}>
            {data.answer}
          </div>
        </div>
      )}
    </div>
  );
}

/** Thử thách 3: Đoạn văn ngắn */
function PassageContent({ data }: { data: ChallengeTypePassage }) {
  // Tô sáng các từ chứa vần 'at' / 'ăt' / 'ât' trong đoạn văn
  const highlightPattern = /([\wÀ-ỹ]*(?:at|ăt|ât)[\wÀ-ỹ]*)/gu;

  const renderHighlighted = (text: string) => {
    const parts = text.split(highlightPattern);
    // Sau khi split với capturing group, các phần tử ở vị trí lẻ là match của group
    return parts.map((part, idx) => {
      const isMatch = idx % 2 === 1;
      return isMatch ? (
        <mark key={idx} style={{
          background: 'linear-gradient(135deg, #fef08a, #fde047)',
          borderRadius: '4px',
          padding: '0 2px',
          color: '#92400e',
          fontWeight: 900,
        }}>
          {part}
        </mark>
      ) : (
        <span key={idx}>{part}</span>
      );
    });
  };

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)',
      border: '2.5px solid #a5b4fc',
      borderRadius: '20px',
      padding: '20px 24px',
      boxShadow: '0 6px 20px rgba(99, 102, 241, 0.12)',
    }}>
      <div style={{
        fontSize: '0.8rem',
        fontWeight: 700,
        color: '#6366f1',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span>📖</span>
        <span>Bài đọc</span>
      </div>
      <p style={{
        margin: 0,
        fontSize: 'clamp(1.1rem, 3vw, 1.35rem)',
        fontWeight: 700,
        color: '#1e293b',
        lineHeight: 1.9,
        textAlign: 'left',
      }}>
        {renderHighlighted(data.text)}
      </p>
    </div>
  );
}

// ============================================================
// COMPONENT MODAL CHÍNH
// ============================================================
interface ChallengeQuestionModalProps {
  readingData: ChallengeReadingData;
  onClose: () => void;
}

export const ChallengeQuestionModal: React.FC<ChallengeQuestionModalProps> = ({
  readingData,
  onClose,
}) => {
  // Lắng nghe phím Escape để đóng nhanh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const { content } = readingData;

  return (
    <div style={{
      width: '100%',
      maxWidth: '680px',
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      borderRadius: '28px',
      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.4)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      border: '3px solid #ffffff',
      animation: 'challengePopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      userSelect: 'none',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: 'clamp(1.05rem, 3.5vw, 1.2rem)',
            fontWeight: 900,
            color: '#fef08a',
            letterSpacing: '0.3px',
          }}>
            Thử Thách {readingData.step}: {readingData.stepTitle}
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            {content.type === 'rhymes' && 'Con hãy đọc to các vần và từ ngữ nhé!'}
            {content.type === 'riddle' && 'Con hãy đọc câu đố và đoán xem là gì nhé!'}
            {content.type === 'passage' && 'Con hãy đọc to, rõ ràng đoạn văn nhé!'}
          </span>
        </div>

        {/* Nút Đóng */}
        <button
          onClick={onClose}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          title="Đóng bài đọc"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nội dung theo từng loại thử thách */}
      <div style={{
        padding: '20px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        maxHeight: '70vh',
        overflowY: 'auto',
      }}>
        {content.type === 'rhymes' && <RhymesContent data={content} />}
        {content.type === 'riddle' && <RiddleContent data={content} />}
        {content.type === 'passage' && <PassageContent data={content} />}

        {/* Nút Hoàn thành */}
        <button
          onClick={onClose}
          style={{
            marginTop: '4px',
            padding: '11px 36px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '1.05rem',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          Hoàn thành ✓
        </button>
      </div>

      <style>{`
        @keyframes challengePopIn {
          0%   { opacity: 0; transform: scale(0.92) translateY(12px); }
          100% { opacity: 1; transform: scale(1)    translateY(0px);  }
        }
        @keyframes answerReveal {
          0%   { opacity: 0; transform: scale(0.88); }
          100% { opacity: 1; transform: scale(1);    }
        }
      `}</style>
    </div>
  );
};
