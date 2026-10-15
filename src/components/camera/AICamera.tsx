import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

export type TiltDirection = 'left' | 'right' | 'center' | null;

export interface AICameraProps {
  onTilt?: (direction: TiltDirection) => void;
  onReady?: (ready: boolean) => void;
  onError?: (errorMessage: string) => void;
  tiltThreshold?: number; // degrees, default 15
  width?: number;
  height?: number;
  mirrored?: boolean;
}

// Face landmark indices (MediaPipe FaceMesh)
const LEFT_EAR = 234;
const RIGHT_EAR = 454;

function computeTiltDegrees(landmarks: { x: number; y: number }[]): number {
  const left = landmarks[LEFT_EAR];
  const right = landmarks[RIGHT_EAR];
  const dx = right.x - left.x;
  const dy = right.y - left.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

const AICamera: React.FC<AICameraProps> = ({
  onTilt,
  onReady,
  onError,
  tiltThreshold = 15,
  width = 320,
  height = 240,
  mirrored = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastDirectionRef = useRef<TiltDirection>(null);
  const onTiltRef = useRef(onTilt);
  onTiltRef.current = onTilt;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const [cameraActive, setCameraActive] = useState(false);

  const handleResults = useCallback(
    (results: { multiFaceLandmarks?: { x: number; y: number; z: number }[][] }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        if (lastDirectionRef.current !== null) {
          lastDirectionRef.current = null;
          onTiltRef.current?.(null);
        }
        return;
      }

      const landmarks = results.multiFaceLandmarks[0];
      const tiltDeg = computeTiltDegrees(landmarks);

      let direction: TiltDirection;
      if (tiltDeg > tiltThreshold) {
        direction = 'right'; // screen-right, but head tilts left (mirrored)
      } else if (tiltDeg < -tiltThreshold) {
        direction = 'left';
      } else {
        direction = 'center';
      }

      // For mirrored camera: left/right are flipped
      if (mirrored) {
        if (direction === 'left') direction = 'right';
        else if (direction === 'right') direction = 'left';
      }

      if (direction !== lastDirectionRef.current) {
        lastDirectionRef.current = direction;
        onTiltRef.current?.(direction);
      }

      // Draw tilt indicator on canvas overlay
      const leftPt = landmarks[LEFT_EAR];
      const rightPt = landmarks[RIGHT_EAR];
      const cx = ((leftPt.x + rightPt.x) / 2) * canvas.width;
      const cy = ((leftPt.y + rightPt.y) / 2) * canvas.height;
      const radius = Math.abs(rightPt.x - leftPt.x) * canvas.width * 0.55;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.strokeStyle =
        direction === 'center'
          ? 'rgba(100,255,150,0.8)'
          : direction === 'left'
          ? 'rgba(99,179,255,0.9)'
          : 'rgba(255,140,99,0.9)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw tilt line
      const lx = leftPt.x * canvas.width;
      const ly = leftPt.y * canvas.height;
      const rx = rightPt.x * canvas.width;
      const ry = rightPt.y * canvas.height;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(rx, ry);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    [tiltThreshold, mirrored]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isMounted = true;
    let isProcessing = false;

    const faceMesh = new FaceMesh({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      if (!isMounted) return;
      handleResults(results);
    });
    faceMeshRef.current = faceMesh;

    // Use native getUserMedia directly to intercept and avoid camera_utils window.alert()
    const startWebcam = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Trình duyệt không hỗ trợ truy cập Camera (getUserMedia).');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: width },
            height: { ideal: height },
            facingMode: 'user',
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();

        setCameraActive(true);
        onReadyRef.current?.(true);

        // Frame loop to send frames to faceMesh
        const processFrame = async () => {
          if (!isMounted) return;
          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !isProcessing) {
            isProcessing = true;
            try {
              await faceMesh.send({ image: video });
            } catch (e) {
              // Ignore frame drop
            } finally {
              isProcessing = false;
            }
          }
          animFrameIdRef.current = requestAnimationFrame(processFrame);
        };

        animFrameIdRef.current = requestAnimationFrame(processFrame);
      } catch (err: any) {
        console.warn('Camera acquisition error:', err);
        let msg = 'Không thể kết nối với thiết bị camera.';
        if (err.name === 'NotFoundError' || err.message?.includes('Requested device not found')) {
          msg = 'Không tìm thấy thiết bị Camera trên máy tính. Bạn vẫn có thể nhấp trực tiếp vào ô Trái / Phải để trả lời!';
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          msg = 'Quyền truy cập Camera đã bị từ chối. Vui lòng cho phép quyền Camera trên trình duyệt để chơi bằng cử chỉ nghiêng đầu!';
        } else if (err.name === 'NotReadableError') {
          msg = 'Camera đang được ứng dụng khác sử dụng (Zoom, Teams...). Vui lòng tắt ứng dụng kia và tải lại trang!';
        }
        onErrorRef.current?.(msg);
      }
    };

    startWebcam();

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      faceMeshRef.current?.close();
    };
  }, [width, height, handleResults]);

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        backgroundColor: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '4px solid rgba(255, 255, 255, 0.4)',
        background: 'radial-gradient(circle at 50% 35%, #334155 0%, #0f172a 100%)',
      }}
    >
      {/* Fallback placeholder khi camera đang tải hoặc chưa cấp quyền */}
      {!cameraActive && (
        <div style={{ textAlign: 'center', userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            border: '3px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 15px rgba(56, 189, 248, 0.5)'
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '99px' }}>
            Đang bật Camera...
          </span>
        </div>
      )}

      {/* Video stream thực tế từ webcam */}
      <video
        ref={videoRef}
        style={{
          display: cameraActive ? 'block' : 'none',
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: mirrored ? 'scaleX(-1)' : undefined,
        }}
        playsInline
        muted
      />

      {/* Canvas vẽ overlay nhận diện đầu nghiêng */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: cameraActive ? 'block' : 'none',
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          transform: mirrored ? 'scaleX(-1)' : undefined,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default AICamera;
