// Type declarations for @mediapipe packages that lack full TS definitions

declare module '@mediapipe/face_mesh' {
  export interface Results {
    multiFaceLandmarks?: NormalizedLandmarkList[];
    image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;
  }

  export type NormalizedLandmark = { x: number; y: number; z: number; visibility?: number };
  export type NormalizedLandmarkList = NormalizedLandmark[];

  export interface FaceMeshOptions {
    maxNumFaces?: number;
    refineLandmarks?: boolean;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
  }

  export class FaceMesh {
    constructor(config: { locateFile: (file: string) => string });
    setOptions(options: FaceMeshOptions): void;
    onResults(callback: (results: Results) => void): void;
    send(inputs: { image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement }): Promise<void>;
    close(): void;
  }
}

declare module '@mediapipe/camera_utils' {
  export interface CameraOptions {
    onFrame: () => Promise<void>;
    width?: number;
    height?: number;
    facingMode?: string;
  }

  export class Camera {
    constructor(videoElement: HTMLVideoElement, options: CameraOptions);
    start(): Promise<void>;
    stop(): void;
  }
}

declare module '@mediapipe/drawing_utils' {
  export function drawConnectors(
    ctx: CanvasRenderingContext2D,
    landmarks: { x: number; y: number }[],
    connections: [number, number][],
    style?: { color?: string; lineWidth?: number }
  ): void;

  export function drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: { x: number; y: number }[],
    style?: { color?: string; lineWidth?: number; radius?: number }
  ): void;
}
