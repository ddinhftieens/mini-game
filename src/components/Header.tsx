import React from 'react';
import { GameTheme } from '../types';
import { Sparkles, Trophy, RotateCcw, Settings, Palette } from 'lucide-react';

interface HeaderProps {
  currentTheme: GameTheme;
  score: number;
  totalQuestions: number;
  completedCount: number;
  onReset: () => void;
  onChangeTheme: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  score,
  totalQuestions,
  completedCount,
  onReset,
  onChangeTheme,
  onOpenSettings,
}) => {
  return (
    <header className="app-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
      borderBottom: '3px solid rgba(255, 255, 255, 0.7)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      flexWrap: 'wrap',
      gap: '10px',
    }}>
      {/* Logo & Chủ đề */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexShrink: 1 }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '13px',
          background: 'linear-gradient(135deg, #34d399, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)',
          cursor: 'pointer',
          flexShrink: 0,
          overflow: 'hidden',
          padding: '4px',
        }}
        onClick={onChangeTheme}
        title="Bấm để đổi chủ đề"
        >
          {currentTheme.characterImage ? (
            <img
              src={currentTheme.characterImage}
              alt={currentTheme.characterName}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Sparkles size={24} color="#ffffff" />
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <h1 className="header-title-text" style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#065f46',
            fontFamily: "'Times New Roman', Times, serif",
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '0.2px',
          }}>
            {currentTheme.title}
          </h1>
          <p className="header-subtitle-text" style={{
            fontSize: '0.85rem',
            color: '#047857',
            fontWeight: 600,
            fontFamily: "'Times New Roman', Times, serif",
          }}>
            {currentTheme.subtitle}
          </p>
        </div>
      </div>

      {/* Điểm số và tiến độ */}
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Điểm số - Đồng bộ phong cách viền & padding với các nút */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: '#fef3c7',
          padding: '5px 10px',
          borderRadius: '12px',
          border: '1.5px solid #fcd34d',
          fontWeight: 700,
          color: '#92400e',
          fontSize: '0.85rem',
        }}>
          <Trophy size={15} color="#b45309" />
          <span>{score} Điểm</span>
        </div>

        {/* Số câu hoàn thành */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: '#dcfce7',
          padding: '5px 10px',
          borderRadius: '12px',
          border: '1.5px solid #86efac',
          fontWeight: 700,
          color: '#166534',
          fontSize: '0.85rem',
        }}>
          <Sparkles size={15} color="#16a34a" />
          <span>{completedCount}/{totalQuestions}</span>
        </div>

        {/* Nút Đổi chủ đề - Dùng Icon Palette thay emoji */}
        <button
          onClick={onChangeTheme}
          style={{
            background: '#e0e7ff',
            color: '#3730a3',
            border: '1.5px solid #a5b4fc',
            padding: '5px 10px',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s',
          }}
          title="Chọn chủ đề khác"
        >
          <Palette size={15} color="#4338ca" />
          <span>Chủ Đề</span>
        </button>

        {/* Nút Cài đặt Google Sheet */}
        <button
          onClick={onOpenSettings}
          style={{
            background: '#f1f5f9',
            border: '1.5px solid #cbd5e1',
            padding: '5px 9px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600,
            color: '#475569',
            fontSize: '0.82rem',
          }}
          title="Cấu hình Google Sheet App Script"
        >
          <Settings size={15} />
          <span>Sheet</span>
        </button>

        {/* Nút chơi lại */}
        <button
          onClick={onReset}
          style={{
            background: '#fee2e2',
            border: '1.5px solid #fca5a5',
            padding: '5px 8px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 700,
            color: '#991b1b',
            fontSize: '0.82rem',
          }}
          title="Chơi lại từ đầu"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </header>
  );
};
