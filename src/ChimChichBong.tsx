import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, BookOpen, Sparkles, Loader2 } from 'lucide-react';
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
 * Cổng vườn hoa (Vị trí hoàn thành): x = 83.0%, y = 39.0%
 */

type StepId = 1 | 2 | 3;

interface FlightState {
  from: StepId;
  to: StepId;
}

const baseUrl = import.meta.env.BASE_URL || '/';
const formatPath = (path: string) => `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

// Dữ liệu bài đọc dành cho học sinh Lớp 1 tương ứng với 3 thử thách
const CHALLENGE_READING: Record<StepId, ChallengeReadingData> = {
  1: {
    id: 1,
    step: 1,
    stepTitle: 'Vượt Núi Cao',
    content: {
      type: 'rhymes',
      rhymes: [
        { rhyme: 'at',  words: ['bãi cát'] },
        { rhyme: 'ăt',  words: ['mặt trời'] },
        { rhyme: 'ât',  words: ['bật lửa'] },
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

// ============================================================
// COMPONENT VIDEO MODAL OVERLAY
// ============================================================
interface VideoModalProps {
  src: string;
  onClose: () => void;
}

function VideoModal({ src, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Tự động phát video khi mở modal
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Đóng modal khi video kết thúc
  const handleVideoEnded = () => {
    onClose();
  };

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
          onEnded={handleVideoEnded}
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

        {/* Nút đóng */}
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

  // Trạng thái màn hoàn thành thử thách vườn rau
  const [isFlyingToGarden, setIsFlyingToGarden] = useState<boolean>(false);

  // Trạng thái hiển thị video modal
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const flightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer khi unmount
  useEffect(() => {
    return () => {
      if (flightTimerRef.current) {
        clearTimeout(flightTimerRef.current);
        flightTimerRef.current = null;
      }
    };
  }, []);

  // Vị trí tĩnh của các bục
  const stepPositions: Record<StepId, { left: string; top: string }> = {
    1: { left: '12.8%', top: '84.0%' },
    2: { left: '50.4%', top: '74.0%' },
    3: { left: '86.2%', top: '62.0%' },
  };

  const isFlying = flightState !== null || isFlyingToGarden;

  // Xử lý khi nhấn "Khu vườn":
  // Chim bay từ bục 3 lên vị trí cổng vòm hoa (2.5s), sau đó mới mở video
  const handleGardenClick = () => {
    if (isFlying || showQuestion) return;

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

  // Xác định animation name và duration dựa vào cặp (from -> to)
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

  // Xác định hướng quay mặt của chim
  const isFacingLeft = () => {
    if (isFlyingToGarden) return false;
    if (isFlying && flightState) {
      return flightState.to < flightState.from;
    }
    return currentStep === 2;
  };

  // =========================================================================
  // MÀN HÌNH BẢN ĐỒ CHÍNH (HÀNH TRÌNH GIẢI CỨU CHÍCH BÔNG)
  // =========================================================================
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

      {/* VIDEO MODAL OVERLAY */}
      {videoSrc && (
        <VideoModal src={videoSrc} onClose={() => setVideoSrc(null)} />
      )}

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
          {/* TIÊU ĐỀ TRÒ CHƠI */}
          <div style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '7px 32px',
            borderRadius: '999px',
            background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.22) 0%, rgba(15, 23, 42, 0.75) 100%)',
            border: '1.5px solid rgba(74, 222, 128, 0.45)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45), 0 0 20px rgba(74, 222, 128, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(12px)',
          }}>
            <span style={{
              position: 'absolute',
              top: '2px',
              left: '12%',
              right: '12%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
            }} />
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(1.15rem, 1.8vw, 1.45rem)',
              fontWeight: 900,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              background: 'linear-gradient(180deg, #ffffff 15%, #bbf7d0 55%, #4ade80 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 8px rgba(34, 197, 94, 0.55))',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>🌿</span>
              <span>Giải Cứu Chích Bông</span>
              <span>🌿</span>
            </h1>
          </div>

          {/* THANH HEADER ĐIỀU KHIỂN CÁC NÚT THỬ THÁCH (Thanh Dock Gaming) */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.92) 100%)',
            backdropFilter: 'blur(20px)',
            padding: '7px 12px',
            borderRadius: '22px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}>
            {/* Nút Cốt Truyện — click để xem video chimchichbong_start.mp4 */}
            <button
              onClick={() => setVideoSrc(formatPath('cus/chimchichbong_start.mp4'))}
              disabled={showQuestion || isFlying}
              className="game-control-btn"
              style={{
                padding: '8px 16px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: (showQuestion || isFlying) ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transition: 'all 0.25s ease',
              }}
              title="Xem cốt truyện"
            >
              <BookOpen size={17} color="#cbd5e1" />
            </button>

            {/* Dải phân cách mờ */}
            <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.12)', margin: '0 2px' }} />

            {/* 3 Nút Thử Thách theo dạng Segmented Tabs */}
            <div style={{
              display: 'flex',
              gap: '6px',
              padding: '3px',
              borderRadius: '16px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              {([1, 2, 3] as StepId[]).map((step) => {
                const isActive = currentStep === step && !isFlying;
                const isTarget = isFlying && flightState?.to === step;

                return (
                  <button
                    key={step}
                    onClick={() => navigateToStep(step)}
                    disabled={isFlying || currentStep === step || showQuestion}
                    className={`game-control-btn ${isTarget ? 'flying-target-tab' : ''}`}
                    style={{
                      padding: '7px 15px',
                      borderRadius: '12px',
                      border: isActive
                        ? '1.5px solid #4ade80'
                        : isTarget
                          ? '1.5px solid #38bdf8'
                          : '1px solid transparent',
                      background: isActive
                        ? 'linear-gradient(180deg, #10b981 0%, #047857 100%)'
                        : isTarget
                          ? 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)'
                          : 'transparent',
                      color: isActive ? '#ffffff' : isTarget ? '#e0f2fe' : '#94a3b8',
                      fontWeight: isActive || isTarget ? 800 : 700,
                      fontSize: '0.85rem',
                      cursor: (isFlying || currentStep === step) ? 'default' : 'pointer',
                      boxShadow: isActive
                        ? '0 0 16px rgba(16, 185, 129, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35)'
                        : 'none',
                      transform: isActive ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: isFlying && !isTarget ? 0.45 : 1,
                    }}
                  >
                    <span>Thử thách {step}</span>
                    {isTarget && (
                      <Loader2 size={13} color="#bae6fd" className="spin-loader-icon" />
                    )}
                    {isActive && (
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#fef08a',
                        boxShadow: '0 0 8px #fef08a',
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/*
        SÂN KHẤU TRÒ CHƠI RESPONSIVE 16:9
        Tự động co giãn theo cả chiều rộng (mobile dọc) và chiều cao (màn hình nằm ngang)
      */}
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

          {/*
            BONG BÓNG TƯƠNG TÁC TRÊN ĐẦU CHÍCH BÔNG (Game Interactive Speech Bubble)
            Chỉ xuất hiện khi chim đã dừng ở bục và chưa mở bảng câu hỏi
          */}
          {!isFlying && !showQuestion && (
            <button
              onClick={() => {
                setShowQuestion(true);
              }}
              className="bird-speech-bubble"
              style={{
                position: 'absolute',
                top: '-55%',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 35,
                background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 40%, #fef3c7 100%)',
                color: '#92400e',
                border: '2px solid #f59e0b',
                padding: '4px 11px',
                borderRadius: '999px',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.45), 0 3px 8px rgba(0,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                pointerEvents: 'auto',
                fontWeight: 900,
                fontSize: 'clamp(0.72rem, 1.25vw, 0.95rem)',
                userSelect: 'none',
              }}
              title="Nhấn vào đây để xem bài đọc"
            >
              <span className="bubble-sparkle" style={{ fontSize: '1rem', lineHeight: 1 }}>📖</span>
              <span style={{ letterSpacing: '0.3px' }}>Đọc bài</span>
              <Sparkles size={13} color="#d97706" style={{ flexShrink: 0 }} />

              {/* Mũi nhọn tam giác chỉ xuống đầu chú chim */}
              <div style={{
                position: 'absolute',
                bottom: '-7px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: '7px solid #f59e0b',
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
                borderTop: '5px solid #fffbeb',
              }} />
            </button>
          )}
        </div>

        {/*
          3. NÚT KHU VƯỜN (Đặt trên bầu trời phía trên vòm hoa: x = 83.0%, y = 10.0%)
          Khi học sinh đạt đến Bục 3 và chim đã dừng, nút phát hào quang mời gọi hoàn thành.
          Click sẽ hiển thị video chimchichbong_end.mp4
        */}
        {!isFlying && currentStep === 3 && !showQuestion && (
          <div
            style={{
              position: 'absolute',
              left: '90.0%',
              top: '6.0%',
              transform: 'translate(-50%, -50%)',
              zIndex: 35,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Vòng hào quang phát sáng nhẹ */}
            <div className="garden-gate-glow" />

            {/* Nút hành động Khu Vườn */}
            <button
              onClick={handleGardenClick}
              className="garden-gate-btn"
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 16px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%)',
                color: '#ffffff',
                border: '2px solid #fbcfe8',
                fontWeight: 900,
                fontSize: 'clamp(0.72rem, 1.25vw, 0.95rem)',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(219, 39, 119, 0.65), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
              title="Nhấn để xem Chích Bông bay vào khu vườn!"
            >
              <CheckCircle2 size={16} color="#fdf2f8" />
              <span>Khu vườn</span>
            </button>
          </div>
        )}
      </div>

      {/*
        COMPONENT BÀI ĐỌC TRUNG TÂM DÀNH CHO HỌC SINH LỚP 1
        zIndex: 60 đè nổi hoàn toàn lên trên hình ảnh bản đồ thu nhỏ
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
          zIndex: 60,
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
        .game-control-btn {
          user-select: none;
          cursor: pointer;
        }
        .game-control-btn:hover:not(:disabled) {
          filter: brightness(1.12);
          transform: translateY(-1px);
        }
        .game-control-btn:active:not(:disabled) {
          transform: translateY(1px);
          filter: brightness(0.95);
        }

        /* Nút thử thách đang bay tới (Target Flight State) */
        .flying-target-tab {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0c4a6e 100%) !important;
          border: 1.5px solid #38bdf8 !important;
          animation: flyingTabGlow 1.2s infinite ease-in-out;
        }
        .spin-loader-icon {
          animation: spinAnimation 0.9s linear infinite;
        }
        @keyframes flyingTabGlow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4);
            transform: scale(1.01);
          }
          50% {
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.75), 0 0 8px rgba(125, 211, 252, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.7);
            transform: scale(1.03);
          }
        }
        @keyframes spinAnimation {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Bong bóng hội thoại tương tác trên đầu chim */
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
          0%, 100% {
            transform: translateX(-50%) translateY(0px) scale(1);
          }
          50% {
            transform: translateX(-50%) translateY(-6px) scale(1.05);
          }
        }

        /* Hiệu ứng Cổng Vườn Hoa - Đích đến Thử thách 3 */
        .garden-gate-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(244, 114, 182, 0.5) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 75%);
          animation: gateAuraPulse 2s infinite ease-in-out;
          pointer-events: none;
        }
        .garden-gate-btn {
          animation: gateBtnFloat 2s infinite ease-in-out;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .garden-gate-btn:hover {
          transform: scale(1.1);
          filter: brightness(1.12);
          box-shadow: 0 8px 26px rgba(219, 39, 119, 0.8), 0 0 16px rgba(244, 114, 182, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
        }
        .garden-gate-btn:active {
          transform: scale(0.96);
        }
        @keyframes gateAuraPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 1;
          }
        }
        @keyframes gateBtnFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.03);
          }
        }

        /* --- Bay từ Bục 3 vào Cổng Vòm Hoa (Hoàn thành) --- */
        @keyframes fly_to_garden_gate {
          0% {
            left: 86.2%;
            top: 62.0%;
            transform: translate(-50%, -88%) scale(1);
          }
          40% {
            left: 84.5%;
            top: 48.0%;
            transform: translate(-50%, -88%) scale(0.95);
          }
          100% {
            left: 83.0%;
            top: 39.0%;
            transform: translate(-50%, -88%) scale(0.85);
            opacity: 0.9;
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
