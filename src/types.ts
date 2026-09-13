export type VideoStyle =
  | 'cinematic'
  | 'realistic'
  | 'anime'
  | '3d-animation'
  | 'cartoon'
  | 'fantasy'
  | 'documentary';

export type AspectRatio = '16:9' | '9:16' | '1:1';

export type VideoDuration = '5s' | '10s' | '15s' | '30s';

export type VideoQuality = '720p' | '1080p' | '4k';

export type CameraControl =
  | 'close-up'
  | 'wide-shot'
  | 'tracking-shot'
  | 'drone-shot'
  | 'static';

export interface GenerationParams {
  prompt: string;
  negativePrompt?: string;
  style: VideoStyle;
  aspectRatio: AspectRatio;
  duration: VideoDuration;
  quality: VideoQuality;
  cameraControl: CameraControl;
  motionIntensity?: number; // 1 to 10
  seed?: number;
}

export interface VideoItem {
  id: string;
  title: string;
  prompt: string;
  negativePrompt?: string;
  videoUrl: string;
  thumbnailUrl: string;
  style: VideoStyle;
  aspectRatio: AspectRatio;
  duration: VideoDuration;
  quality: VideoQuality;
  cameraControl: CameraControl;
  createdAt: string;
  authorName: string;
  authorAvatar: string;
  likes: number;
  views: number;
  category: string;
  isFavorite?: boolean;
  isSaved?: boolean;
  tags: string[];
}

export type GenerationStage =
  | 'idle'
  | 'analyzing'
  | 'synthesizing_latents'
  | 'rendering_frames'
  | 'upscaling'
  | 'finalizing'
  | 'completed'
  | 'error';

export interface GenerationJob {
  id: string;
  params: GenerationParams;
  stage: GenerationStage;
  progress: number;
  stageMessage: string;
  estimatedSecondsLeft: number;
  resultVideo?: VideoItem;
  error?: string;
}

export type PricingPlanId = 'free' | 'pro' | 'ultimate';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: PricingPlanId;
  creditsRemaining: number;
  totalCredits: number;
  isLoggedIn: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}
