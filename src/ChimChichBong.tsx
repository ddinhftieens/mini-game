import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Sparkles, Loader2, HelpCircle, FileText } from 'lucide-react';
import { ChallengeQuestionModal, ChallengeReadingData } from './components/ChallengeQuestionModal';

type StepId = 1 | 2 | 3;

interface FlightState {
  from: StepId;
  to: StepId;
}

const baseUrl = import.meta.env.BASE_URL || '/';
const formatPath = (path: string) => `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

// Dữ liệu bài đọc tương ứng với 3 thử thách
const CHALLENGE_READING: Record<StepId, ChallengeReadingData> = {
  1: {
    id: 1,
    step: 1,
    stepTitle: 'Vượt Núi Cao',
    content: {
      type: 'rhymes',
      rhymes: [
        { rhyme: 'at', words: ['bãi cát'] },
        { rhyme: 'ăt', words: ['mặt trời'] },
        { rhyme: 'ât', words: ['bật lửa'] },
      ],
    },
  },
  2: {
    id: 2,
    step: 2,
    stepTitle: 'Vượt Dòng Sông',
    content: {
      type: 'riddle',
      lines: [
        'Miệng tròn, lòng trắng phau phau',
        'Đựng cơm, đựng thịt, đựng rau hằng ngày.',
        'Là cái gì?',
      ],
      answer: 'Cái bát',
      image: 'cus/cai_bat.png',
    },
  },
  3: {
    id: 3,
    step: 3,
    stepTitle: 'Vượt qua cánh cổng',
    content: {
      type: 'passage',
      text: 'Hè đến, nhà Nam đi nghỉ mát ở Cát Bà. Mẹ và Nam bỏ áo bơi, bàn chải, khăn mặt vào ba lô. Nam rất vui khi đi chơi xa với cả nhà.',
    },
  },
};

// Cấu hình bong bóng tương tác trên đầu chim theo từng thử thách
const BUBBLE_CONFIG: Record<StepId, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  1: {
    label: 'Luyện vần',
    icon: <BookOpen size={15} color="#d97706" strokeWidth={2.5} />,
    color: '#92400e',
    bg: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 40%, #fef3c7 100%)',
    border: '#f59e0b',
  },
  2: {
    label: 'Giải đố',
    icon: <HelpCircle size={15} color="#2563eb" strokeWidth={2.5} />,
    color: '#1e40af',
    bg: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 40%, #dbeafe 100%)',
    border: '#3b82f6',
  },
  3: {
    label: 'Đoạn văn',
    icon: <FileText size={15} color="#059669" strokeWidth={2.5} />,
    color: '#065f46',
    bg: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 40%, #dcfce7 100%)',
    border: '#10b981',
  },
};

// Vị trí tĩnh của các bục trên bản đồ 16:9
const STEP_POSITIONS: Record<StepId, { left: string; top: string }> = {
  1: { left: '12.8%', top: '84.0%' },
  2: { left: '50.4%', top: '74.0%' },
  3: { left: '86.2%', top: '62.0%' },
};

// ============================================================
// COMPONENT VIDEO MODAL
// ============================================================
interface VideoModalProps {
  src: string;
  onClose: () => void;
}

function VideoModal({ src, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 'min(900px, 100%, calc((100vh - 80px) * (16/9)))',
          aspectRatio: '16 / 9',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
          border: '2px solid rgba(255,255,255,0.2)',
        }}
      >
        <video
          ref={videoRef}
          src={src}
          onEnded={onClose}
          controls
          autoPlay
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            backgroundColor: '#000',
          }}
        />

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            border: '1.5px solid rgba(255,255,255,0.35)',
            color: '#fff',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
            zIndex: 10,
            lineHeight: 1,
          }}
          title="Đóng video"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENT CHÍNH
// ============================================================
export default function ChimChichBong() {
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [flightState, setFlightState] = useState<FlightState | null>(null);
  const [showQuestion, setShowQuestion] = useState<boolean>(false);
  const [isFlyingToGarden, setIsFlyingToGarden] = useState<boolean>(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const flightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dọn dẹp timer khi component unmount
  useEffect(() => {
    return () => {
      if (flightTimerRef.current) {
        clearTimeout(flightTimerRef.current);
        flightTimerRef.current = null;
      }
    };
  }, []);

  const isFlying = flightState !== null || isFlyingToGarden;

  // Thực hiện chuyến bay từ Bục 3 vào Cổng Hoa Khu Vườn rồi mở video kết thúc
  const triggerGardenFlight = () => {
    if (isFlying) return;

    if (flightTimerRef.current) {
      clearTimeout(flightTimerRef.current);
      flightTimerRef.current = null;
    }

    setIsFlyingToGarden(true);

    flightTimerRef.current = setTimeout(() => {
      flightTimerRef.current = null;
      setIsFlyingToGarden(false);
      setVideoSrc(formatPath('cus/chimchichbong_end.mp4'));
    }, 2500);
  };

  // Xử lý khi nhấn nút "Hoàn thành" trong Modal bài đọc
  const handleCompleteChallenge = () => {
    setShowQuestion(false);
    if (currentStep === 3) {
      setTimeout(() => {
        triggerGardenFlight();
      }, 120);
    }
  };

  const navigateToStep = (targetStep: StepId) => {
    if (isFlying || targetStep === currentStep || showQuestion) return;

    if (flightTimerRef.current) {
      clearTimeout(flightTimerRef.current);
      flightTimerRef.current = null;
    }

    setFlightState({ from: currentStep, to: targetStep });

    const distance = Math.abs(targetStep - currentStep);
    const durationMs = distance === 2 ? 4600 : 3200;

    flightTimerRef.current = setTimeout(() => {
      flightTimerRef.current = null;
      setCurrentStep(targetStep);
      setFlightState(null);
    }, durationMs);
  };

  const getFlightAnimation = () => {
    if (isFlyingToGarden) {
      return { name: 'fly_to_garden_gate', duration: '2.5s' };
    }
    if (!flightState) return { name: 'none', duration: '0s' };
    const key = `fly_${flightState.from}_to_${flightState.to}`;
    const distance = Math.abs(flightState.to - flightState.from);
    const duration = distance === 2 ? '4.6s' : '3.2s';
    return { name: key, duration };
  };

  const anim = getFlightAnimation();

  const isFacingLeft = () => {
    if (isFlyingToGarden) return false;
    if (isFlying && flightState) {
      return flightState.to < flightState.from;
    }
    return currentStep === 2;
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      maxHeight: '100vh',
      backgroundColor: '#090d16',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 16px',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Video Modal */}
      {videoSrc && (
        <VideoModal src={videoSrc} onClose={() => setVideoSrc(null)} />
      )}

      {/*
        ======================================================================
        HEADER TRÒ CHƠI TINH TẾ, ĐỒNG BỘ MÀU SẮC & GỌN GÀNG
        - Cùng ngôn ngữ màu Dark Slate Blue / Emerald sạch sẽ
        - Bỏ hai icon hoa/lá, bỏ các hiệu ứng rung lắc/đung đưa/nhấp nháy
        ======================================================================
      */}
      {!showQuestion && (
        <header className="game-header-container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
          zIndex: 50,
          flexShrink: 0,
          maxWidth: '100%',
        }}>
          {/* 1. KHUNG TIÊU ĐỀ TRÒ CHƠI (Đồng bộ bảng màu Dark Slate) */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '7px 28px',
            borderRadius: '999px',
            background: 'rgba(30, 41, 59, 0.88)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
          }}>
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(1.1rem, 1.8vw, 1.35rem)',
              fontWeight: 800,
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: '#f8fafc',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              lineHeight: 1.2,
            }}>
              GIẢI CỨU CHÍCH BÔNG
            </h1>
          </div>

          {/* 2. THANH DOCK ĐIỀU KHIỂN & CHỌN THỬ THÁCH (Đồng bộ tuyệt đối) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: 'rgba(30, 41, 59, 0.88)',
            backdropFilter: 'blur(20px)',
            padding: '5px 8px',
            borderRadius: '20px',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}>
            {/* Nút Xem Video Cốt Truyện */}
            <button
              onClick={() => setVideoSrc(formatPath('cus/chimchichbong_start.mp4'))}
              disabled={showQuestion || isFlying}
              className="game-control-btn"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#e2e8f0',
                cursor: (showQuestion || isFlying) ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s, border-color 0.2s',
              }}
              title="Xem video cốt truyện"
            >
              <BookOpen size={17} strokeWidth={2.2} color="#cbd5e1" />
            </button>

            {/* Dải phân cách dọc */}
            <div style={{
              width: '1px',
              height: '22px',
              background: 'rgba(255, 255, 255, 0.15)',
              margin: '0 2px',
            }} />

            {/* Segmented Control 3 Thử Thách */}
            <div style={{
              display: 'flex',
              gap: '4px',
              padding: '2px',
              borderRadius: '14px',
              background: 'rgba(0, 0, 0, 0.3)',
            }}>
              {([1, 2, 3] as StepId[]).map((step) => {
                const isActive = currentStep === step && !isFlying;
                const isTarget = isFlying && flightState?.to === step;

                return (
                  <button
                    key={step}
                    onClick={() => navigateToStep(step)}
                    disabled={isFlying || currentStep === step || showQuestion}
                    className="game-control-btn"
                    style={{
                      padding: '7px 15px',
                      borderRadius: '12px',
                      border: isActive
                        ? '1px solid #10b981'
                        : isTarget
                          ? '1px solid #0284c7'
                          : '1px solid transparent',
                      background: isActive
                        ? '#059669'
                        : isTarget
                          ? '#0284c7'
                          : 'transparent',
                      color: isActive || isTarget ? '#ffffff' : '#94a3b8',
                      fontWeight: isActive || isTarget ? 800 : 700,
                      fontSize: '0.85rem',
                      cursor: (isFlying || currentStep === step) ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      opacity: isFlying && !isTarget ? 0.45 : 1,
                      transition: 'background 0.2s, color 0.2s',
                    }}
                  >
                    {/* Badge số thứ tự 1, 2, 3 */}
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: isActive
                        ? '#ffffff'
                        : isTarget
                          ? '#ffffff'
                          : 'rgba(255, 255, 255, 0.12)',
                      color: isActive
                        ? '#059669'
                        : isTarget
                          ? '#0284c7'
                          : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      lineHeight: 1,
                    }}>
                      {step}
                    </div>

                    <span>Thử thách {step}</span>

                    {/* Loader khi đang bay */}
                    {isTarget && (
                      <Loader2 size={13} color="#bae6fd" className="spin-loader-icon" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </header>
      )}

      {/* SÂN KHẤU BẢN ĐỒ 16:9 */}
      <div
        style={{
          position: showQuestion ? 'fixed' : 'relative',
          bottom: showQuestion ? '16px' : undefined,
          right: showQuestion ? '16px' : undefined,
          width: showQuestion ? 'min(280px, 75vw)' : '100%',
          maxWidth: showQuestion ? 'min(280px, 75vw)' : 'min(1280px, 100%, calc((100vh - 170px) * (16 / 9)))',
          maxHeight: showQuestion ? undefined : 'calc(100vh - 170px)',
          aspectRatio: '16 / 9',
          borderRadius: showQuestion ? '14px' : '20px',
          overflow: 'hidden',
          boxShadow: showQuestion
            ? '0 16px 40px rgba(0,0,0,0.8), 0 0 0 2px rgba(255, 255, 255, 0.4)'
            : '0 25px 60px rgba(0,0,0,0.6)',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          backgroundColor: '#7dd3fc',
          userSelect: 'none',
          zIndex: showQuestion ? 20 : 10,
          pointerEvents: showQuestion ? 'none' : 'auto',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Ảnh Background */}
        <img
          src={formatPath('cus/chimchichbong_bg.png')}
          alt="Bản đồ Giải Cứu Chích Bông"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            pointerEvents: 'none',
          }}
        />

        {/* Nhân vật Chích Bông */}
        <div
          style={{
            position: 'absolute',
            width: '8.2%',
            aspectRatio: '1 / 1',
            zIndex: 30,
            pointerEvents: 'none',
            transform: 'translate(-50%, -88%)',
            left: !isFlying ? STEP_POSITIONS[currentStep].left : undefined,
            top: !isFlying ? STEP_POSITIONS[currentStep].top : undefined,
            animation: isFlying
              ? `${anim.name} ${anim.duration} cubic-bezier(0.42, 0, 0.58, 1) forwards`
              : 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: isFlying
                ? 'birdFlyingFlutter 0.35s infinite alternate ease-in-out'
                : 'none',
              transform: isFacingLeft() ? 'scaleX(-1)' : 'scaleX(1)',
              transition: 'transform 0.25s ease',
            }}
          >
            <img
              src={isFlying ? formatPath('cus/chimchichbong_bay.png') : formatPath('cus/chimchichbong_dung.png')}
              alt={isFlying ? 'Chim Chích Bông Đang Bay' : 'Chim Chích Bông Đang Đứng'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 5px 8px rgba(0,0,0,0.32))',
                display: 'block',
              }}
            />
          </div>

          {/* Bong bóng tương tác trên đầu Chích Bông */}
          {!isFlying && !showQuestion && (() => {
            const currentBubble = BUBBLE_CONFIG[currentStep];
            return (
              <button
                onClick={() => setShowQuestion(true)}
                className="bird-speech-bubble"
                style={{
                  position: 'absolute',
                  top: '-58%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 35,
                  background: currentBubble.bg,
                  color: currentBubble.color,
                  border: `2px solid ${currentBubble.border}`,
                  padding: '5px 12px',
                  borderRadius: '999px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.22), 0 3px 8px rgba(0,0,0,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'auto',
                  fontWeight: 900,
                  fontSize: 'clamp(0.72rem, 1.25vw, 0.95rem)',
                  userSelect: 'none',
                }}
                title={`Nhấn vào đây để xem nội dung ${currentBubble.label}`}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {currentBubble.icon}
                </span>
                <span style={{ letterSpacing: '0.4px' }}>{currentBubble.label}</span>
                <Sparkles size={12} color={currentBubble.color} style={{ flexShrink: 0, opacity: 0.8 }} />

                <div style={{
                  position: 'absolute',
                  bottom: '-7px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '7px solid transparent',
                  borderRight: '7px solid transparent',
                  borderTop: `7px solid ${currentBubble.border}`,
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '5px solid #ffffff',
                }} />
              </button>
            );
          })()}
        </div>
      </div>

      {/* MODAL BÀI ĐỌC THỬ THÁCH */}
      {showQuestion && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          zIndex: 60,
          background: 'rgba(9, 13, 22, 0.45)',
        }}>
          <ChallengeQuestionModal
            readingData={CHALLENGE_READING[currentStep]}
            onClose={() => setShowQuestion(false)}
            onComplete={handleCompleteChallenge}
          />
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        .game-control-btn {
          user-select: none;
          cursor: pointer;
        }
        .game-control-btn:hover:not(:disabled) {
          filter: brightness(1.1);
        }

        .spin-loader-icon {
          animation: spinAnimation 0.9s linear infinite;
        }
        @keyframes spinAnimation {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .bird-speech-bubble {
          animation: speechBubbleBounce 1.8s infinite ease-in-out;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s;
        }
        .bird-speech-bubble:hover {
          filter: brightness(1.08);
          transform: translateX(-50%) scale(1.1) !important;
        }
        .bird-speech-bubble:active {
          transform: translateX(-50%) scale(0.96) !important;
        }
        @keyframes speechBubbleBounce {
          0%, 100% { transform: translateX(-50%) translateY(0px) scale(1); }
          50%      { transform: translateX(-50%) translateY(-6px) scale(1.05); }
        }

        /* --- Bay từ Bục 3 vào Cổng Vòm Hoa (Hoàn thành) --- */
        @keyframes fly_to_garden_gate {
          0%   { left: 86.2%; top: 62.0%; transform: translate(-50%, -88%) scale(1); }
          40%  { left: 84.5%; top: 48.0%; transform: translate(-50%, -88%) scale(0.95); }
          100% { left: 83.0%; top: 39.0%; transform: translate(-50%, -88%) scale(0.85); opacity: 0.9; }
        }

        /* --- 1 ➔ 2: Vượt núi --- */
        @keyframes fly_1_to_2 {
          0%   { left: 12.8%; top: 84.0%; transform: translate(-50%, -88%) scale(1); }
          15%  { left: 17.0%; top: 60.0%; transform: translate(-50%, -88%) scale(1.06); }
          30%  { left: 22.5%; top: 36.0%; transform: translate(-50%, -88%) scale(1.14); }
          48%  { left: 31.0%; top: 14.0%; transform: translate(-50%, -88%) scale(1.24); }
          65%  { left: 37.5%; top: 32.0%; transform: translate(-50%, -88%) scale(1.15); }
          82%  { left: 44.0%; top: 54.0%; transform: translate(-50%, -88%) scale(1.07); }
          100% { left: 50.4%; top: 74.0%; transform: translate(-50%, -88%) scale(1); }
        }

        /* --- 2 ➔ 1: Vượt núi ngược lại --- */
        @keyframes fly_2_to_1 {
          0%   { left: 50.4%; top: 74.0%; transform: translate(-50%, -88%) scale(1); }
          18%  { left: 44.0%; top: 54.0%; transform: translate(-50%, -88%) scale(1.07); }
          35%  { left: 37.5%; top: 32.0%; transform: translate(-50%, -88%) scale(1.15); }
          52%  { left: 31.0%; top: 14.0%; transform: translate(-50%, -88%) scale(1.24); }
          70%  { left: 22.5%; top: 36.0%; transform: translate(-50%, -88%) scale(1.14); }
          85%  { left: 17.0%; top: 60.0%; transform: translate(-50%, -88%) scale(1.06); }
          100% { left: 12.8%; top: 84.0%; transform: translate(-50%, -88%) scale(1); }
        }

        /* --- 2 ➔ 3: Vượt sông --- */
        @keyframes fly_2_to_3 {
          0%   { left: 50.4%; top: 74.0%; transform: translate(-50%, -88%) scale(1); }
          25%  { left: 58.0%; top: 64.0%; transform: translate(-50%, -88%) scale(1.06); }
          50%  { left: 68.0%; top: 54.0%; transform: translate(-50%, -88%) scale(1.12); }
          75%  { left: 78.0%; top: 57.0%; transform: translate(-50%, -88%) scale(1.06); }
          100% { left: 86.2%; top: 62.0%; transform: translate(-50%, -88%) scale(1); }
        }

        /* --- 3 ➔ 2: Vượt sông ngược về bục 2 --- */
        @keyframes fly_3_to_2 {
          0%   { left: 86.2%; top: 62.0%; transform: translate(-50%, -88%) scale(1); }
          25%  { left: 78.0%; top: 57.0%; transform: translate(-50%, -88%) scale(1.06); }
          50%  { left: 68.0%; top: 54.0%; transform: translate(-50%, -88%) scale(1.12); }
          75%  { left: 58.0%; top: 64.0%; transform: translate(-50%, -88%) scale(1.06); }
          100% { left: 50.4%; top: 74.0%; transform: translate(-50%, -88%) scale(1); }
        }

        /* --- 1 ➔ 3: Vượt cả núi lẫn sông từ 1 sang 3 --- */
        @keyframes fly_1_to_3 {
          0%   { left: 12.8%; top: 84.0%; transform: translate(-50%, -88%) scale(1); }
          25%  { left: 31.0%; top: 14.0%; transform: translate(-50%, -88%) scale(1.24); }
          50%  { left: 50.4%; top: 70.0%; transform: translate(-50%, -88%) scale(1.05); }
          75%  { left: 68.0%; top: 54.0%; transform: translate(-50%, -88%) scale(1.12); }
          100% { left: 86.2%; top: 62.0%; transform: translate(-50%, -88%) scale(1); }
        }

        /* --- 3 ➔ 1: Vượt cả sông lẫn núi từ 3 về 1 --- */
        @keyframes fly_3_to_1 {
          0%   { left: 86.2%; top: 62.0%; transform: translate(-50%, -88%) scale(1); }
          25%  { left: 68.0%; top: 54.0%; transform: translate(-50%, -88%) scale(1.12); }
          50%  { left: 50.4%; top: 70.0%; transform: translate(-50%, -88%) scale(1.05); }
          75%  { left: 31.0%; top: 14.0%; transform: translate(-50%, -88%) scale(1.24); }
          100% { left: 12.8%; top: 84.0%; transform: translate(-50%, -88%) scale(1); }
        }

        @keyframes birdFlyingFlutter {
          0%   { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-6px) rotate(6deg); }
        }
      `}</style>
    </div>
  );
}
