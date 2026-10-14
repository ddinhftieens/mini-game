import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { ChallengeQuestionModal, ChallengeReadingData } from './components/ChallengeQuestionModal';

/**
 * Các điểm mốc trên bản đồ (chuẩn hóa theo hệ tọa độ phần trăm 0% - 100%):
 * Tỷ lệ khung hình bản đồ gốc là 16:9.
 * Kích thước container chim: width 8.2%, aspectRatio: 1 / 1
 * Điểm neo căn chỉnh: transform: translate(-50%, -88%)
 *
 * Bục 1: x = 12.8%, y = 84.0%
 * Bục 2: x = 50.4%, y = 74.0%
 * Bục 3: x = 86.2%, y = 62.0%
 * Đỉnh núi (lá cờ): x = 31.0%, y = 14.0%
 * Đỉnh cầu gỗ: x = 68.0%, y = 54.0%
 */

type StepId = 1 | 2 | 3;

interface FlightState {
  from: StepId;
  to: StepId;
}

const baseUrl = import.meta.env.BASE_URL || '/';
const formatPath = (path: string) => `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

// Dữ liệu bài đọc vần dành cho học sinh Lớp 1 tương ứng với 3 thử thách
const CHALLENGE_READING: Record<StepId, ChallengeReadingData> = {
  1: {
    id: 1,
    step: 1,
    stepTitle: 'Vượt Núi Cao',
    rhyme: 'ui',
    vocabulary: ['ngọn núi', 'túi vải', 'gửi quà', 'vui vẻ'],
    sentence: 'Bé vui vẻ trèo lên đồi ngắm núi non.',
  },
  2: {
    id: 2,
    step: 2,
    stepTitle: 'Vượt Dòng Sông',
    rhyme: 'ông',
    vocabulary: ['dòng sông', 'hoa hồng', 'chích bông', 'cây thông'],
    sentence: 'Dòng sông trong xanh uốn lượn quanh làng.',
  },
  3: {
    id: 3,
    step: 3,
    stepTitle: 'Mở Cổng Vườn Hoa',
    rhyme: 'ươn',
    vocabulary: ['khu vườn', 'vươn vai', 'con lươn', 'sườn đồi'],
    sentence: 'Khu vườn nở rộ muôn sắc hoa tươi thắm.',
  },
};

export default function ChimChichBong() {
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [flightState, setFlightState] = useState<FlightState | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showQuestion, setShowQuestion] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Ref lưu ID của timeout chuyến bay để cancel và giải phóng bộ nhớ khi cần
  const flightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Khởi tạo và cleanup audio cũng như timer khi unmount
  useEffect(() => {
    const audio = new Audio(formatPath('cus/description.mp3'));
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlayingAudio(false);
    };

    audio.onpause = () => {
      setIsPlayingAudio(false);
    };

    audio.onerror = () => {
      setIsPlayingAudio(false);
    };

    return () => {
      // Dọn dẹp Audio
      audio.pause();
      audio.onended = null;
      audio.onpause = null;
      audio.onerror = null;
      audio.src = '';
      audioRef.current = null;

      // Dọn dẹp Timeout tránh memory leak
      if (flightTimerRef.current) {
        clearTimeout(flightTimerRef.current);
        flightTimerRef.current = null;
      }
    };
  }, []);

  // Bật/tắt đọc Description
  const handleToggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlayingAudio) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => setIsPlayingAudio(true))
        .catch((err) => {
          console.error('Audio playback error:', err);
          setIsPlayingAudio(false);
        });
    }
  };

  // Vị trí tĩnh của các bục
  const stepPositions: Record<StepId, { left: string; top: string }> = {
    1: { left: '12.8%', top: '84.0%' },
    2: { left: '50.4%', top: '74.0%' },
    3: { left: '86.2%', top: '62.0%' },
  };

  const isFlying = flightState !== null;

  const navigateToStep = (targetStep: StepId) => {
    if (isFlying || targetStep === currentStep || showQuestion) return;

    // Hủy bỏ timeout cũ nếu có trước khi tạo chuyến bay mới
    if (flightTimerRef.current) {
      clearTimeout(flightTimerRef.current);
      flightTimerRef.current = null;
    }

    setFlightState({ from: currentStep, to: targetStep });

    // Thời gian bay tùy thuộc vào khoảng cách
    const distance = Math.abs(targetStep - currentStep);
    const durationMs = distance === 2 ? 4600 : 3200;

    flightTimerRef.current = setTimeout(() => {
      flightTimerRef.current = null;
      setCurrentStep(targetStep);
      setFlightState(null);
    }, durationMs);
  };

  // Xác định animation name và duration dựa vào cặp (from -> to)
  const getFlightAnimation = () => {
    if (!flightState) return { name: 'none', duration: '0s' };
    const key = `fly_${flightState.from}_to_${flightState.to}`;
    const distance = Math.abs(flightState.to - flightState.from);
    const duration = distance === 2 ? '4.6s' : '3.2s';
    return { name: key, duration };
  };

  const anim = getFlightAnimation();

  // Xác định hướng quay mặt của chim
  const isFacingLeft = () => {
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
      padding: '10px 16px',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* 
        TIÊU ĐỀ TRÒ CHƠI & HEADER THANH ĐIỀU KHIỂN:
        Ẩn hoàn toàn khi đang mở bài đọc
      */}
      {!showQuestion && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
          zIndex: 50,
          transition: 'all 0.3s ease',
          flexShrink: 0,
        }}>
          {/* TIÊU ĐỀ TRÒ CHƠI (Tông xanh lá đồng bộ màu lông chim Chích Bông) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.18) 0%, rgba(16, 185, 129, 0.08) 100%)',
            padding: '5px 22px',
            borderRadius: '999px',
            border: '1.5px solid rgba(134, 239, 172, 0.45)',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}>
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(1.1rem, 1.8vw, 1.35rem)',
              fontWeight: 900,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #ffffff 0%, #bef264 40%, #86efac 75%, #4ade80 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 10px rgba(74, 222, 128, 0.45))',
            }}>
              Hành Trình Giải Cứu Chích Bông
            </h1>
          </div>

          {/* THANH HEADER ĐIỀU KHIỂN CÁC NÚT THỬ THÁCH */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(16px)',
            padding: '8px 16px',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
          }}>
        {/* Nút Nghe Thuyết Minh (Description Audio) */}
        <button
          onClick={handleToggleAudio}
          disabled={showQuestion}
          style={{
            padding: '9px 18px',
            borderRadius: '12px',
            border: isPlayingAudio
              ? '1.5px solid #facc15'
              : '1px solid rgba(255, 255, 255, 0.2)',
            background: isPlayingAudio
              ? 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)'
              : 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: isPlayingAudio ? '0 4px 16px rgba(234, 179, 8, 0.45)' : 'none',
            transition: 'all 0.25s ease',
          }}
          title={isPlayingAudio ? 'Dừng đọc cốt truyện' : 'Nghe đọc cốt truyện'}
        >
          {isPlayingAudio ? (
            <>
              <VolumeX size={18} />
              <span>Dừng đọc</span>
            </>
          ) : (
            <>
              <Volume2 size={18} />
              <span>Nghe cốt truyện</span>
            </>
          )}
        </button>

        {/* Đường ngăn cách nhẹ */}
        <div style={{
          width: '1px',
          height: '24px',
          background: 'rgba(255, 255, 255, 0.2)',
          margin: '0 4px',
        }} />

        {/* 3 Nút Thử Thách */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {([1, 2, 3] as StepId[]).map((step) => {
            const isActive = currentStep === step && !isFlying;
            const isTarget = isFlying && flightState?.to === step;

            return (
              <button
                key={step}
                onClick={() => navigateToStep(step)}
                disabled={isFlying || currentStep === step || showQuestion}
                style={{
                  padding: '9px 20px',
                  borderRadius: '12px',
                  border: isActive
                    ? '2px solid #6ee7b7'
                    : isTarget
                      ? '2px solid #38bdf8'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                  background: isActive
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : isTarget
                      ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: (isFlying || currentStep === step) ? 'default' : 'pointer',
                  boxShadow: isActive
                    ? '0 4px 18px rgba(16, 185, 129, 0.5)'
                    : isTarget
                      ? '0 4px 18px rgba(2, 132, 199, 0.45)'
                      : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: isFlying && !isTarget ? 0.6 : 1,
                }}
              >
                <span>Thử thách {step}</span>
                {isActive && (
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#fef08a',
                    boxShadow: '0 0 6px #fef08a',
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* NÚT XEM CÂU HỎI THỬ THÁCH (Xuất hiện khi chim đã dừng ở bục) */}
        {!isFlying && (
          <>
            <div style={{
              width: '1px',
              height: '24px',
              background: 'rgba(255, 255, 255, 0.2)',
              margin: '0 4px',
            }} />

            <button
              onClick={() => {
                // Tạm dừng thuyết minh nếu đang phát để bé tập trung đọc
                if (audioRef.current && isPlayingAudio) {
                  audioRef.current.pause();
                  setIsPlayingAudio(false);
                }
                setShowQuestion(true);
              }}
              style={{
                padding: '9px 18px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.45)',
                animation: 'pulseBtn 1.8s infinite',
                transition: 'all 0.2s',
              }}
            >
              <HelpCircle size={18} />
              <span>Bài đọc thử thách {currentStep}</span>
            </button>
          </>
        )}
          </div>
        </div>
      )}

      {/* 
        SÂN KHẤU TRÒ CHƠI RESPONSIVE 16:9
        Tự động co theo chiều cao và chiều rộng để vừa trọn 1 màn hình (1366x768, 1920x1080...)
      */}
      <div
        style={{
          position: showQuestion ? 'fixed' : 'relative',
          bottom: showQuestion ? '20px' : undefined,
          right: showQuestion ? '20px' : undefined,
          width: showQuestion ? '320px' : '100%',
          maxWidth: showQuestion ? '320px' : 'min(1280px, calc((100vh - 150px) * (16 / 9)))',
          maxHeight: showQuestion ? undefined : 'calc(100vh - 150px)',
          aspectRatio: '16 / 9',
          borderRadius: showQuestion ? '16px' : '20px',
          overflow: 'hidden',
          boxShadow: showQuestion
            ? '0 16px 40px rgba(0,0,0,0.8), 0 0 0 2px rgba(255, 255, 255, 0.4)'
            : '0 25px 60px rgba(0,0,0,0.6)',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          backgroundColor: '#7dd3fc',
          userSelect: 'none',
          zIndex: showQuestion ? 50 : 10,
          pointerEvents: showQuestion ? 'none' : 'auto',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* 1. Ảnh Background */}
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

        {/* 2. NHÂN VẬT CHIM CHÍCH BÔNG */}
        <div
          style={{
            position: 'absolute',
            width: '8.2%',
            aspectRatio: '1 / 1',
            zIndex: 30,
            pointerEvents: 'none',
            transform: 'translate(-50%, -88%)',
            left: !isFlying ? stepPositions[currentStep].left : undefined,
            top: !isFlying ? stepPositions[currentStep].top : undefined,
            animation: isFlying
              ? `${anim.name} ${anim.duration} cubic-bezier(0.42, 0, 0.58, 1) forwards`
              : 'none',
          }}
        >
          {/* Container hiển thị ảnh ĐỨNG hoặc BAY */}
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
        </div>
      </div>

      {/* 
        COMPONENT BÀI ĐỌC TRUNG TÂM DÀNH CHO HỌC SINH LỚP 1
      */}
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
          zIndex: 45,
          background: 'rgba(9, 13, 22, 0.45)',
        }}>
          <ChallengeQuestionModal
            readingData={CHALLENGE_READING[currentStep]}
            onClose={() => setShowQuestion(false)}
          />
        </div>
      )}

      {/* Keyframe Styles */}
      <style>{`
        /* Nút câu hỏi đập nhấp nháy thu hút sự chú ý */
        @keyframes pulseBtn {
          0%, 100% {
            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.7);
            transform: scale(1.03);
          }
        }

        /* --- 1 ➔ 2: Vượt núi --- */
        @keyframes fly_1_to_2 {
          0% { left: 12.8%; top: 84.0%; transform: translate(-50%, -88%) scale(1); }
          15% { left: 17.0%; top: 60.0%; transform: translate(-50%, -88%) scale(1.06); }
          30% { left: 22.5%; top: 36.0%; transform: translate(-50%, -88%) scale(1.14); }
          48% { left: 31.0%; top: 14.0%; transform: translate(-50%, -88%) scale(1.24); }
          65% { left: 37.5%; top: 32.0%; transform: translate(-50%, -88%) scale(1.15); }
          82% { left: 44.0%; top: 54.0%; transform: translate(-50%, -88%) scale(1.07); }
          100% { left: 50.4%; top: 74.0%; transform: translate(-50%, -88%) scale(1); }
        }

        /* --- 2 ➔ 1: Vượt núi ngược lại --- */
        @keyframes fly_2_to_1 {
          0% { left: 50.4%; top: 74.0%; transform: translate(-50%, -88%) scale(1); }
          18% { left: 44.0%; top: 54.0%; transform: translate(-50%, -88%) scale(1.07); }
          35% { left: 37.5%; top: 32.0%; transform: translate(-50%, -88%) scale(1.15); }
          52% { left: 31.0%; top: 14.0%; transform: translate(-50%, -88%) scale(1.24); }
          70% { left: 22.5%; top: 36.0%; transform: translate(-50%, -88%) scale(1.14); }
          85% { left: 17.0%; top: 60.0%; transform: translate(-50%, -88%) scale(1.06); }
          100% { left: 12.8%; top: 84.0%; transform: translate(-50%, -88%) scale(1); }
        }

        /* --- 2 ➔ 3: Vượt qua cây cầu gỗ bắc qua sông --- */
        @keyframes fly_2_to_3 {
          0% { left: 50.4%; top: 74.0%; transform: translate(-50%, -88%) scale(1); }
          25% { left: 58.0%; top: 64.0%; transform: translate(-50%, -88%) scale(1.06); }
          50% { left: 68.0%; top: 54.0%; transform: translate(-50%, -88%) scale(1.12); }
          75% { left: 78.0%; top: 57.0%; transform: translate(-50%, -88%) scale(1.06); }
          100% { left: 86.2%; top: 62.0%; transform: translate(-50%, -88%) scale(1); }
        }

        /* --- 3 ➔ 2: Vượt sông ngược về bục 2 --- */
        @keyframes fly_3_to_2 {
          0% { left: 86.2%; top: 62.0%; transform: translate(-50%, -88%) scale(1); }
          25% { left: 78.0%; top: 57.0%; transform: translate(-50%, -88%) scale(1.06); }
          50% { left: 68.0%; top: 54.0%; transform: translate(-50%, -88%) scale(1.12); }
          75% { left: 58.0%; top: 64.0%; transform: translate(-50%, -88%) scale(1.06); }
          100% { left: 50.4%; top: 74.0%; transform: translate(-50%, -88%) scale(1); }
        }

        /* --- 1 ➔ 3: Vượt cả núi lẫn sông từ 1 sang 3 --- */
        @keyframes fly_1_to_3 {
          0% { left: 12.8%; top: 84.0%; transform: translate(-50%, -88%) scale(1); }
          25% { left: 31.0%; top: 14.0%; transform: translate(-50%, -88%) scale(1.24); }
          50% { left: 50.4%; top: 70.0%; transform: translate(-50%, -88%) scale(1.05); }
          75% { left: 68.0%; top: 54.0%; transform: translate(-50%, -88%) scale(1.12); }
          100% { left: 86.2%; top: 62.0%; transform: translate(-50%, -88%) scale(1); }
        }

        /* --- 3 ➔ 1: Vượt cả sông lẫn núi từ 3 về 1 --- */
        @keyframes fly_3_to_1 {
          0% { left: 86.2%; top: 62.0%; transform: translate(-50%, -88%) scale(1); }
          25% { left: 68.0%; top: 54.0%; transform: translate(-50%, -88%) scale(1.12); }
          50% { left: 50.4%; top: 70.0%; transform: translate(-50%, -88%) scale(1.05); }
          75% { left: 31.0%; top: 14.0%; transform: translate(-50%, -88%) scale(1.24); }
          100% { left: 12.8%; top: 84.0%; transform: translate(-50%, -88%) scale(1); }
        }

        /* Hiệu ứng nhấp nhô lượn sóng chỉ khi chim đang bay */
        @keyframes birdFlyingFlutter {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-6px) rotate(6deg); }
        }
      `}</style>
    </div>
  );
}
