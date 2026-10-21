import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, HelpCircle, CheckCircle2, RotateCcw, BookOpen, Sparkles, Loader2 } from 'lucide-react';
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

// Dữ liệu bài đọc vần dành cho học sinh Lớp 1 tương ứng với 3 thử thách
const CHALLENGE_READING: Record<StepId, ChallengeReadingData> = {
  1: {
    id: 1,
    step: 1,
    stepTitle: 'Vượt Núi Cao',
    rhyme: 'ot',
    vocabulary: ['ngót', 'vót'],
    sentence: 'quả nhót',
  },
  2: {
    id: 2,
    step: 2,
    stepTitle: 'Vượt Dòng Sông',
    rhyme: 'ôt',
    vocabulary: ['cột', 'tốt'],
    sentence: 'lá lốt',
  },
  3: {
    id: 3,
    step: 3,
    stepTitle: 'Vượt qua cánh cổng',
    rhyme: 'ơt',
    vocabulary: ['thớt', 'vợt'],
    sentence: 'quả ớt',
  },
};

export default function ChimChichBong() {
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [flightState, setFlightState] = useState<FlightState | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showQuestion, setShowQuestion] = useState<boolean>(false);

  // Trạng thái màn hoàn thành thử thách vườn rau
  const [isCompletedSuccess, setIsCompletedSuccess] = useState<boolean>(false);
  const [isFlyingToGarden, setIsFlyingToGarden] = useState<boolean>(false);
  const [isPlayingGardenAudio, setIsPlayingGardenAudio] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gardenAudioRef = useRef<HTMLAudioElement | null>(null);
  const flightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Khởi tạo và cleanup audio cũng như timer khi unmount
  useEffect(() => {
    const audio = new Audio(formatPath('cus/description.mp3'));
    audioRef.current = audio;

    const gardenAudio = new Audio(formatPath('cus/tiengchimhot.mp3'));
    gardenAudio.loop = true;
    gardenAudioRef.current = gardenAudio;

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
      audio.pause();
      audio.onended = null;
      audio.onpause = null;
      audio.onerror = null;
      audio.src = '';
      audioRef.current = null;

      gardenAudio.pause();
      gardenAudio.src = '';
      gardenAudioRef.current = null;

      if (flightTimerRef.current) {
        clearTimeout(flightTimerRef.current);
        flightTimerRef.current = null;
      }
    };
  }, []);

  // Tự động phát tiếng chim hót khi về tới khu vườn (isCompletedSuccess)
  useEffect(() => {
    if (isCompletedSuccess && gardenAudioRef.current) {
      gardenAudioRef.current.currentTime = 0;
      gardenAudioRef.current.play()
        .then(() => setIsPlayingGardenAudio(true))
        .catch((err) => {
          console.warn('Lỗi tự động phát âm thanh tiếng chim hót:', err);
          setIsPlayingGardenAudio(false);
        });
    } else if (!isCompletedSuccess && gardenAudioRef.current) {
      gardenAudioRef.current.pause();
      gardenAudioRef.current.currentTime = 0;
      setIsPlayingGardenAudio(false);
    }
  }, [isCompletedSuccess]);

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

  const isFlying = flightState !== null || isFlyingToGarden;

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

  // Xử lý khi nhấn "Hoàn thành thử thách":
  // Chim bay từ bục 3 lên vị trí cổng vòm hoa, sau đó mở background vườn rau
  const handleCompleteChallenge = () => {
    if (isFlying || showQuestion) return;

    if (flightTimerRef.current) {
      clearTimeout(flightTimerRef.current);
      flightTimerRef.current = null;
    }

    // Tạm dừng audio nếu đang phát
    if (audioRef.current && isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }

    setIsFlyingToGarden(true);

    // Chuyến bay lên vòm cổng hoa kéo dài 2.5s rồi chuyển màn hình
    flightTimerRef.current = setTimeout(() => {
      flightTimerRef.current = null;
      setIsFlyingToGarden(false);
      setIsCompletedSuccess(true);
    }, 2500);
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
  // MÀN HÌNH HOÀN THÀNH: GIẢI CỨU THÀNH CÔNG CHÍCH BÔNG (VƯỜN RAU)
  // =========================================================================
  if (isCompletedSuccess) {
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

        {/* Khung Vườn Rau Xanh Mướt (chimchichbong_vuonrau.png) */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 'min(1280px, 100%, calc((100vh - 170px) * (16 / 9)))',
          maxHeight: 'calc(100vh - 170px)',
          aspectRatio: '16 / 9',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 0 2px rgba(134, 239, 172, 0.4)',
          border: '3px solid rgba(255, 255, 255, 0.35)',
          backgroundColor: '#86efac',
          userSelect: 'none',
        }}>
          {/* Background Vườn rau */}
          <img
            src={formatPath('cus/chimchichbong_vuonrau.png')}
            alt="Vườn rau nhà mình - Chích Bông giải cứu thành công"
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

          {/* Chú chim Chích Bông bay lượn qua lại tự do giữa vườn rau */}
          <div
            style={{
              position: 'absolute',
              width: '9.5%',
              aspectRatio: '1 / 1',
              zIndex: 30,
              pointerEvents: 'none',
              animation: 'flyBackAndForth 8s infinite ease-in-out',
            }}
          >
            <img
              src={formatPath('cus/chimchichbong_bay.png')}
              alt="Chích Bông bay lượn vui vẻ trong vườn rau"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.35))',
                display: 'block',
              }}
            />
          </div>

          {/* Thanh nút điều khiển: Bật/Tắt tiếng chim hót & Chơi lại */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              zIndex: 40,
              display: 'flex',
              gap: '8px',
            }}
          >
            {/* Nút bật/tắt tiếng chim hót */}
            <button
              onClick={() => {
                if (!gardenAudioRef.current) return;
                if (gardenAudioRef.current.paused) {
                  gardenAudioRef.current.play()
                    .then(() => setIsPlayingGardenAudio(true))
                    .catch(() => {});
                } else {
                  gardenAudioRef.current.pause();
                  setIsPlayingGardenAudio(false);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                background: isPlayingGardenAudio ? 'rgba(15, 23, 42, 0.75)' : 'rgba(15, 23, 42, 0.55)',
                border: isPlayingGardenAudio ? '1.5px solid rgba(74, 222, 128, 0.6)' : '1.5px solid rgba(148, 163, 184, 0.4)',
                backdropFilter: 'blur(10px)',
                color: isPlayingGardenAudio ? '#86efac' : '#94a3b8',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: isPlayingGardenAudio ? '0 4px 16px rgba(74, 222, 128, 0.25)' : 'none',
              }}
              title={isPlayingGardenAudio ? 'Tắt tiếng chim hót' : 'Bật tiếng chim hót'}
            >
              {isPlayingGardenAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{isPlayingGardenAudio ? 'Tiếng chim hót' : 'Tắt âm thanh'}</span>
            </button>

            {/* Nút chơi lại từ đầu */}
            <button
              onClick={() => {
                if (gardenAudioRef.current) {
                  gardenAudioRef.current.pause();
                  gardenAudioRef.current.currentTime = 0;
                }
                setIsCompletedSuccess(false);
                setCurrentStep(1);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                border: '1.5px solid #86efac',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.5)',
              }}
              title="Khám phá lại hành trình"
            >
              <RotateCcw size={15} />
              <span>Chơi lại</span>
            </button>
          </div>
        </div>

        {/* Keyframe bay lượn qua lại trong vườn rau */}
        <style>{`
          @keyframes flyBackAndForth {
            0% {
              left: 15%;
              top: 32%;
              transform: translate(-50%, -50%) scaleX(1) rotate(2deg);
            }
            25% {
              left: 45%;
              top: 22%;
              transform: translate(-50%, -50%) scaleX(1) scale(1.1) rotate(-3deg);
            }
            49% {
              left: 80%;
              top: 35%;
              transform: translate(-50%, -50%) scaleX(1) rotate(4deg);
            }
            50% {
              left: 80%;
              top: 35%;
              transform: translate(-50%, -50%) scaleX(-1) rotate(4deg);
            }
            75% {
              left: 48%;
              top: 42%;
              transform: translate(-50%, -50%) scaleX(-1) scale(1.05) rotate(-2deg);
            }
            99% {
              left: 15%;
              top: 32%;
              transform: translate(-50%, -50%) scaleX(-1) rotate(2deg);
            }
            100% {
              left: 15%;
              top: 32%;
              transform: translate(-50%, -50%) scaleX(1) rotate(2deg);
            }
          }
        `}</style>
      </div>
    );
  }

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
            {/* Nút Nghe Thuyết Minh (Description Audio) */}
            <button
              onClick={handleToggleAudio}
              disabled={showQuestion || isFlying}
              className="game-control-btn"
              style={{
                padding: '8px 16px',
                borderRadius: '14px',
                border: isPlayingAudio
                  ? '1.5px solid #facc15'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                background: isPlayingAudio
                  ? 'linear-gradient(180deg, #f59e0b 0%, #b45309 100%)'
                  : 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: (showQuestion || isFlying) ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                boxShadow: isPlayingAudio
                  ? '0 0 16px rgba(245, 158, 11, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                  : 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transition: 'all 0.25s ease',
              }}
              title={isPlayingAudio ? 'Dừng đọc cốt truyện' : 'Nghe đọc cốt truyện'}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX size={17} color="#fff" />
                  <span>Dừng đọc</span>
                </>
              ) : (
                <>
                  <Volume2 size={17} color="#cbd5e1" />
                  <span style={{ color: '#f1f5f9' }}>Cốt truyện</span>
                </>
              )}
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
                if (audioRef.current && isPlayingAudio) {
                  audioRef.current.pause();
                  setIsPlayingAudio(false);
                }
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
          3. NÚT HOÀN THÀNH THỬ THÁCH (Đặt trên bầu trời phía trên vòm hoa: x = 83.0%, y = 10.0%)
          Khi học sinh đạt đến Bục 3 và chim đã dừng, nút phát hào quang mời gọi hoàn thành
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

            {/* Nút hành động hoàn thành thử thách */}
            <button
              onClick={handleCompleteChallenge}
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
              title="Nhấn để cùng Chích Bông hoàn thành thử thách bay vào vườn rau!"
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
        .pulse-action-btn {
          animation: pulseActionGlow 2s infinite ease-in-out;
        }
        @keyframes pulseActionGlow {
          0%, 100% {
            box-shadow: 0 4px 18px rgba(245, 158, 11, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 6px 24px rgba(245, 158, 11, 0.75), 0 0 12px rgba(251, 191, 36, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.6);
            transform: scale(1.04);
          }
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
            top: 39.0%; /* Vị trí đánh dấu màu đỏ ngay giữa vòm hoa */
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
