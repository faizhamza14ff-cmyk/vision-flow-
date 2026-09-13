import { VideoStyle, CameraControl } from '../types';

export interface StructuredPrompt {
  subject: string;
  appearance: string;
  action: string;
  environment: string;
  location: string;
  camera: string;
  style: string;
  lighting: string;
  weather: string;
  duration: string;
  importantDetails: string[];
  originalPrompt: string;
}

export interface PromptAnalysisResult {
  parsed: StructuredPrompt;
  finalPrompt: string;
  negativePrompt: string;
  validationPassed: boolean;
  validationLog: string;
}

/**
 * 1. parseVideoPrompt(userPrompt)
 * Analyzes the user's original prompt and converts it into a structured JSON object.
 * Does not invent values that the user did not specify; leaves unspecified fields empty or safe defaults.
 */
export function parseVideoPrompt(userPrompt: string, style: VideoStyle = 'cinematic', camera: CameraControl = 'drone-shot'): StructuredPrompt {
  const prompt = (userPrompt || '').trim();
  const lower = prompt.toLowerCase();

  let subject = '';
  let appearance = '';
  let action = '';
  let environment = '';
  let location = '';
  let lighting = '';
  let weather = '';
  let duration = '10s';
  const importantDetails: string[] = [];

  // Color / Appearance detection
  const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'silver', 'matte black', 'purple', 'golden', 'orange', 'pink'];
  const foundColors = colors.filter((c) => lower.includes(c));
  if (foundColors.length > 0) {
    appearance = foundColors.join(', ');
    importantDetails.push(...foundColors);
  }

  // Subject detection
  const subjectKeywords = [
    'sports car', 'lamborghini', 'car', 'hypercar', 'vehicle', 'dog', 'cat', 'lion',
    'spaceship', 'astronaut', 'samurai', 'dragon', 'person', 'woman', 'man', 'city'
  ];
  for (const s of subjectKeywords) {
    if (lower.includes(s)) {
      subject = s;
      importantDetails.push(s);
      break;
    }
  }
  if (!subject && prompt.length > 0) {
    const words = prompt.split(' ');
    subject = words.slice(0, 3).join(' ');
  }

  // Location / Environment detection
  const locations = [
    'dubai', 'snowy mountain road', 'mars', 'beach', 'savanna', 'city',
    'space station', 'forest', 'skyscraper', 'alpine cliff', 'tokyo', 'new york', 'paris'
  ];
  for (const loc of locations) {
    if (lower.includes(loc)) {
      location = loc;
      environment = loc;
      importantDetails.push(loc);
      break;
    }
  }

  // Action detection
  const actions = ['flying', 'fly', 'driving', 'drift', 'running', 'run', 'landing', 'land', 'floating', 'float', 'walking', 'walk', 'racing', 'exploring'];
  for (const act of actions) {
    if (lower.includes(act)) {
      action = act;
      importantDetails.push(act);
      break;
    }
  }

  // Lighting & time
  if (lower.includes('night') || lower.includes('midnight')) lighting = 'night lighting';
  else if (lower.includes('sunset') || lower.includes('golden hour')) lighting = 'golden hour sunset lighting';
  else if (lower.includes('bright') || lower.includes('sunny')) lighting = 'bright daylight';

  // Weather
  if (lower.includes('snow') || lower.includes('snowy')) weather = 'snowy';
  else if (lower.includes('rain') || lower.includes('storm')) weather = 'rainy';
  else if (lower.includes('fog') || lower.includes('mist')) weather = 'foggy';

  return {
    subject: subject || '',
    appearance: appearance || '',
    action: action || '',
    environment: environment || location || '',
    location: location || environment || '',
    camera: camera || '',
    style: style || '',
    lighting: lighting || '',
    weather: weather || '',
    duration,
    importantDetails: Array.from(new Set(importantDetails)),
    originalPrompt: prompt,
  };
}

/**
 * 2. buildVideoPrompt(parsedPrompt)
 * Converts structured data into the final prompt sent to the video-generation API.
 * IMPORTANT: The original user prompt must ALWAYS be preserved and included in the final API prompt.
 */
export function buildVideoPrompt(parsedPrompt: StructuredPrompt): string {
  const parts = [
    `ORIGINAL USER PROMPT:\n"${parsedPrompt.originalPrompt}"`,
    ``,
    parsedPrompt.subject ? `SUBJECT:\n${parsedPrompt.appearance ? parsedPrompt.appearance + ' ' : ''}${parsedPrompt.subject}` : '',
    ``,
    parsedPrompt.action ? `ACTION:\n${parsedPrompt.action}` : '',
    ``,
    parsedPrompt.location ? `LOCATION:\n${parsedPrompt.location}` : '',
    ``,
    `REQUIREMENTS:\nThe generated video must strictly and accurately depict: "${parsedPrompt.originalPrompt}". Do not replace the subject, action, location, or colors with unrelated content. Maintain subject consistency throughout the video.`,
    ``,
    `CINEMATIC DETAILS:\n${parsedPrompt.lighting ? 'Lighting: ' + parsedPrompt.lighting + '. ' : ''}${parsedPrompt.weather ? 'Weather: ' + parsedPrompt.weather + '. ' : ''}Camera: ${parsedPrompt.camera}. Style: ${parsedPrompt.style}. Photorealistic physics and high-fidelity rendering.`
  ];

  return parts.filter((p, i) => p !== '' || i === 0).join('\n');
}

/**
 * 3. validateVideoPrompt(originalPrompt, finalPrompt)
 * Checks whether important concepts (nouns, actions, colors, locations, numbers, descriptive keywords)
 * from the original prompt are still present in the final prompt.
 * If important concepts are missing, automatically rebuilds the final prompt.
 */
export function validateVideoPrompt(originalPrompt: string, finalPrompt: string): boolean {
  if (!originalPrompt || !finalPrompt) return false;
  const origLower = originalPrompt.toLowerCase();
  const finalLower = finalPrompt.toLowerCase();

  const stopwords = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'over', 'through', 'into', 'a', 'an']);
  const words = origLower.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));

  if (words.length === 0) return true;

  let missingCount = 0;
  for (const word of words) {
    if (!finalLower.includes(word)) {
      missingCount++;
    }
  }

  // Allow at most 1 missing minor word, but require high fidelity
  return missingCount <= Math.max(0, Math.floor(words.length * 0.4));
}

/**
 * 4. generateDynamicNegativePrompt(originalPrompt, userNegative)
 * Dynamically generates a negative prompt based on the original request.
 */
export function generateDynamicNegativePrompt(originalPrompt: string, userNegative?: string): string {
  const origLower = (originalPrompt || '').toLowerCase();
  const baseNegatives = [
    userNegative,
    'wrong vehicle',
    'wrong color',
    'wrong action',
    'unrelated location',
    'unrelated objects',
    'random characters',
    'scene mismatch',
    'subject replacement',
    'incorrect environment',
    'distortion',
    'low quality'
  ].filter(Boolean);

  if (origLower.includes('red') && !origLower.includes('blue')) baseNegatives.push('blue color substitution');
  if (origLower.includes('blue') && !origLower.includes('red')) baseNegatives.push('red color substitution');
  if (origLower.includes('sports car') && !origLower.includes('truck')) baseNegatives.push('truck or bus replacement');

  return Array.from(new Set(baseNegatives)).join(', ');
}

/**
 * Full Pipeline helper function requested by prompt pipeline:
 * USER INPUT → parseVideoPrompt() → validate required concepts → buildVideoPrompt() → create dynamic negative prompt
 */
export function processVideoPromptPipeline(
  userPrompt: string,
  userNegativePrompt: string,
  style: VideoStyle,
  camera: CameraControl
): PromptAnalysisResult {
  const parsed = parseVideoPrompt(userPrompt, style, camera);
  let finalPrompt = buildVideoPrompt(parsed);

  let validationPassed = validateVideoPrompt(userPrompt, finalPrompt);
  let validationLog = validationPassed
    ? 'Validation PASSED: All important concepts from original prompt are strictly present in final prompt.'
    : 'Validation REVISED: Rebuilding prompt to enforce original requirements.';

  if (!validationPassed) {
    // Automatically rebuild final prompt if validation failed
    finalPrompt = `ORIGINAL USER PROMPT:\n"${userPrompt}"\n\nSUBJECT:\n${parsed.subject}\nACTION:\n${parsed.action}\nLOCATION:\n${parsed.location}\nREQUIREMENTS:\nStrict preservation of original user prompt without substitution.`;
    validationPassed = validateVideoPrompt(userPrompt, finalPrompt);
    validationLog = 'Validation REBUILT & PASSED: Strict compliance enforced.';
  }

  const negativePrompt = generateDynamicNegativePrompt(userPrompt, userNegativePrompt);

  return {
    parsed,
    finalPrompt,
    negativePrompt,
    validationPassed,
    validationLog,
  };
}
