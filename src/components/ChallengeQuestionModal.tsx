import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ChallengeReadingData {
  id: number;
  step: 1 | 2 | 3;
  stepTitle: string;
  // Dành cho học sinh lớp 1 luyện đọc vần / từ / câu ngắn
  rhyme: string;         // Vần chính, ví dụ: "an", "ang", "ong"
  vocabulary: string[];  // Từ ngữ ứng dụng, ví dụ: ["bàn tay", "bạn bè", "con ngan"]
  sentence?: string;     // Câu ngắn ứng dụng
}

interface ChallengeQuestionModalProps {
  readingData: ChallengeReadingData;
  onClose: () => void;
}

export const ChallengeQuestionModal: React.FC<ChallengeQuestionModalProps> = ({
  readingData,
  onClose,
}) => {
  // Lắng nghe phím Escape để đóng nhanh và cleanup listener chuẩn xác
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  return (
    <div style={{
      width: '100%',
      maxWidth: '720px',
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
      {/* Header Hộp bài đọc (Đã bỏ icon) */}
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
            fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)',
            fontWeight: 900,
            color: '#fef08a',
            letterSpacing: '0.3px',
          }}>
            Thử Thách {readingData.step}: {readingData.stepTitle}
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Con hãy đọc to, rõ ràng theo hướng dẫn nhé!
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

      {/* Nội dung Bài đọc dành cho học sinh Lớp 1 */}
      <div style={{
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '18px',
        textAlign: 'center',
        maxHeight: '75vh',
        overflowY: 'auto',
      }}>
        {/* KHU VỰC VẦN CHÍNH (Phóng to nổi bật) */}
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)',
          border: '3px solid #facc15',
          borderRadius: '20px',
          padding: '16px 20px',
          boxShadow: '0 8px 24px rgba(234, 179, 8, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}>
          <div style={{
            fontSize: 'clamp(2.6rem, 8vw, 3.4rem)',
            fontWeight: 900,
            color: '#b45309',
            lineHeight: 1.1,
            letterSpacing: '2px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            {readingData.rhyme}
          </div>
        </div>

        {/* CÁC TỪ ỨNG DỤNG MỞ RỘNG (Học sinh luyện ghép vần) */}
        {readingData.vocabulary && readingData.vocabulary.length > 0 && (
          <div style={{ width: '100%' }}>
            <span style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#64748b',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Từ ngữ luyện đọc
            </span>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
            }}>
              {readingData.vocabulary.map((word, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '18px',
                    background: '#f8fafc',
                    border: '2px solid #cbd5e1',
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s',
                  }}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CÂU ỨNG DỤNG NGẮN */}
        {readingData.sentence && (
          <div style={{
            width: '100%',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid #86efac',
            borderRadius: '20px',
            padding: '16px 20px',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)',
          }}>
            <p style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#15803d',
              lineHeight: 1.6,
            }}>
              "{readingData.sentence}"
            </p>
          </div>
        )}

        {/* Nút Hoàn thành bài đọc / Đóng */}
        <button
          onClick={onClose}
          style={{
            marginTop: '8px',
            padding: '12px 36px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          Hoàn thành
        </button>
      </div>

      <style>{`
        @keyframes challengePopIn {
          0% {
            opacity: 0;
            transform: scale(0.92) translateY(12px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0px);
          }
        }
      `}</style>
    </div>
  );
};
