import React from 'react';
import { GameTheme, GameThemeType } from '../types';
import { GAME_THEMES } from '../utils/constants';
import { Sparkles, Play, Settings, Compass, BookOpen, Star } from 'lucide-react';

interface StartScreenProps {
  selectedThemeId: GameThemeType;
  onSelectTheme: (theme: GameTheme) => void;
  onStartGame: () => void;
  onOpenSettings: () => void;
  loading: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  selectedThemeId,
  onSelectTheme,
  onStartGame,
  onOpenSettings,
  loading,
}) => {
  const currentSelectedTheme = GAME_THEMES.find((t) => t.id === selectedThemeId) || GAME_THEMES[0];

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #0f766e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(12px, 3vw, 24px) clamp(10px, 3vw, 16px)',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Times New Roman', Times, serif",
      }}
    >
      {/* Background Decorative Rings/Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.25) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          animation: 'pulseGlow 4s infinite ease-in-out',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          animation: 'pulseGlow 5s infinite ease-in-out',
        }}
      />

      {/* Main Container Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          background: 'rgba(255, 255, 255, 0.96)',
          borderRadius: '28px',
          padding: 'clamp(18px, 3.5vw, 32px) clamp(14px, 3.5vw, 28px)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35), 0 0 40px rgba(52, 211, 153, 0.2)',
          border: '3px solid #bbf7d0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
          animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        {/* Top bar inside card: Subtitle Badge + Settings Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {/* Subtitle Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              color: '#15803d',
              padding: '6px 14px',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: 'clamp(0.78rem, 2.2vw, 0.88rem)',
              border: '1.5px solid #86efac',
              boxShadow: '0 2px 6px rgba(34, 197, 94, 0.12)',
              whiteSpace: 'nowrap',
            }}
          >
            <Sparkles size={15} color="#16a34a" style={{ flexShrink: 0 }} />
            <span>TRÒ CHƠI HỌC TẬP TƯƠNG TÁC</span>
          </div>

          {/* Integrated Settings Button */}
          <button
            onClick={onOpenSettings}
            style={{
              background: '#f1f5f9',
              border: '1.5px solid #cbd5e1',
              color: '#334155',
              padding: '6px 14px',
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: 'clamp(0.8rem, 2.2vw, 0.88rem)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              marginLeft: 'auto',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#334155';
            }}
            title="Cấu hình Google Sheet & Số bước thử thách"
          >
            <Settings size={16} color="#2563eb" style={{ flexShrink: 0 }} />
            {/* <span>Cấu hình Sheet</span> */}
          </button>
        </div>

        {/* Big Game Title */}
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight: 900,
            color: '#065f46',
            margin: '6px 0 10px 0',
            lineHeight: 1.2,
            letterSpacing: '-0.3px',
          }}
        >
          THỬ THÁCH TRI THỨC VUI NHỘN
        </h1>

        <p
          style={{
            fontSize: 'clamp(0.95rem, 2.8vw, 1.15rem)',
            color: '#475569',
            maxWidth: '620px',
            margin: '0 0 24px 0',
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          Chào mừng thầy cô và các em học sinh! Hãy chọn chủ đề trò chơi yêu thích và nhấn <b>Bắt đầu</b> để giải đố và giúp nhân vật về đích nhé!
        </p>

        {/* Theme Selection Grid */}
        <div style={{ width: '100%', marginBottom: '26px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#0f766e',
              fontWeight: 800,
              fontSize: '1rem',
              marginBottom: '14px',
            }}
          >
            <Compass size={20} />
            <span>CHỌN CHỦ ĐỀ TRÒ CHƠI:</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '14px',
              width: '100%',
            }}
          >
            {GAME_THEMES.map((theme) => {
              const isSelected = theme.id === selectedThemeId;
              return (
                <div
                  key={theme.id}
                  onClick={() => onSelectTheme(theme)}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)'
                      : '#ffffff',
                    border: isSelected ? '3px solid #10b981' : '2px solid #e2e8f0',
                    borderRadius: '22px',
                    padding: '16px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: isSelected
                      ? '0 10px 25px rgba(16, 185, 129, 0.25), 0 0 0 3px rgba(16, 185, 129, 0.15)'
                      : '0 4px 12px rgba(0, 0, 0, 0.03)',
                    transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                    transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxSizing: 'border-box',
                    position: 'relative',
                  }}
                >
                  {/* Selected Indicator Badge */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#16a34a',
                        color: '#ffffff',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 900,
                        boxShadow: '0 2px 6px rgba(22, 163, 74, 0.4)',
                      }}
                    >
                      ✓
                    </div>
                  )}

                  {/* Character Avatar */}
                  <div
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '20px',
                      background: isSelected ? '#ffffff' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isSelected ? '2px solid #86efac' : '1.5px solid #e2e8f0',
                      padding: '6px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                    }}
                  >
                    {theme.characterImage ? (
                      <img
                        src={theme.characterImage}
                        alt={theme.characterName}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <Sparkles size={34} color="#10b981" />
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: isSelected ? '#065f46' : '#1e293b',
                        margin: 0,
                      }}
                    >
                      {theme.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.88rem',
                        color: isSelected ? '#047857' : '#64748b',
                        margin: '4px 0 0 0',
                        fontWeight: 600,
                        lineHeight: 1.3,
                      }}
                    >
                      {theme.subtitle}
                    </p>
                  </div>

                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: isSelected ? '#15803d' : '#64748b',
                      background: isSelected ? '#bbf7d0' : '#f1f5f9',
                      padding: '4px 12px',
                      borderRadius: '10px',
                      marginTop: 'auto',
                    }}
                  >
                    {isSelected ? 'Đang chọn' : 'Nhấn để chọn'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              padding: '6px 14px',
              borderRadius: '12px',
              color: '#334155',
              fontSize: '0.88rem',
              fontWeight: 700,
            }}
          >
            <BookOpen size={16} color="#2563eb" />
            <span>Nạp câu hỏi tự động từ Google Sheet</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              padding: '6px 14px',
              borderRadius: '12px',
              color: '#334155',
              fontSize: '0.88rem',
              fontWeight: 700,
            }}
          >
            <Star size={16} color="#f59e0b" />
            <span>Bấm giờ & Tính điểm chi tiết</span>
          </div>
        </div>

        {/* Big Start Game Button */}
        <button
          onClick={onStartGame}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '18px 56px',
            borderRadius: '24px',
            fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)',
            fontWeight: 900,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 12px 30px rgba(16, 185, 129, 0.45), 0 4px 0 #047857',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            width: '100%',
            maxWidth: '400px',
            letterSpacing: '0.5px',
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 36px rgba(16, 185, 129, 0.55), 0 5px 0 #047857';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.45), 0 4px 0 #047857';
            }
          }}
        >
          <Play fill="#ffffff" size={26} />
          <span>BẮT ĐẦU CHƠI</span>
        </button>
      </div>
    </div>
  );
};
