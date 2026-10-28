import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Sun,
  Flame,
  Palmtree,
  BookA,
  Speech,
  CheckCircle2,
  BookOpen,
  RotateCcw
} from 'lucide-react';

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
  image?: string;  // Hình ảnh minh họa cho đáp án
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

/** 
 * Thử thách 1: Bố cục 2 HÀNG RÕ RÀNG
 * - Hàng 1: Các vần (at, ăt, ât) xếp ngang cân xứng
 * - Hàng 2: Các từ ứng dụng (bãi cát, mặt trời, bật lửa) xếp ngang tương ứng với SVG icons hiện đại
 */
function RhymesContent({ data }: { data: ChallengeTypeRhymes }) {
  const itemThemes = [
    {
      rhymeBg: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
      rhymeShadow: '0 8px 20px rgba(234, 88, 12, 0.28)',
      wordCardBg: 'linear-gradient(145deg, #ffffff 0%, #fffbeb 60%, #fef3c7 100%)',
      wordBorder: '#f59e0b',
      wordColor: '#9a3412',
      wordShadow: '0 6px 18px rgba(245, 158, 11, 0.15)',
      renderIcon: () => (
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 3px 8px rgba(217, 119, 6, 0.25)',
          border: '1.5px solid #f59e0b',
        }}>
          <Palmtree size={22} color="#d97706" strokeWidth={2.2} />
        </div>
      ),
    },
    {
      rhymeBg: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
      rhymeShadow: '0 8px 20px rgba(220, 38, 38, 0.28)',
      wordCardBg: 'linear-gradient(145deg, #ffffff 0%, #fef2f2 60%, #fee2e2 100%)',
      wordBorder: '#f87171',
      wordColor: '#991b1b',
      wordShadow: '0 6px 18px rgba(239, 68, 68, 0.15)',
      renderIcon: () => (
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 3px 8px rgba(220, 38, 38, 0.25)',
          border: '1.5px solid #ef4444',
        }}>
          <Sun size={22} color="#dc2626" strokeWidth={2.2} />
        </div>
      ),
    },
    {
      rhymeBg: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
      rhymeShadow: '0 8px 20px rgba(37, 99, 235, 0.28)',
      wordCardBg: 'linear-gradient(145deg, #ffffff 0%, #eff6ff 60%, #dbeafe 100%)',
      wordBorder: '#60a5fa',
      wordColor: '#1e40af',
      wordShadow: '0 6px 18px rgba(59, 130, 246, 0.15)',
      renderIcon: () => (
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 3px 8px rgba(37, 99, 235, 0.25)',
          border: '1.5px solid #3b82f6',
        }}>
          <Flame size={22} color="#2563eb" strokeWidth={2.2} />
        </div>
      ),
    },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: '100%',
      padding: '2px 0',
    }}>
      {/* HÀNG 1: CÁC VẦN */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        padding: '16px 18px',
        borderRadius: '24px',
        border: '1.5px solid #e2e8f0',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
        boxSizing: 'border-box',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#334155',
          fontSize: '0.9rem',
          fontWeight: 800,
          letterSpacing: '0.5px',
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 5px rgba(37, 99, 235, 0.3)',
          }}>
            <BookA size={16} strokeWidth={2.5} />
          </div>
          <span>1. Các vần cần đọc:</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${data.rhymes.length}, minmax(0, 1fr))`,
          gap: '14px',
          width: '100%',
        }}>
          {data.rhymes.map((item, idx) => {
            const theme = itemThemes[idx % itemThemes.length];
            return (
              <div
                key={idx}
                className="challenge-tile-hover"
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 10px',
                  borderRadius: '20px',
                  background: theme.rhymeBg,
                  border: '2.5px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: theme.rhymeShadow,
                  cursor: 'default',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '65px',
                  height: '65px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <span style={{
                  fontSize: 'clamp(2.4rem, 6.5vw, 3.2rem)',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1,
                  letterSpacing: '1.5px',
                  fontFamily: '"Nunito", "Quicksand", system-ui, sans-serif',
                  textShadow: '0 3px 8px rgba(0,0,0,0.25)',
                }}>
                  {item.rhyme}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* HÀNG 2: CÁC TỪ NGỮ ỨNG DỤNG */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        padding: '16px 18px',
        borderRadius: '24px',
        border: '1.5px solid #e2e8f0',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
        boxSizing: 'border-box',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#334155',
          fontSize: '0.9rem',
          fontWeight: 800,
          letterSpacing: '0.5px',
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 5px rgba(16, 185, 129, 0.3)',
          }}>
            <Speech size={16} strokeWidth={2.5} />
          </div>
          <span>2. Các từ ngữ ứng dụng:</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${data.rhymes.length}, minmax(0, 1fr))`,
          gap: '14px',
          width: '100%',
        }}>
          {data.rhymes.map((item, idx) => {
            const theme = itemThemes[idx % itemThemes.length];
            return (
              <div
                key={idx}
                className="challenge-tile-hover"
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '14px 12px',
                  borderRadius: '20px',
                  background: theme.wordCardBg,
                  border: `2px solid ${theme.wordBorder}`,
                  boxShadow: theme.wordShadow,
                  cursor: 'default',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  boxSizing: 'border-box',
                }}
              >
                {theme.renderIcon()}

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  width: '100%',
                }}>
                  {item.words.map((word, wIdx) => (
                    <div
                      key={wIdx}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '14px',
                        background: '#ffffff',
                        border: `1.5px solid ${theme.wordBorder}`,
                        fontSize: 'clamp(1.15rem, 3.2vw, 1.45rem)',
                        fontWeight: 900,
                        color: theme.wordColor,
                        letterSpacing: '0.5px',
                        fontFamily: '"Nunito", "Quicksand", system-ui, sans-serif',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** 
 * Thử thách 2: Câu đố với giao diện mở đáp án hiển thị ảnh và chữ to rõ
 * - Bỏ icon dấu chấm hỏi
 * - Khi chưa click: Hiển thị câu đố + Nút xem đáp án
 * - Khi click: Ẩn câu hỏi để có không gian tối đa, hiển thị hình ảnh Cái Bát lớn + Chữ "Cái bát" kèm nút đọc lại câu đố
 */
function RiddleContent({ data }: { data: ChallengeTypeRiddle }) {
  const [revealed, setRevealed] = useState(false);

  // Đường dẫn ảnh cái bát (mặc định hoặc từ data)
  const bowlImg = data.image || 'cus/cai_bat.png';
  const baseUrl = import.meta.env.BASE_URL || '/';
  const formatPath = (path: string) => `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      width: '100%',
    }}>
      {!revealed ? (
        /* ================= GIAO DIỆN CÂU HỎI (KHI CHƯA MỞ ĐÁP ÁN) ================= */
        <>
          <div style={{
            width: '100%',
            background: 'linear-gradient(135deg, #f0f7ff 0%, #e0effe 100%)',
            border: '2.5px solid #93c5fd',
            borderRadius: '24px',
            padding: '30px 24px',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.12)',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}>
            {data.lines.map((line, idx) => {
              const isLast = idx === data.lines.length - 1;
              return (
                <p key={idx} style={{
                  margin: idx === 0 ? 0 : isLast ? '14px 0 0' : '8px 0 0',
                  fontSize: isLast ? 'clamp(1.3rem, 3.8vw, 1.65rem)' : 'clamp(1.2rem, 3.5vw, 1.55rem)',
                  fontWeight: isLast ? 900 : 800,
                  color: isLast ? '#1d4ed8' : '#1e3a8a',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  fontFamily: '"Nunito", "Quicksand", system-ui, sans-serif',
                }}>
                  {line}
                </p>
              );
            })}
          </div>

          {/* Nút Xem đáp án */}
          <button
            onClick={() => setRevealed(true)}
            style={{
              padding: '13px 38px',
              borderRadius: '18px',
              border: 'none',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
              color: '#fff',
              fontWeight: 900,
              fontSize: '1.15rem',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
            className="challenge-tile-hover"
          >
            <Sparkles size={20} color="#fff" />
            <span>Xem đáp án</span>
          </button>
        </>
      ) : (
        /* ================= GIAO DIỆN ĐÁP ÁN (KHI ĐÃ MỞ: CẢ ẢNH & CHỮ CÁI BÁT) ================= */
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          animation: 'answerReveal 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          {/* Thẻ hiển thị đáp án trung tâm với hình ảnh Cái Bát lớn */}
          <div style={{
            width: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 60%, #dcfce7 100%)',
            border: '3px solid #4ade80',
            borderRadius: '26px',
            padding: '24px 20px',
            boxShadow: '0 12px 36px rgba(34, 197, 94, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}>

            {/* Hình ảnh Cái Bát nổi bật */}
            <div style={{
              width: 'min(300px, 75%)',
              aspectRatio: '3 / 2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '6px 0 14px',
              filter: 'drop-shadow(0 10px 18px rgba(0, 0, 0, 0.12))',
            }}>
              <img
                src={formatPath(bowlImg)}
                alt="Cái bát"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Chữ "Cái bát" To, Rực rỡ */}
            <div style={{
              fontSize: 'clamp(2.2rem, 6vw, 3rem)',
              fontWeight: 900,
              color: '#15803d',
              letterSpacing: '1.5px',
              lineHeight: 1.1,
              fontFamily: '"Nunito", "Quicksand", system-ui, sans-serif',
              textShadow: '0 2px 8px rgba(34, 197, 94, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span>{data.answer}</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

/** Thử thách 3: Đoạn văn ngắn (Cỡ chữ to rõ, dễ đọc cho học sinh lớp 1) */
function PassageContent({ data }: { data: ChallengeTypePassage }) {
  const highlightPattern = /([\wÀ-ỹ]*(?:at|ăt|ât)[\wÀ-ỹ]*)/gu;

  const renderHighlighted = (text: string) => {
    const parts = text.split(highlightPattern);
    return parts.map((part, idx) => {
      const isMatch = idx % 2 === 1;
      return isMatch ? (
        <mark key={idx} style={{
          background: 'linear-gradient(135deg, #fef08a 0%, #fde047 100%)',
          borderRadius: '6px',
          padding: '1px 6px',
          color: '#92400e',
          fontWeight: 900,
          boxShadow: '0 2px 6px rgba(234, 179, 8, 0.25)',
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
      borderRadius: '24px',
      padding: '24px 28px',
      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.14)',
      boxSizing: 'border-box',
    }}>

      {/* Đoạn văn với font chữ to rõ (1.45rem - 1.95rem), giãn dòng thoáng đãng */}
      <p style={{
        margin: 0,
        fontSize: 'clamp(1.45rem, 3.8vw, 1.95rem)',
        fontWeight: 750,
        color: '#0f172a',
        lineHeight: 2.1,
        letterSpacing: '0.4px',
        textAlign: 'left',
        fontFamily: '"Nunito", "Quicksand", system-ui, -apple-system, sans-serif',
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
  onComplete?: () => void; // Trigger khi click hoàn thành thử thách
}

export const ChallengeQuestionModal: React.FC<ChallengeQuestionModalProps> = ({
  readingData,
  onClose,
  onComplete,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const { content } = readingData;

  const handleFinish = () => {
    if (onComplete) {
      onComplete();
    } else {
      onClose();
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '780px',
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
        padding: '16px 22px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: 'clamp(1.1rem, 3.5vw, 1.3rem)',
            fontWeight: 900,
            color: '#fef08a',
            letterSpacing: '0.3px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Sparkles size={18} color="#fef08a" />
            <span>Thử Thách {readingData.step}: {readingData.stepTitle}</span>
          </h3>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
            {content.type === 'rhymes' && 'Con hãy đọc to các vần và từ ngữ ở 2 hàng bên dưới nhé!'}
            {content.type === 'riddle' && 'Con hãy đọc câu đố và đoán xem là gì nhé!'}
            {content.type === 'passage' && 'Con hãy đọc to, rõ ràng đoạn văn nhé!'}
          </span>
        </div>

        {/* Nút Đóng */}
        <button
          onClick={onClose}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
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
        padding: '24px 26px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        maxHeight: '75vh',
        overflowY: 'auto',
      }}>
        {content.type === 'rhymes' && <RhymesContent data={content} />}
        {content.type === 'riddle' && <RiddleContent data={content} />}
        {content.type === 'passage' && <PassageContent data={content} />}

        {/* Nút Hoàn thành */}
        <button
          onClick={handleFinish}
          className="challenge-finish-btn"
          style={{
            marginTop: '4px',
            padding: '12px 42px',
            borderRadius: '18px',
            border: 'none',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Hoàn thành</span>
          <CheckCircle2 size={20} color="#ffffff" strokeWidth={2.6} />
        </button>
      </div>

      <style>{`
        @keyframes challengePopIn {
          0%   { opacity: 0; transform: scale(0.92) translateY(12px); }
          100% { opacity: 1; transform: scale(1)    translateY(0px);  }
        }
        @keyframes answerReveal {
          0%   { opacity: 0; transform: scale(0.9) translateY(8px); }
          100% { opacity: 1; transform: scale(1)   translateY(0px); }
        }
        .challenge-tile-hover:hover {
          transform: translateY(-3px);
          filter: brightness(1.03);
        }
        .challenge-finish-btn:hover {
          transform: scale(1.04);
          filter: brightness(1.08);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
        }
        .challenge-finish-btn:active {
          transform: scale(0.97);
        }
      `}</style>
    </div>
  );
};
