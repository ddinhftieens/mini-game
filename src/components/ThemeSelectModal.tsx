import React from 'react';
import { GameTheme, GameThemeType } from '../types';
import { GAME_THEMES } from '../utils/constants';
import { Sparkles, Play, BookOpen } from 'lucide-react';

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
      padding: '20px',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '32px',
        maxWidth: '750px',
        width: '100%',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '4px solid #bbf7d0',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#dcfce7',
            color: '#15803d',
            padding: '6px 16px',
            borderRadius: '20px',
            fontWeight: 800,
            fontSize: '0.85rem',
            marginBottom: '8px',
          }}>
            <Sparkles size={16} />
            <span>HỌC MÀ VUI, VUI MÀ HỌC</span>
          </div>
          <h1 style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            color: '#065f46',
            fontFamily: "'Times New Roman', Times, serif",
          }}>
            Chào Mừng Thầy Cô & Các Em Học Sinh!
          </h1>
          <p style={{ color: '#475569', fontSize: '1.1rem', marginTop: '8px', fontWeight: 600, fontFamily: "'Times New Roman', Times, serif" }}>
            Hãy chọn một chủ đề trò chơi yêu thích để bắt đầu cuộc phiêu lưu tri thức nhé:
          </p>
        </div>

        {/* Danh sách các chủ đề */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '18px',
        }}>
          {GAME_THEMES.map((t) => {
            const isSelected = t.id === selectedThemeId;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTheme(t)}
                style={{
                  background: isSelected ? '#f0fdf4' : '#ffffff',
                  border: isSelected ? '3px solid #10b981' : '3px solid #e2e8f0',
                  borderRadius: '24px',
                  padding: '22px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '14px',
                  boxShadow: isSelected
                    ? '0 10px 25px rgba(16, 185, 129, 0.2)'
                    : '0 4px 6px rgba(0, 0, 0, 0.04)',
                  transform: isSelected ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <div style={{
                  fontSize: '48px',
                  background: '#f8fafc',
                  width: '84px',
                  height: '84px',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #e2e8f0',
                  overflow: 'hidden',
                  padding: '6px',
                }}>
                  {t.characterImage ? (
                    <img
                      src={t.characterImage}
                      alt={t.characterName}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Sparkles size={36} color="#10b981" />
                  )}
                </div>

                <div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: isSelected ? '#065f46' : '#1e293b',
                    fontFamily: "'Times New Roman', Times, serif",
                  }}>
                    {t.title}
                  </h3>
                  <p style={{
                    fontSize: '0.98rem',
                    color: '#64748b',
                    marginTop: '6px',
                    lineHeight: 1.4,
                    fontWeight: 600,
                    fontFamily: "'Times New Roman', Times, serif",
                  }}>
                    {t.subtitle}
                  </p>
                </div>

                <div style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: isSelected ? '#15803d' : '#94a3b8',
                  background: isSelected ? '#dcfce7' : '#f1f5f9',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontFamily: "'Times New Roman', Times, serif",
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
          marginTop: '12px',
        }}>
          <button
            onClick={onStartGame}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '16px 48px',
              borderRadius: '24px',
              fontSize: '1.35rem',
              fontWeight: 800,
              fontFamily: "'Times New Roman', Times, serif",
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s transform',
            }}
          >
            <Play fill="#ffffff" size={24} />
            <span>BẮT ĐẦU TRÒ CHƠI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
