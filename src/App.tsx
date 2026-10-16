import React, { useState } from 'react';
import StageQuizGame from './StageQuizGame';
import ChimChichBong from './ChimChichBong';
import HeadTiltQuizPage from './HeadTiltQuizPage';
import { Gamepad2, Sparkles, Camera, MapPin, Award, Play } from 'lucide-react';

type GameId = 'stage-quiz' | 'chim-chich-bong' | 'head-tilt-quiz';

interface GameOption {
  id: GameId;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  gradient: string;
  borderGlow: string;
  tagColor: string;
  icon: React.ReactNode;
  features: string[];
}

const GAMES: GameOption[] = [
  {
    id: 'stage-quiz',
    title: 'Giải Đố Vui',
    badge: 'Trắc nghiệm thông minh',
    subtitle: 'Khám phá thế giới cùng AI',
    description: 'Bộ câu hỏi trắc nghiệm đồng bộ Google Sheet với hoạt cảnh hoạt hình sinh động, âm thanh hiệu ứng và tính điểm thời gian.',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    borderGlow: 'rgba(16, 185, 129, 0.45)',
    tagColor: '#34d399',
    icon: <Award size={32} color="#6ee7b7" />,
    features: ['Google Sheet live sync', '3 Chủ đề thú vị', 'Bộ đếm thời gian & Điểm'],
  },
  {
    id: 'chim-chich-bong',
    title: 'Giải Cứu Chích Bông',
    badge: 'Tập đọc Lớp 1',
    subtitle: 'Bay qua núi đồi • Vượt dòng sông • Về vườn rau',
    description: 'Hành trình tương tác giúp chú chim Chích Bông vượt qua các chặng đường, luyện đọc vần - từ ngữ và bay về khu vườn rau xanh mát.',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
    borderGlow: 'rgba(14, 165, 233, 0.45)',
    tagColor: '#38bdf8',
    icon: <MapPin size={32} color="#7dd3fc" />,
    features: ['Cốt truyện audio lồng tiếng', 'Thử thách bài đọc vần', 'Hoạt ảnh chim bay mượt mà'],
  },
  {
    id: 'head-tilt-quiz',
    title: 'Đố Vui Nghiêng Đầu AI',
    badge: 'AI Camera tương tác',
    subtitle: 'Nghiêng Trái / Phải để chọn câu trả lời',
    description: 'Sử dụng AI Camera nhận diện chuyển động đầu để trả lời trắc nghiệm không cần chạm chuột hay bàn phím, cực kỳ hào hứng cho bé.',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
    borderGlow: 'rgba(139, 92, 246, 0.45)',
    tagColor: '#c084fc',
    icon: <Camera size={32} color="#d8b4fe" />,
    features: ['Nhận diện cử chỉ AI', 'Vận động thể chất vui vẻ', 'Hiệu ứng âm thanh vui nhộn'],
  },
];

export const App: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  if (selectedGame === 'stage-quiz') {
    return <StageQuizGame />;
  }

  if (selectedGame === 'chim-chich-bong') {
    return <ChimChichBong />;
  }

  if (selectedGame === 'head-tilt-quiz') {
    return <HeadTiltQuizPage />;
  }

  return (
    <div className="game-hub-root">
      <style>{`
        .game-hub-root {
          min-height: 100vh;
          width: 100%;
          background-color: #090d16;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(16px, 3vh, 36px) clamp(12px, 3vw, 28px);
          box-sizing: border-box;
          font-family: 'Outfit', 'Segoe UI', system-ui, -apple-system, sans-serif;
          color: #ffffff;
          overflow-x: hidden;
        }

        .game-hub-header {
          text-align: center;
          max-width: 820px;
          margin-bottom: clamp(16px, 2.5vh, 28px);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .game-hub-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          margin-bottom: clamp(6px, 1.2vh, 12px);
          font-size: clamp(0.72rem, 1vw, 0.82rem);
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #e2e8f0;
        }

        .game-hub-title {
          margin: 0 0 clamp(4px, 0.8vh, 8px) 0;
          font-size: clamp(1.6rem, 2.8vw, 2.6rem);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.5px;
          background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .game-hub-desc {
          margin: 0;
          font-size: clamp(0.85rem, 1.1vw, 1rem);
          color: #94a3b8;
          line-height: 1.45;
          max-width: 640px;
        }

        .game-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(12px, 1.8vw, 22px);
          width: 100%;
          max-width: 1260px;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1080px) {
          .game-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          }
        }

        @media (max-width: 640px) {
          .game-grid {
            grid-template-columns: 1fr;
          }
        }

        .game-card {
          position: relative;
          border-radius: clamp(16px, 2vw, 22px);
          background: linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          padding: clamp(16px, 2vh, 22px) clamp(16px, 1.8vw, 22px);
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                      border-color 0.3s ease,
                      box-shadow 0.3s ease;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(16px);
          overflow: hidden;
        }

        .game-card:hover {
          transform: translateY(-6px) scale(1.015);
        }

        .game-card-icon-box {
          width: clamp(46px, 5vw, 56px);
          height: clamp(46px, 5vw, 56px);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .game-card-btn {
          width: 100%;
          padding: clamp(10px, 1.4vh, 12px) 0;
          border-radius: 14px;
          border: none;
          color: #ffffff;
          font-weight: 800;
          font-size: clamp(0.85rem, 1vw, 0.92rem);
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          cursor: pointer;
          transition: filter 0.2s ease, transform 0.15s ease;
        }

        .game-card-btn:hover {
          filter: brightness(1.12);
        }

        .game-card-btn:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* Header / Hero */}
      <div className="game-hub-header">
        <div className="game-hub-tag">
          <span>Hệ Thống Trò Chơi Giáo Dục & Vận Động</span>
        </div>

        <h1 className="game-hub-title">Chọn Trò Chơi Yêu Thích</h1>

        <p className="game-hub-desc">
          Khám phá 3 phong cách học tập độc đáo: Đấu trí bảng câu hỏi tương tác, giải cứu nhân vật hoạt hình hoặc thử thách nghiêng đầu qua camera AI!
        </p>
      </div>

      {/* Grid 3 Trò chơi */}
      <div className="game-grid">
        {GAMES.map((game) => (
          <div
            key={game.id}
            onClick={() => setSelectedGame(game.id)}
            className="game-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = game.borderGlow;
              e.currentTarget.style.boxShadow = `0 16px 36px rgba(0, 0, 0, 0.5), 0 0 24px ${game.borderGlow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.35)';
            }}
          >
            {/* Top highlight glow */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: game.borderGlow,
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }} />

            {/* Icon + Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}>
              <div className="game-card-icon-box">
                {game.icon}
              </div>

              <span style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: game.tagColor,
                border: `1px solid ${game.borderGlow}`,
              }}>
                {game.badge}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h2 style={{
              margin: '0 0 4px 0',
              fontSize: 'clamp(1.15rem, 1.4vw, 1.35rem)',
              fontWeight: 800,
              color: '#ffffff',
            }}>
              {game.title}
            </h2>

            <p style={{
              margin: '0 0 10px 0',
              fontSize: 'clamp(0.8rem, 0.95vw, 0.86rem)',
              fontWeight: 600,
              color: game.tagColor,
            }}>
              {game.subtitle}
            </p>

            <p style={{
              margin: '0 0 16px 0',
              fontSize: 'clamp(0.82rem, 0.95vw, 0.88rem)',
              color: '#94a3b8',
              lineHeight: 1.5,
              flexGrow: 1,
            }}>
              {game.description}
            </p>

            {/* Feature tags */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginBottom: '18px',
            }}>
              {game.features.map((feat, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  fontSize: 'clamp(0.78rem, 0.9vw, 0.82rem)',
                  color: '#cbd5e1',
                }}>
                  <span style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: game.tagColor,
                    flexShrink: 0,
                  }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Launch Button */}
            <button
              className="game-card-btn"
              style={{
                background: game.gradient,
                boxShadow: `0 4px 16px ${game.borderGlow}`,
              }}
            >
              <Play size={15} fill="#ffffff" />
              <span>Chơi Ngay</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
