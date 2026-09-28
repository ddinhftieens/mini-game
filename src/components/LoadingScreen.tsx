import React from 'react';
import { Loader2, Sparkles, FileSpreadsheet } from 'lucide-react';
import { GameTheme } from '../types';

interface LoadingScreenProps {
  theme?: GameTheme;
  message?: string;
  subMessage?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  theme,
  message = 'Đang tải câu hỏi từ Google Sheet',
  subMessage = 'Đang đồng bộ dữ liệu câu hỏi và thiết lập màn chơi...',
}) => {
  return (
    <div
      style={{
        gridColumn: '1 / -1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '420px',
        padding: '24px 16px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="animate-pop"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '28px',
          padding: '36px 32px 32px 32px',
          border: '2px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 20px 40px -12px rgba(16, 185, 129, 0.2), 0 4px 12px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '480px',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Decorative Subtle Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #f59e0b 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite linear',
          }}
        />

        {/* Multi-layered Spinner Container */}
        <div
          style={{
            position: 'relative',
            width: '90px',
            height: '90px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '22px',
          }}
        >
          {/* Soft Glow Background */}
          <div
            style={{
              position: 'absolute',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0) 70%)',
              animation: 'pulseGlow 2.5s infinite ease-in-out',
            }}
          />

          {/* Outer Reverse Dashed Ring */}
          <div
            className="animate-spin-reverse"
            style={{
              position: 'absolute',
              width: '86px',
              height: '86px',
              borderRadius: '50%',
              border: '2.5px dashed rgba(16, 185, 129, 0.45)',
              boxSizing: 'border-box',
            }}
          />

          {/* Inner Fast Primary Spinner */}
          <Loader2
            className="animate-spin"
            size={52}
            color="#059669"
            strokeWidth={2.5}
            style={{ zIndex: 2 }}
          />

          {/* Center Cute Icon */}
          <div
            style={{
              position: 'absolute',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {theme?.characterImage ? (
              <img
                src={theme.characterImage}
                alt={theme.characterName || 'Character'}
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'contain',
                  borderRadius: '50%',
                }}
              />
            ) : (
              <FileSpreadsheet size={22} color="#10b981" />
            )}
          </div>
        </div>

        {/* Main Title with Animated Dots */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 900,
            color: '#064e3b',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            letterSpacing: '0.2px',
          }}
        >
          <span>{message}</span>
          <span style={{ display: 'inline-flex', gap: '3px', marginLeft: '4px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '5px',
                height: '5px',
                backgroundColor: '#059669',
                borderRadius: '50%',
                animation: 'dotPulse 1.4s infinite ease-in-out',
                animationDelay: '0s',
              }}
            />
            <span
              style={{
                display: 'inline-block',
                width: '5px',
                height: '5px',
                backgroundColor: '#059669',
                borderRadius: '50%',
                animation: 'dotPulse 1.4s infinite ease-in-out',
                animationDelay: '0.25s',
              }}
            />
            <span
              style={{
                display: 'inline-block',
                width: '5px',
                height: '5px',
                backgroundColor: '#059669',
                borderRadius: '50%',
                animation: 'dotPulse 1.4s infinite ease-in-out',
                animationDelay: '0.5s',
              }}
            />
          </span>
        </h3>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '0.92rem',
            color: '#64748b',
            marginBottom: '20px',
            lineHeight: 1.5,
            maxWidth: '380px',
          }}
        >
          {subMessage}
        </p>

        {/* Shimmering Progress Bar */}
        <div
          style={{
            width: '100%',
            maxWidth: '320px',
            height: '8px',
            backgroundColor: '#e2e8f0',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: '20px',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '60%',
              background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #10b981 100%)',
              backgroundSize: '200% 100%',
              borderRadius: '999px',
              animation: 'shimmer 1.5s infinite linear',
            }}
          />
        </div>

        {/* Bottom Badge / Tip */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(236, 253, 245, 0.85)',
            border: '1px solid #a7f3d0',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            color: '#065f46',
            fontWeight: 700,
          }}
        >
          <Sparkles size={14} color="#10b981" />
          <span>Sẵn sàng thử thách kiến thức của bạn</span>
        </div>
      </div>
    </div>
  );
};
