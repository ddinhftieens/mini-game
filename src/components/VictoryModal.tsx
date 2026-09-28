import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GameTheme } from '../types';
import { RotateCcw, Trophy, Award, Sparkles, Clock } from 'lucide-react';
import { playFireworkSound, formatElapsedTime } from '../utils/helpers';

interface VictoryModalProps {
  theme: GameTheme;
  score: number;
  totalQuestions: number;
  completionTimeSeconds?: number;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  theme,
  score,
  totalQuestions,
  completionTimeSeconds = 0,
  onPlayAgain,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Bắn pháo hoa liên tục kèm âm thanh tiếng nổ pháo hoa
  useEffect(() => {
    let active = true;

    // 1. Tạo instance confetti chuyên biệt trên Canvas riêng với z-index cao nhất
    let myConfetti: confetti.CreateTypes | null = null;
    if (canvasRef.current) {
      myConfetti = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      });
    }

    const fireFireworks = () => {
      const fireInstance = myConfetti || confetti;

      // Tiếng nổ pháo hoa sống động
      playFireworkSound();

      // Bắn tia pháo từ góc trái
      fireInstance({
        particleCount: 50,
        angle: 60,
        spread: 65,
        origin: { x: 0.05, y: 0.75 },
        colors: ['#10b981', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7', '#ffffff'],
        startVelocity: 45,
        gravity: 0.9,
        ticks: 250,
      });

      // Bắn tia pháo từ góc phải
      fireInstance({
        particleCount: 50,
        angle: 120,
        spread: 65,
        origin: { x: 0.95, y: 0.75 },
        colors: ['#10b981', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7', '#ffffff'],
        startVelocity: 45,
        gravity: 0.9,
        ticks: 250,
      });

      // Thỉnh thoảng nổ chùm lớn ở giữa
      if (Math.random() > 0.4) {
        setTimeout(() => {
          if (!active) return;
          fireInstance({
            particleCount: 40,
            spread: 90,
            origin: { x: 0.5, y: 0.35 + Math.random() * 0.2 },
            colors: ['#f59e0b', '#ec4899', '#06b6d4', '#10b981', '#ffffff'],
            startVelocity: 30,
            ticks: 200,
          });
        }, 300);
      }
    };

    // Bắn đợt đầu tiên ngay lập tức
    fireFireworks();

    // Chu kỳ bắn lặp lại liên tục
    const fireInterval = setInterval(() => {
      if (!active) return;
      fireFireworks();
    }, 1100);

    return () => {
      active = false;
      clearInterval(fireInterval);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.82)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 150,
      padding: '12px',
      boxSizing: 'border-box',
      fontFamily: "'Times New Roman', Times, serif",
      animation: 'fadeIn 0.3s ease-out',
    }}>
      {/* Canvas chuyên dụng phủ toàn màn hình để bắn pháo hoa ở lớp trên cùng */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 160,
        }}
      />

      <div style={{
        background: '#ffffff',
        borderRadius: '28px',
        maxWidth: '540px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '24px 20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 40px rgba(16, 185, 129, 0.35)',
        border: '3px solid #bbf7d0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        boxSizing: 'border-box',
        zIndex: 155,
      }}>
        {/* Vòng hào quang phát sáng nền */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(110, 231, 183, 0.45) 0%, rgba(56, 189, 248, 0.15) 50%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          animation: 'pulseGlow 2.5s infinite',
        }} />

        {/* Huy hiệu chiến thắng nhỏ */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#dcfce7',
          color: '#15803d',
          padding: '6px 18px',
          borderRadius: '999px',
          fontWeight: 800,
          fontSize: '0.95rem',
          marginBottom: '14px',
          border: '1.5px solid #86efac',
          zIndex: 2,
        }}>
          <Sparkles size={18} color="#16a34a" />
          <span>XUẤT SẮC HOÀN THÀNH THỬ THÁCH</span>
          <Sparkles size={18} color="#16a34a" />
        </div>

        {/* Tiêu đề Chúc mừng */}
        {/* <h2 style={{
          fontSize: '2.1rem',
          fontWeight: 900,
          color: theme.id === 'snail' ? '#b45309' : '#065f46',
          margin: '0 0 6px 0',
          lineHeight: 1.2,
          zIndex: 2,
        }}>
          {theme.victoryTitle || 'Chúc Mừng Em Đã Về Đích!'}
        </h2> */}
        <p style={{
          fontSize: '1.08rem',
          color: '#475569',
          margin: '0 0 20px 0',
          fontWeight: 600,
          zIndex: 2,
        }}>
          {theme.victoryMessage || `${theme.characterName} đã an toàn lên bờ nhờ sự thông minh của em!`}
        </p>

        {/* HÌNH ẢNH CON ẾCH NGỒI TRÊN BỜ SÔNG OAI VỆ */}
        <div style={{
          position: 'relative',
          width: '260px',
          height: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          zIndex: 2,
        }}>
          {/* Ảnh Bờ Sông / Bờ Đất */}
          {theme.destinationImage && (
            <img
              src={theme.destinationImage}
              alt={theme.destinationName}
              style={{
                position: 'absolute',
                bottom: '0px',
                width: '100%',
                height: '80px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
              }}
            />
          )}

          {/* Con Ếch Ngồi Trên Bờ Đất Nhún Nhảy Vui Vẻ */}
          {theme.characterImage && (
            <div
              className="animate-jump"
              style={{
                position: 'absolute',
                bottom: '36px',
                width: '95px',
                height: '95px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
              }}
            >
              <img
                src={theme.characterImage}
                alt={theme.characterName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.35))',
                }}
              />
            </div>
          )}
        </div>

        {/* Khung Điểm Số, Số Câu & Thời Gian Hoàn Thành */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          width: '100%',
          maxWidth: '520px',
          marginBottom: '26px',
          zIndex: 2,
          boxSizing: 'border-box',
        }}>
          {/* Câu đúng */}
          <div style={{
            background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '2px solid #cbd5e1',
            borderRadius: '20px',
            padding: '12px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.04)',
            minWidth: 0,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: '#059669',
              fontSize: 'clamp(0.72rem, 2.2vw, 0.85rem)',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              width: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              <Award size={15} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap' }}>CÂU ĐÚNG</span>
            </div>
            <span style={{
              fontSize: 'clamp(1.2rem, 3.5vw, 1.55rem)',
              fontWeight: 900,
              color: '#065f46',
              marginTop: '4px',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}>
              {totalQuestions}/{totalQuestions}
            </span>
          </div>

          {/* Thời gian hoàn thành */}
          <div style={{
            background: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)',
            border: '2px solid #93c5fd',
            borderRadius: '20px',
            padding: '12px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
            minWidth: 0,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: '#1d4ed8',
              fontSize: 'clamp(0.72rem, 2.2vw, 0.85rem)',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              width: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              <Clock size={15} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap' }}>THỜI GIAN</span>
            </div>
            <span style={{
              fontSize: 'clamp(1.2rem, 3.5vw, 1.55rem)',
              fontWeight: 900,
              color: '#1e40af',
              marginTop: '4px',
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}>
              {formatElapsedTime(completionTimeSeconds)}
            </span>
          </div>

          {/* Tổng điểm */}
          <div style={{
            background: 'linear-gradient(145deg, #fefce8 0%, #fef08a 100%)',
            border: '2px solid #fde047',
            borderRadius: '20px',
            padding: '12px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(234, 179, 8, 0.18)',
            minWidth: 0,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: '#b45309',
              fontSize: 'clamp(0.72rem, 2.2vw, 0.85rem)',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              width: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              <Trophy size={15} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap' }}>TỔNG ĐIỂM</span>
            </div>
            <span style={{
              fontSize: 'clamp(1.2rem, 3.5vw, 1.55rem)',
              fontWeight: 900,
              color: '#b45309',
              marginTop: '4px',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}>
              {score}
            </span>
          </div>
        </div>

        {/* Nút Chơi Lại */}
        <button
          onClick={onPlayAgain}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '16px 44px',
            borderRadius: '22px',
            fontSize: '1.35rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.45)',
            transition: 'all 0.2s transform',
            zIndex: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <RotateCcw size={24} />
          <span>CHƠI LẠI</span>
        </button>
      </div>
    </div>
  );
};
