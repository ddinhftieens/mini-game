import React, { useEffect, useRef, useMemo } from 'react';
import { GameTheme } from '../types';
import { Sparkles } from 'lucide-react';

interface GameStageProps {
  theme: GameTheme;
  totalQuestions: number;
  correctCount: number;
  currentIndex: number;
  isWon: boolean;
}

export const GameStage: React.FC<GameStageProps> = ({
  theme,
  totalQuestions,
  correctCount,
  currentIndex,
  isWon,
}) => {
  const stepsCount = Math.max(totalQuestions, 1);
  const currentStep = isWon ? stepsCount : Math.min(currentIndex, stepsCount - 1);

  const activeStepRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn mượt đến vị trí nhân vật hoặc đích đến khi hoàn thành
  useEffect(() => {
    if (isWon && destinationRef.current) {
      destinationRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    } else if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentStep, isWon]);

  // Cấu hình kích thước và căn chỉnh chuyên biệt cho từng chủ đề
  const stageConfig = useMemo(() => {
    switch (theme.id) {
      case 'frog':
        return {
          destination: {
            width: '160px',
            height: '68px',
            imgHeight: '58px',
            charBottom: '22px',
            charLeft: undefined,
            charRight: undefined,
            charWidth: '56px',
            charHeight: '56px',
          },
          step: {
            width: '78px',
            height: '66px',
            activeWidth: '86px',
            activeHeight: '74px',
            glowSize: '92px',
            charBottom: '16px',
            charWidth: '50px',
            charHeight: '50px',
          },
          connectY: 74,
        };
      case 'snail':
        return {
          destination: {
            width: '95px',
            height: '92px',
            imgHeight: '88px',
            charBottom: '44px',
            charLeft: undefined,
            charRight: undefined,
            charWidth: '52px',
            charHeight: '52px',
          },
          step: {
            width: '84px',
            height: '62px',
            activeWidth: '92px',
            activeHeight: '70px',
            glowSize: '92px',
            charBottom: '16px',
            charWidth: '52px',
            charHeight: '52px',
          },
          connectY: 92,
        };
      case 'astronaut':
        return {
          destination: {
            width: '100px',
            height: '106px',
            imgHeight: '102px',
            charBottom: '14px',
            charLeft: '-18px',
            charRight: undefined,
            charWidth: '60px',
            charHeight: '60px',
          },
          step: {
            width: '98px',
            height: '92px',
            activeWidth: '108px',
            activeHeight: '100px',
            glowSize: '115px',
            charBottom: '38px',
            charWidth: '62px',
            charHeight: '62px',
          },
          connectY: 102,
        };
      case 'bee':
        return {
          destination: {
            width: '100px',
            height: '100px',
            imgHeight: '96px',
            charBottom: '22px',
            charLeft: '-14px',
            charRight: undefined,
            charWidth: '50px',
            charHeight: '50px',
          },
          step: {
            width: '82px',
            height: '78px',
            activeWidth: '90px',
            activeHeight: '86px',
            glowSize: '96px',
            charBottom: '26px',
            charWidth: '48px',
            charHeight: '48px',
          },
          connectY: 96,
        };
      case 'penguin':
        return {
          destination: {
            width: '110px',
            height: '92px',
            imgHeight: '88px',
            charBottom: '10px',
            charLeft: '-10px',
            charRight: undefined,
            charWidth: '50px',
            charHeight: '50px',
          },
          step: {
            width: '86px',
            height: '66px',
            activeWidth: '94px',
            activeHeight: '74px',
            glowSize: '94px',
            charBottom: '28px',
            charWidth: '50px',
            charHeight: '50px',
          },
          connectY: 92,
        };
      case 'rabbit':
        return {
          destination: {
            width: '80px',
            height: '108px',
            imgHeight: '104px',
            charBottom: '12px',
            charLeft: '-16px',
            charRight: undefined,
            charWidth: '52px',
            charHeight: '52px',
          },
          step: {
            width: '80px',
            height: '76px',
            activeWidth: '88px',
            activeHeight: '84px',
            glowSize: '94px',
            charBottom: '28px',
            charWidth: '50px',
            charHeight: '50px',
          },
          connectY: 104,
        };
      default:
        return {
          destination: {
            width: '120px',
            height: '80px',
            imgHeight: '76px',
            charBottom: '20px',
            charLeft: undefined,
            charRight: undefined,
            charWidth: '52px',
            charHeight: '52px',
          },
          step: {
            width: '80px',
            height: '70px',
            activeWidth: '88px',
            activeHeight: '78px',
            glowSize: '92px',
            charBottom: '18px',
            charWidth: '50px',
            charHeight: '50px',
          },
          connectY: 85,
        };
    }
  }, [theme.id]);

  // Chiều cao và khoảng cách giữa các lá sen / bậc bước
  const stepRowHeight = 92;
  const destinationTop = 16;
  const topPaddingForDestination = 145;
  const totalTrailHeight = stepsCount * stepRowHeight + topPaddingForDestination + 30;

  // Tính toán tọa độ (x, y) zigzag tự nhiên cho từng bước
  // X: từ 24% đến 72% để giữ khoảng đệm thoáng đãng ở mép bên phải (nơi có thanh cuộn)
  const stepsPositions = useMemo(() => {
    return Array.from({ length: stepsCount }).map((_, idx) => {
      const pattern = [25, 72, 30, 68, 24, 74, 28, 70];
      const xPercent = pattern[idx % pattern.length];
      const yPos = (stepsCount - 1 - idx) * stepRowHeight + topPaddingForDestination;
      return { xPercent, yPos, idx };
    });
  }, [stepsCount]);

  // Đường cong Bézier uốn lượn mềm mại nối từ Bậc 1 -> ... -> Bậc cuối -> Đích đến
  const pathD = useMemo(() => {
    if (stepsPositions.length === 0) return '';
    let d = `M ${stepsPositions[0].xPercent} ${stepsPositions[0].yPos}`;
    for (let i = 0; i < stepsPositions.length - 1; i++) {
      const p1 = stepsPositions[i];
      const p2 = stepsPositions[i + 1];
      const midY = (p1.yPos + p2.yPos) / 2;
      d += ` C ${p1.xPercent} ${midY}, ${p2.xPercent} ${midY}, ${p2.xPercent} ${p2.yPos}`;
    }
    const lastP = stepsPositions[stepsPositions.length - 1];
    d += ` C ${lastP.xPercent} ${lastP.yPos - 35}, 50 ${lastP.yPos - 25}, 50 ${stageConfig.connectY}`;
    return d;
  }, [stepsPositions, stageConfig.connectY]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '24px',
      padding: '16px',
      boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08)',
      border: '3px solid #ffffff',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      width: '100%',
    }}>
      {/* Sân khấu: Khung bo viền hoàn chỉnh với thanh cuộn nằm gọn gàng bên trong */}
      <div
        style={{
          flex: 1,
          background: (() => {
            switch (theme.id) {
              case 'frog':
                return 'linear-gradient(180deg, #6ee7b7 0%, #38bdf8 55%, #0284c7 100%)';
              case 'snail':
                return 'linear-gradient(180deg, #fef08a 0%, #fb923c 55%, #b45309 100%)';
              case 'bee':
                return 'linear-gradient(180deg, #fef08a 0%, #facc15 55%, #ca8a04 100%)';
              case 'astronaut':
                return 'linear-gradient(180deg, #38bdf8 0%, #0369a1 55%, #0f172a 100%)';
              case 'penguin':
                return 'linear-gradient(180deg, #a5f3fc 0%, #38bdf8 55%, #0369a1 100%)';
              case 'rabbit':
                return 'linear-gradient(180deg, #fbcfe8 0%, #fb7185 55%, #e11d48 100%)';
              default:
                return 'linear-gradient(180deg, #6ee7b7 0%, #38bdf8 55%, #0284c7 100%)';
            }
          })(),
          borderRadius: '20px',
          position: 'relative',
          boxShadow: 'inset 0 4px 14px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {/* VÙNG CUỘN SCROLL ĐỘC LẬP - NẰM TRỌN BÊN TRONG VIỀN BO TRÒN */}
        <div
          ref={scrollContainerRef}
          className="stage-scroll-viewport"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            width: '100%',
            height: '100%',
            paddingRight: '4px',
            boxSizing: 'border-box',
          }}
        >
          {/* Lớp nội dung bên trong */}
          <div style={{
            position: 'relative',
            width: '100%',
            minHeight: `${totalTrailHeight}px`,
            paddingTop: '16px',
            paddingBottom: '30px',
            boxSizing: 'border-box',
          }}>

            {/* 1. ĐÍCH ĐẾN (BỜ SÔNG / TỔ ONG / PHI THUYỀN / CÀ RỐT /...) */}
            <div
              ref={destinationRef}
              style={{
                position: 'absolute',
                top: `${destinationTop}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div style={{
                position: 'relative',
                width: stageConfig.destination.width,
                height: stageConfig.destination.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Ảnh Đích Đến */}
                {theme.destinationImage && (
                  <img
                    src={theme.destinationImage}
                    alt={theme.destinationName}
                    style={{
                      position: 'absolute',
                      bottom: '0px',
                      width: '100%',
                      height: stageConfig.destination.imgHeight || '100%',
                      objectFit: 'contain',
                      filter: isWon
                        ? 'drop-shadow(0 8px 18px rgba(0,0,0,0.35))'
                        : 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))',
                    }}
                  />
                )}

                {/* NHÂN VẬT KHI HOÀN THÀNH VỀ ĐÍCH */}
                {isWon && theme.characterImage && (
                  <div
                    className="animate-jump"
                    style={{
                      position: 'absolute',
                      bottom: stageConfig.destination.charBottom || '20px',
                      left: stageConfig.destination.charLeft,
                      right: stageConfig.destination.charRight,
                      width: stageConfig.destination.charWidth || '52px',
                      height: stageConfig.destination.charHeight || '52px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 25,
                    }}
                    title={theme.characterName}
                  >
                    <img
                      src={theme.characterImage}
                      alt={theme.characterName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.38))',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2. ĐƯỜNG CONG UỐN LƯỢN NỐI CÁC BẬC TỚI ĐÍCH (SVG Path) */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${totalTrailHeight}px`,
                pointerEvents: 'none',
                zIndex: 5,
              }}
              viewBox={`0 0 100 ${totalTrailHeight}`}
              preserveAspectRatio="none"
            >
              {/* Viền đổ bóng dưới đường nối */}
              <path
                d={pathD}
                fill="none"
                stroke="rgba(0, 70, 60, 0.22)"
                strokeWidth="5"
                strokeDasharray="6,6"
                strokeLinecap="round"
              />
              {/* Đường nét đứt màu trắng phát sáng uốn lượn */}
              <path
                d={pathD}
                fill="none"
                stroke="rgba(255, 255, 255, 0.95)"
                strokeWidth="3.5"
                strokeDasharray="6,6"
                strokeLinecap="round"
              />
            </svg>

            {/* 3. CÁC BẬC BƯỚC ĐẶT THEO TỌA ĐỘ UỐN LƯỢN */}
            {stepsPositions.map((pos) => {
              const stepNum = pos.idx + 1;
              const hasCharacter = !isWon && currentStep === pos.idx;
              const isPassed = correctCount >= stepNum;

              const stepW = hasCharacter ? stageConfig.step.activeWidth : stageConfig.step.width;
              const stepH = hasCharacter ? stageConfig.step.activeHeight : stageConfig.step.height;

              return (
                <div
                  key={pos.idx}
                  ref={hasCharacter ? activeStepRef : null}
                  style={{
                    position: 'absolute',
                    top: `${pos.yPos}px`,
                    left: `${pos.xPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: hasCharacter ? 15 : 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'default',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Khu vực Bậc bước + Nhân vật đứng trên */}
                  <div style={{
                    position: 'relative',
                    width: stepW,
                    height: stepH,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}>
                    {/* Hiệu ứng hào quang khi nhân vật đang đứng */}
                    {hasCharacter && (
                      <div style={{
                        position: 'absolute',
                        width: stageConfig.step.glowSize,
                        height: stageConfig.step.glowSize,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(52,211,153,0.3) 60%, transparent 80%)',
                        animation: 'pulseGlow 2s infinite',
                        zIndex: 1,
                      }} />
                    )}

                    {/* Ảnh Bậc bước (Lá sen, Bông hoa, Thiên thạch, Nấm,...) */}
                    {theme.stepImage ? (
                      <img
                        src={theme.stepImage}
                        alt={`${theme.stepName} ${stepNum}`}
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          opacity: isPassed || hasCharacter ? 1 : 0.75,
                          filter: hasCharacter
                            ? 'drop-shadow(0 8px 14px rgba(0,0,0,0.35))'
                            : isPassed
                              ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                              : 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                          transform: hasCharacter ? 'scale(1.06)' : 'scale(1)',
                          transition: 'transform 0.3s ease',
                          zIndex: 2,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: hasCharacter ? '#10b981' : isPassed ? '#22c55e' : '#64748b',
                        zIndex: 2,
                      }} />
                    )}

                    {/* HUY HIỆU SỐ THỨ TỰ TRÊN BẬC */}
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                      minWidth: '22px',
                      height: '22px',
                      padding: '0 5px',
                      borderRadius: '999px',
                      background: hasCharacter ? '#065f46' : isPassed ? '#16a34a' : 'rgba(15, 23, 42, 0.75)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                      border: '1.5px solid #ffffff',
                      zIndex: 9,
                    }}>
                      {stepNum}
                    </span>

                    {/* NHÂN VẬT ĐỨNG TRÊN BẬC */}
                    {hasCharacter && theme.characterImage && (
                      <div
                        className="animate-jump"
                        style={{
                          position: 'absolute',
                          bottom: stageConfig.step.charBottom,
                          width: stageConfig.step.charWidth,
                          height: stageConfig.step.charHeight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 8,
                        }}
                        title={theme.characterName}
                      >
                        <img
                          src={theme.characterImage}
                          alt={theme.characterName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))',
                          }}
                        />
                      </div>
                    )}

                    {/* Biểu tượng lấp lánh khi đã vượt qua */}
                    {/* {isPassed && !hasCharacter && (
                      <span style={{
                        position: 'absolute',
                        top: '0px',
                        right: '0px',
                        color: '#ffffff',
                        background: '#16a34a',
                        borderRadius: '50%',
                        padding: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                        border: '1.5px solid #ffffff',
                        zIndex: 9,
                      }}>
                        <Sparkles size={12} color="#ffffff" />
                      </span>
                    )} */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Thông điệp khích lệ */}
      <div style={{
        marginTop: '10px',
        padding: '10px 14px',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1.5px solid #e2e8f0',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        <p style={{ fontSize: '0.92rem', color: '#1e293b', fontWeight: 700, margin: 0 }}>
          {isWon
            ? 'Tuyệt vời! Bạn đã hoàn thành xuất sắc thử thách!'
            : `Mỗi câu trả lời đúng sẽ giúp ${theme.characterName} tiến gần hơn tới đích!`}
        </p>
      </div>
    </div>
  );
};
