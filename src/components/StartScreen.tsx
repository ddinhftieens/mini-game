import React, { useState, useEffect } from 'react';
import { GameTheme, GameThemeType } from '../types';
import { GAME_THEMES } from '../utils/constants';
import { playThemeDescriptionAudio, stopThemeDescriptionAudio, subscribeThemeAudioState } from '../utils/helpers';
import { Sparkles, Play, Settings, Compass, BookOpen, Star, Loader2, Volume2 } from 'lucide-react';

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
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeThemeAudioState((isPlaying, url) => {
      setIsPlayingAudio(isPlaying);
      setPlayingAudioUrl(url);
    });

    return () => {
      unsubscribe();
      stopThemeDescriptionAudio();
    };
  }, []);

  const handleSelectTheme = (theme: GameTheme) => {
    onSelectTheme(theme);
    playThemeDescriptionAudio(theme.descriptionAudio);
  };

  const handleStart = () => {
    stopThemeDescriptionAudio();
    onStartGame();
  };

  const handleOpenSettings = () => {
    stopThemeDescriptionAudio();
    onOpenSettings();
  };
  return (
    <div
      className="start-screen-container"
      style={{
        height: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #0f766e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(8px, 2vh, 20px) clamp(10px, 2.5vw, 20px)',
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
          width: 'clamp(250px, 40vw, 450px)',
          height: 'clamp(250px, 40vw, 450px)',
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
          width: 'clamp(250px, 45vw, 500px)',
          height: 'clamp(250px, 45vw, 500px)',
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
          borderRadius: 'clamp(18px, 3vw, 28px)',
          padding: 'clamp(14px, 2.5vh, 28px) clamp(12px, 3vw, 28px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(52, 211, 153, 0.2)',
          border: '3px solid #bbf7d0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
          animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          margin: 'auto 0',
        }}
      >
        {/* Top bar inside card: Subtitle Badge + Settings Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: 'clamp(6px, 1.2vh, 12px)',
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
              padding: '4px 12px',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: 'clamp(0.72rem, 1.8vw, 0.85rem)',
              border: '1.5px solid #86efac',
              boxShadow: '0 2px 6px rgba(34, 197, 94, 0.12)',
              whiteSpace: 'nowrap',
            }}
          >
            <Sparkles size={14} color="#16a34a" style={{ flexShrink: 0 }} />
            <span>TRÒ CHƠI HỌC TẬP TƯƠNG TÁC</span>
          </div>

          {/* Integrated Settings Button */}
          <button
            onClick={handleOpenSettings}
            style={{
              background: '#f1f5f9',
              border: '1.5px solid #cbd5e1',
              color: '#334155',
              padding: '4px 10px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
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
            <Settings size={15} color="#2563eb" style={{ flexShrink: 0 }} />
          </button>
        </div>

        {/* Big Game Title */}
        <h1
          style={{
            fontSize: 'clamp(1.35rem, 3.5vw, 2.3rem)',
            fontWeight: 900,
            color: '#065f46',
            margin: '2px 0 6px 0',
            lineHeight: 1.2,
            letterSpacing: '-0.3px',
          }}
        >
          THỬ THÁCH TRI THỨC VUI NHỘN
        </h1>

        <p
          style={{
            fontSize: 'clamp(0.85rem, 2vw, 1.05rem)',
            color: '#475569',
            maxWidth: '620px',
            margin: '0 0 clamp(10px, 2vh, 18px) 0',
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          Chào mừng thầy cô và các em học sinh! Hãy chọn chủ đề trò chơi yêu thích và nhấn <b>Bắt đầu</b> để giải đố và giúp nhân vật về đích nhé!
        </p>

        {/* Theme Selection Grid */}
        <div style={{ width: '100%', marginBottom: 'clamp(10px, 2vh, 20px)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#0f766e',
              fontWeight: 800,
              fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
              marginBottom: '10px',
            }}
          >
            <Compass size={18} />
            <span>CHỌN CHỦ ĐỀ TRÒ CHƠI:</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 26vw, 220px), 1fr))',
              gap: 'clamp(8px, 1.5vw, 14px)',
              width: '100%',
            }}
          >
            {GAME_THEMES.map((theme) => {
              const isSelected = theme.id === selectedThemeId;
              const isThisAudioPlaying = isPlayingAudio && isSelected;
              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme)}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)'
                      : '#ffffff',
                    border: isSelected ? '2.5px solid #10b981' : '2px solid #e2e8f0',
                    borderRadius: 'clamp(14px, 2vw, 20px)',
                    padding: 'clamp(10px, 1.8vh, 16px) clamp(8px, 1.5vw, 14px)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'clamp(6px, 1vh, 10px)',
                    boxShadow: isSelected
                      ? '0 8px 20px rgba(16, 185, 129, 0.22), 0 0 0 2px rgba(16, 185, 129, 0.15)'
                      : '0 3px 10px rgba(0, 0, 0, 0.03)',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxSizing: 'border-box',
                    position: 'relative',
                  }}
                >
                  {/* Selected Indicator Badge */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#16a34a',
                        color: '#ffffff',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 900,
                        boxShadow: '0 2px 5px rgba(22, 163, 74, 0.4)',
                      }}
                    >
                      ✓
                    </div>
                  )}

                  {/* Character Avatar */}
                  <div
                    style={{
                      width: 'clamp(50px, 8vw, 70px)',
                      height: 'clamp(50px, 8vw, 70px)',
                      borderRadius: '16px',
                      background: isSelected ? '#ffffff' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isSelected ? '2px solid #86efac' : '1.5px solid #e2e8f0',
                      padding: '4px',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.05)',
                    }}
                  >
                    {theme.characterImage ? (
                      <img
                        src={theme.characterImage}
                        alt={theme.characterName}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <Sparkles size={28} color="#10b981" />
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3
                      style={{
                        fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                        fontWeight: 800,
                        color: isSelected ? '#065f46' : '#1e293b',
                        margin: 0,
                      }}
                    >
                      {theme.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 'clamp(0.75rem, 1.6vw, 0.84rem)',
                        color: isSelected ? '#047857' : '#64748b',
                        margin: '3px 0 0 0',
                        fontWeight: 600,
                        lineHeight: 1.25,
                      }}
                    >
                      {theme.subtitle}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: 'clamp(0.72rem, 1.5vw, 0.8rem)',
                      fontWeight: 700,
                      color: isSelected ? '#15803d' : '#64748b',
                      background: isSelected ? '#bbf7d0' : '#f1f5f9',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      marginTop: 'auto',
                    }}
                  >
                    {isThisAudioPlaying ? (
                      <>
                        <Volume2 size={13} className="animate-pulse" color="#16a34a" />
                        <span>Đang đọc mô tả...</span>
                      </>
                    ) : isSelected ? (
                      'Đang chọn'
                    ) : (
                      'Nhấn để chọn'
                    )}
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
            gap: '8px',
            marginBottom: 'clamp(12px, 2vh, 20px)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              padding: '4px 12px',
              borderRadius: '10px',
              color: '#334155',
              fontSize: 'clamp(0.76rem, 1.6vw, 0.84rem)',
              fontWeight: 700,
            }}
          >
            <BookOpen size={14} color="#2563eb" />
            <span>Nạp câu hỏi từ Google Sheet</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              padding: '4px 12px',
              borderRadius: '10px',
              color: '#334155',
              fontSize: 'clamp(0.76rem, 1.6vw, 0.84rem)',
              fontWeight: 700,
            }}
          >
            <Star size={14} color="#f59e0b" />
            <span>Bấm giờ & Tính điểm chi tiết</span>
          </div>
        </div>

        {/* Big Start Game Button */}
        <button
          onClick={handleStart}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            border: 'none',
            padding: 'clamp(12px, 2vh, 16px) clamp(28px, 6vw, 48px)',
            borderRadius: '20px',
            fontSize: 'clamp(1.05rem, 2.5vw, 1.35rem)',
            fontWeight: 900,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 10px 24px rgba(16, 185, 129, 0.4), 0 3px 0 #047857',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            width: '100%',
            maxWidth: '360px',
            letterSpacing: '0.5px',
            opacity: loading ? 0.75 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 14px 30px rgba(16, 185, 129, 0.5), 0 4px 0 #047857';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(16, 185, 129, 0.4), 0 3px 0 #047857';
            }
          }}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={22} />
              <span>ĐANG TẢI...</span>
            </>
          ) : (
            <>
              <Play fill="#ffffff" size={22} />
              <span>BẮT ĐẦU CHƠI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

