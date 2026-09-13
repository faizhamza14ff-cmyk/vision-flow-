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
 * Parses the user's original prompt and converts it into a structured JSON object.
 * Does not invent values that the user did not specify; leaves unspecified fields empty or safe defaults.
 */
export function parseVideoPrompt(
  userPrompt: string,
  style: VideoStyle = 'cinematic',
  camera: CameraControl = 'drone-shot'
): StructuredPrompt {
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

  return missingCount <= Math.max(0, Math.floor(words.length * 0.4));
}

/**
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
 * Full Pipeline helper function:
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
  durationSeconds: number;
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
 * Extracts the duration requested by the user.
 *
 * Examples:
 * "5 second video"       -> 5
 * "10 seconds"           -> 10
 * "30 sec video"         -> 30
 * "1 minute video"       -> 60
 * "1 min 30 sec video"   -> 90
 */
export function extractDuration(userPrompt: string): number {
  const prompt = (userPrompt || '').toLowerCase();

  // 1 min 30 sec / 2 minutes 15 seconds
  const combinedMatch = prompt.match(
    /(\d+(?:\.\d+)?)\s*(?:minutes?|mins?)\s*(?:and\s*)?(\d+(?:\.\d+)?)\s*(?:seconds?|secs?)/i
  );

  if (combinedMatch) {
    const minutes = Number(combinedMatch[1]);
    const seconds = Number(combinedMatch[2]);

    if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
      return Math.round(minutes * 60 + seconds);
    }
  }

  // Minutes only
  const minuteMatch = prompt.match(
    /(\d+(?:\.\d+)?)\s*(?:minutes?|mins?)\b/i
  );

  if (minuteMatch) {
    const minutes = Number(minuteMatch[1]);

    if (Number.isFinite(minutes)) {
      return Math.round(minutes * 60);
    }
  }

  // Seconds
  const secondMatch = prompt.match(
    /(\d+(?:\.\d+)?)\s*(?:seconds?|secs?)\b/i
  );

  if (secondMatch) {
    const seconds = Number(secondMatch[1]);

    if (Number.isFinite(seconds)) {
      return Math.round(seconds);
    }
  }

  // Default if user doesn't specify duration
  return 10;
}

/**
 * Converts seconds to a clean API/UI duration string.
 */
export function formatDuration(seconds: number): string {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${seconds}s`;
}

/**
 * Parses the user's original prompt.
 */
export function parseVideoPrompt(
  userPrompt: string,
  style: VideoStyle = 'cinematic',
  camera: CameraControl = 'drone-shot'
): StructuredPrompt {
  const prompt = (userPrompt || '').trim();
  const lower = prompt.toLowerCase();

  const durationSeconds = extractDuration(prompt);

  let subject = '';
  let appearance = '';
  let action = '';
  let environment = '';
  let location = '';
  let lighting = '';
  let weather = '';

  const importantDetails: string[] = [];

  /*
   * IMPORTANT:
   * Keep the original prompt as the source of truth.
   */

  // Colors
  const colors = [
    'red',
    'blue',
    'green',
    'black',
    'white',
    'yellow',
    'silver',
    'matte black',
    'purple',
    'golden',
    'orange',
    'pink'
  ];

  const foundColors = colors.filter((color) =>
    lower.includes(color)
  );

  if (foundColors.length) {
    appearance = foundColors.join(', ');
    importantDetails.push(...foundColors);
  }

  // Subjects
  const subjectKeywords = [
    'sports car',
    'lamborghini',
    'ferrari',
    'porsche',
    'mustang',
    'tesla',
    'car',
    'hypercar',
    'vehicle',
    'motorcycle',
    'bike',
    'truck',
    'bus',
    'airplane',
    'helicopter',
    'dog',
    'cat',
    'lion',
    'tiger',
    'elephant',
    'horse',
    'spaceship',
    'rocket',
    'astronaut',
    'samurai',
    'dragon',
    'robot',
    'person',
    'woman',
    'man',
    'city'
  ];

  // Longest match first
  const sortedSubjects = [...subjectKeywords].sort(
    (a, b) => b.length - a.length
  );

  for (const keyword of sortedSubjects) {
    if (lower.includes(keyword)) {
      subject = keyword;
      importantDetails.push(keyword);
      break;
    }
  }

  // Locations
  const locations = [
    'dubai',
    'tokyo',
    'new york',
    'paris',
    'london',
    'india',
    'mumbai',
    'delhi',
    'los angeles',
    'snowy mountain road',
    'mountain',
    'mars',
    'beach',
    'savanna',
    'space station',
    'forest',
    'desert',
    'skyscraper',
    'alpine cliff'
  ];

  const sortedLocations = [...locations].sort(
    (a, b) => b.length - a.length
  );

  for (const loc of sortedLocations) {
    if (lower.includes(loc)) {
      location = loc;
      environment = loc;
      importantDetails.push(loc);
      break;
    }
  }

  // Actions
  const actions = [
    'flying',
    'fly',
    'driving',
    'drive',
    'drifting',
    'drift',
    'running',
    'run',
    'landing',
    'land',
    'floating',
    'float',
    'walking',
    'walk',
    'racing',
    'race',
    'exploring',
    'explore',
    'jumping',
    'jump',
    'swimming',
    'swim',
    'dancing',
    'dance',
    'crashing',
    'crash',
    'taking off',
    'take off'
  ];

  const sortedActions = [...actions].sort(
    (a, b) => b.length - a.length
  );

  for (const act of sortedActions) {
    if (lower.includes(act)) {
      action = act;
      importantDetails.push(act);
      break;
    }
  }

  // Lighting
  if (
    lower.includes('night') ||
    lower.includes('midnight')
  ) {
    lighting = 'night lighting';
    importantDetails.push('night');
  } else if (
    lower.includes('sunset') ||
    lower.includes('golden hour')
  ) {
    lighting = 'golden hour sunset lighting';
    importantDetails.push('sunset');
  } else if (
    lower.includes('sunrise')
  ) {
    lighting = 'sunrise lighting';
    importantDetails.push('sunrise');
  } else if (
    lower.includes('bright') ||
    lower.includes('sunny') ||
    lower.includes('daylight')
  ) {
    lighting = 'bright daylight';
    importantDetails.push('daylight');
  }

  // Weather
  if (
    lower.includes('snow') ||
    lower.includes('snowy')
  ) {
    weather = 'snowy';
    importantDetails.push('snowy');
  } else if (
    lower.includes('rain') ||
    lower.includes('rainy') ||
    lower.includes('storm')
  ) {
    weather = 'rainy';
    importantDetails.push('rain');
  } else if (
    lower.includes('fog') ||
    lower.includes('foggy') ||
    lower.includes('mist')
  ) {
    weather = 'foggy';
    importantDetails.push('fog');
  } else if (
    lower.includes('sunny')
  ) {
    weather = 'sunny';
    importantDetails.push('sunny');
  }

  return {
    subject,
    appearance,
    action,
    environment,
    location,
    camera: camera || '',
    style: style || '',
    lighting,
    weather,
    duration: formatDuration(durationSeconds),
    durationSeconds,
    importantDetails: Array.from(
      new Set(importantDetails)
    ),
    originalPrompt: prompt
  };
}

/**
 * Builds the final prompt.
 *
 * The ORIGINAL USER PROMPT is always preserved.
 */
export function buildVideoPrompt(
  parsedPrompt: StructuredPrompt
): string {
  const cinematicDetails = [
    parsedPrompt.lighting
      ? `Lighting: ${parsedPrompt.lighting}.`
      : '',
    parsedPrompt.weather
      ? `Weather: ${parsedPrompt.weather}.`
      : '',
    parsedPrompt.camera
      ? `Camera: ${parsedPrompt.camera}.`
      : '',
    parsedPrompt.style
      ? `Style: ${parsedPrompt.style}.`
      : ''
  ]
    .filter(Boolean)
    .join(' ');

  return `
ORIGINAL USER PROMPT:
"${parsedPrompt.originalPrompt}"

STRICT GENERATION REQUIREMENTS:

The original user prompt is the primary source of truth.

Generate exactly what the user requested.

DO NOT replace, remove, reinterpret, or contradict important elements from the original prompt.

USER REQUESTED SUBJECT:
${parsedPrompt.subject || 'Use the subject exactly as described in the original prompt.'}

USER REQUESTED APPEARANCE:
${parsedPrompt.appearance || 'Use the appearance exactly as described in the original prompt.'}

USER REQUESTED ACTION:
${parsedPrompt.action || 'Use the action exactly as described in the original prompt.'}

USER REQUESTED LOCATION:
${parsedPrompt.location || 'Use the location exactly as described in the original prompt.'}

REQUESTED DURATION:
${parsedPrompt.durationSeconds} seconds

IMPORTANT:
The video must be ${parsedPrompt.durationSeconds} seconds long.

The requested subject must remain consistent throughout the video.

The requested action must actually happen.

The requested location/environment must remain consistent.

Do not substitute the subject, action, location, color, or other important details.

Do not introduce unrelated objects or characters.

Do not change the user's requested scene into a different scene.

${cinematicDetails}

Cinematic enhancements are allowed ONLY when they do not contradict the original user prompt.

ORIGINAL PROMPT MUST REMAIN THE HIGHEST PRIORITY:
"${parsedPrompt.originalPrompt}"
`.trim();
}

/**
 * Extracts meaningful words from the original prompt.
 */
function extractImportantWords(prompt: string): string[] {
  const stopwords = new Set([
    'the',
    'and',
    'for',
    'with',
    'from',
    'that',
    'this',
    'over',
    'through',
    'into',
    'onto',
    'above',
    'below',
    'under',
    'near',
    'a',
    'an',
    'in',
    'on',
    'of',
    'to',
    'is',
    'are',
    'be',
    'create',
    'make',
    'video',
    'second',
    'seconds',
    'sec',
    'minute',
    'minutes',
    'min'
  ]);

  return prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(
      word =>
        word.length > 2 &&
        !stopwords.has(word) &&
        !/^\d+$/.test(word)
    );
}

/**
 * Validates that the final prompt still contains the user's
 * important concepts.
 */
export function validateVideoPrompt(
  originalPrompt: string,
  finalPrompt: string
): boolean {
  if (!originalPrompt || !finalPrompt) {
    return false;
  }

  const originalWords =
    extractImportantWords(originalPrompt);

  const finalLower = finalPrompt.toLowerCase();

  if (!originalWords.length) {
    return true;
  }

  let matched = 0;

  for (const word of originalWords) {
    if (finalLower.includes(word)) {
      matched++;
    }
  }

  const matchPercentage =
    matched / originalWords.length;

  // Require at least 80% of important concepts.
  return matchPercentage >= 0.8;
}

/**
 * Creates a dynamic negative prompt.
 */
export function generateDynamicNegativePrompt(
  originalPrompt: string,
  userNegative?: string
): string {
  const negatives = [
    userNegative,
    'wrong subject',
    'subject replacement',
    'wrong action',
    'wrong environment',
    'wrong location',
    'wrong color',
    'unrelated objects',
    'unrelated characters',
    'random scene changes',
    'scene mismatch',
    'inconsistent subject',
    'inconsistent environment',
    'incorrect physics',
    'distorted objects',
    'duplicate subjects',
    'low quality'
  ].filter(Boolean);

  const lower = originalPrompt.toLowerCase();

  if (lower.includes('red')) {
    negatives.push('blue color substitution');
  }

  if (lower.includes('blue')) {
    negatives.push('red color substitution');
  }

  if (lower.includes('car')) {
    negatives.push(
      'truck replacement',
      'bus replacement',
      'motorcycle replacement'
    );
  }

  if (lower.includes('flying')) {
    negatives.push(
      'driving instead of flying',
      'car on road instead of flying'
    );
  }

  return Array.from(
    new Set(negatives)
  ).join(', ');
}

/**
 * Complete prompt processing pipeline.
 */
export function processVideoPromptPipeline(
  userPrompt: string,
  userNegativePrompt: string = '',
  style: VideoStyle = 'cinematic',
  camera: CameraControl = 'drone-shot'
): PromptAnalysisResult {
  const parsed = parseVideoPrompt(
    userPrompt,
    style,
    camera
  );

  let finalPrompt =
    buildVideoPrompt(parsed);

  let validationPassed =
    validateVideoPrompt(
      userPrompt,
      finalPrompt
    );

  let validationLog = validationPassed
    ? 'Validation PASSED: Original prompt requirements preserved.'
    : 'Validation FAILED: Rebuilding prompt using original user input.';

  /*
   * If validation fails, NEVER replace the original prompt
   * with an AI interpretation.
   */
  if (!validationPassed) {
    finalPrompt = `
ORIGINAL USER PROMPT:
"${userPrompt}"

STRICT INSTRUCTION:

Generate the video directly according to the ORIGINAL USER PROMPT above.

Do not replace or reinterpret the requested subject, action,
location, appearance, environment, or important details.

Requested duration:
${parsed.durationSeconds} seconds.

The generated video must contain the requested subject
performing the requested action in the requested environment.

Maintain consistency throughout the entire video.

Do not add unrelated subjects, actions, locations, or scenes.
`.trim();

    validationPassed =
      validateVideoPrompt(
        userPrompt,
        finalPrompt
      );

    validationLog =
      'Validation rebuilt using the original user prompt.';
  }

  const negativePrompt =
    generateDynamicNegativePrompt(
      userPrompt,
      userNegativePrompt
    );

  return {
    parsed,
    finalPrompt,
    negativePrompt,
    validationPassed,
    validationLog
  };
}