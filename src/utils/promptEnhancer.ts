import { VideoStyle, CameraControl } from '../types';

export function enhancePrompt(
  prompt: string,
  style: VideoStyle,
  camera: CameraControl
): string {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) return '';

  const cameraModifiers: Record<CameraControl, string> = {
    'close-up': 'intimate close-up angle, shallow depth of field, razor-sharp focal focus, micro-textures',
    'wide-shot': 'sweeping epic wide-angle panoramic view, majestic environmental scale, deep depth of field',
    'tracking-shot': 'smooth fluid lateral tracking shot, steady-cam movement, natural motion blur, parallax depth',
    'drone-shot': 'elevated high-altitude aerial drone shot, dramatic descending camera swoop, expansive horizons',
    'static': 'locked-off tripod shot, symmetrical balanced composition, stillness, pristine spatial clarity',
  };

  const styleModifiers: Record<VideoStyle, string> = {
    'cinematic': 'shot on 70mm anamorphic lens, Arri Alexa LF, volumetric teal and amber rim lighting, film grain, cinematic color grading, 8K masterpiece',
    'realistic': 'photorealistic documentary precision, National Geographic clarity, natural daylight diffusion, authentic textures, uncompressed 4K',
    'anime': 'Makoto Shinkai aesthetic, Studio Ghibli cel-shaded atmosphere, lush hand-painted background layers, ethereal light particles, vivid color palettes',
    '3d-animation': 'Pixar and Disney animation studio quality, Octane render 3D, warm subsurface scattering, tactile materials, soft bounce lighting',
    'cartoon': 'vibrant hand-drawn illustrative 2D motion, bold graphic ink outlines, energetic expressive animation, dynamic squash and stretch',
    'fantasy': 'high-fantasy unreal engine 5 render, glowing ethereal runes, mystical atmospheric fog, enchanted particles, dark moody grandeur',
    'documentary': 'cinematic 35mm handheld documentary look, natural ambient illumination, authentic lived-in details, raw emotional tone',
  };

  const cameraDetail = cameraModifiers[camera] || cameraModifiers['wide-shot'];
  const styleDetail = styleModifiers[style] || styleModifiers['cinematic'];

  // Check if prompt already has lots of technical modifiers
  if (cleanPrompt.length > 150) {
    return `${cleanPrompt}, ${styleDetail}`;
  }

  return `${cleanPrompt}, ${cameraDetail}, ${styleDetail}`;
}

export const SUGGESTED_INSPIRATION_PROMPTS = [
  {
    title: 'Neon Cyberpunk Metropolis',
    prompt: 'A futuristic city at night with flying cars, towering holograms, and neon illuminated skyscrapers in rain',
    style: 'cinematic' as VideoStyle,
    camera: 'drone-shot' as CameraControl,
  },
  {
    title: 'Serengeti Golden Hour',
    prompt: 'A cinematic shot of a lion walking through the savanna at twilight, warm amber backlighting with floating dust motes',
    style: 'realistic' as VideoStyle,
    camera: 'tracking-shot' as CameraControl,
  },
  {
    title: 'Deep Cosmos Explorer',
    prompt: 'An astronaut floating outside an orbital space station above Earth with glowing auroras and stars',
    style: 'cinematic' as VideoStyle,
    camera: 'wide-shot' as CameraControl,
  },
  {
    title: 'Enchanted Crystal Grove',
    prompt: 'Ancient luminescent forest with floating purple orbs and giant glowing mushrooms under moonlit mist',
    style: 'fantasy' as VideoStyle,
    camera: 'tracking-shot' as CameraControl,
  },
  {
    title: 'Cyber Samurai Duel',
    prompt: 'Anime swordfighter standing atop a rainy skyscraper overlooking a neon metropolis at midnight',
    style: 'anime' as VideoStyle,
    camera: 'close-up' as CameraControl,
  },
  {
    title: 'Hypercar Mountain Ridge',
    prompt: 'Matte black concept hypercar drifting around scenic Alpine cliff roads during dramatic sunset',
    style: 'cinematic' as VideoStyle,
    camera: 'drone-shot' as CameraControl,
  },
];
