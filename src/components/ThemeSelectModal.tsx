import React from 'react';
import { GameTheme, GameThemeType } from '../types';
import { GAME_THEMES } from '../utils/constants';
import { Sparkles, Play } from 'lucide-react';

interface ThemeSelectModalProps {
  selectedThemeId: GameThemeType;
  onSelectTheme: (theme: GameTheme) => void;
  onStartGame: () => void;
}

export const ThemeSelectModal: React.FC<ThemeSelectModalProps> = ({
  selectedThemeId,
  onSelectTheme,
  onStartGame,
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '12px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '28px',
        maxWidth: '750px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '24px 20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '3px solid #bbf7d0',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        boxSizing: 'border-box',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#dcfce7',
            color: '#15803d',
            padding: '5px 14px',
            borderRadius: '20px',
            fontWeight: 800,
            fontSize: '0.8rem',
            marginBottom: '6px',
          }}>
            <Sparkles size={15} />
            <span>HỌC MÀ VUI, VUI MÀ HỌC</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(1.3rem, 4vw, 1.95rem)',
            fontWeight: 800,
            color: '#065f46',
            fontFamily: "'Times New Roman', Times, serif",
            lineHeight: 1.25,
            margin: '4px 0',
          }}>
            Chào Mừng Thầy Cô & Các Em Học Sinh!
          </h1>
          <p style={{
            color: '#475569',
            fontSize: 'clamp(0.92rem, 2.5vw, 1.05rem)',
            marginTop: '4px',
            fontWeight: 600,
            fontFamily: "'Times New Roman', Times, serif",
          }}>
            Hãy chọn một chủ đề trò chơi yêu thích để bắt đầu cuộc phiêu lưu tri thức nhé:
          </p>
        </div>

        {/* Danh sách các chủ đề */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
        }}>
          {GAME_THEMES.map((t) => {
            const isSelected = t.id === selectedThemeId;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTheme(t)}
                style={{
                  background: isSelected ? '#f0fdf4' : '#ffffff',
                  border: isSelected ? '3px solid #10b981' : '2.5px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '16px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '10px',
                  boxShadow: isSelected
                    ? '0 10px 25px rgba(16, 185, 129, 0.2)'
                    : '0 4px 6px rgba(0, 0, 0, 0.04)',
                  transform: isSelected ? 'translateY(-3px)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{
                  background: '#f8fafc',
                  width: '68px',
                  height: '68px',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #e2e8f0',
                  overflow: 'hidden',
                  padding: '4px',
                  flexShrink: 0,
                }}>
                  {t.characterImage ? (
                    <img
                      src={t.characterImage}
                      alt={t.characterName}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Sparkles size={30} color="#10b981" />
                  )}
                </div>

                <div>
                  <h3 style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: isSelected ? '#065f46' : '#1e293b',
                    fontFamily: "'Times New Roman', Times, serif",
                    margin: 0,
                  }}>
                    {t.title}
                  </h3>
                  <p style={{
                    fontSize: '0.88rem',
                    color: '#64748b',
                    marginTop: '4px',
                    lineHeight: 1.35,
                    fontWeight: 600,
                    fontFamily: "'Times New Roman', Times, serif",
                    margin: '4px 0 0 0',
                  }}>
                    {t.subtitle}
                  </p>
                </div>

                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: isSelected ? '#15803d' : '#94a3b8',
                  background: isSelected ? '#dcfce7' : '#f1f5f9',
                  padding: '5px 12px',
                  borderRadius: '10px',
                  fontFamily: "'Times New Roman', Times, serif",
                  marginTop: 'auto',
                }}>
                  {isSelected ? '✓ Đã chọn' : 'Nhấn để chọn'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '6px',
        }}>
          <button
            onClick={onStartGame}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '14px 36px',
              borderRadius: '20px',
              fontSize: 'clamp(1.05rem, 3vw, 1.25rem)',
              fontWeight: 800,
              fontFamily: "'Times New Roman', Times, serif",
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s transform',
              width: '100%',
              maxWidth: '360px',
            }}
          >
            <Play fill="#ffffff" size={22} />
            <span>BẮT ĐẦU TRÒ CHƠI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
