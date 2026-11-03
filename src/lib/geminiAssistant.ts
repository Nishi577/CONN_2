import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client if API key is provided
const getApiKey = (): string | undefined => {
  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    return process.env.GEMINI_API_KEY;
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  return undefined;
};

export interface AIEnhancementResult {
  bios: string[];
  statusBadges: string[];
  linkSuggestions?: { original: string; suggested: string; reason: string }[];
}

export const generateBioEnhancements = async (
  name: string,
  role?: string,
  currentBio?: string,
  skills?: string[]
): Promise<string[]> => {
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a world-class editorial copywriter for high-profile creators, designers, and software engineers.
Generate 3 distinct, restrained, editorial bio variations for:
Name: ${name}
Current Role: ${role || 'Independent Creator'}
Current Bio: ${currentBio || 'Building software and design spaces on the internet.'}
Skills: ${(skills || []).join(', ')}

Guidelines:
1. Avoid SaaS clichés like "passionate about", "synergy", or over-the-top buzzwords.
2. Maintain an elegant, calm, high-end editorial tone (think Monocle, Kinfolk, stripe.press).
3. Keep each bio under 160 characters.
Output format: Just the 3 bios separated by triple dashes (---), no other commentary.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response && response.text) {
        const parsed = response.text
          .split('---')
          .map((b) => b.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Gemini API call fell back to editorial heuristics:', e);
    }
  }

  // High quality editorial heuristic fallback generator
  const baseTitle = role || 'Designer & Technologist';
  const mainSkill = skills && skills.length > 0 ? skills[0] : 'craft';
  const secSkill = skills && skills.length > 1 ? skills[1] : 'systems';

  return [
    `Independent ${baseTitle.toLowerCase()} exploring calm interfaces, ${mainSkill.toLowerCase()}, and restrained digital spaces.`,
    `Curating ideas at the intersection of ${mainSkill.toLowerCase()}, ${secSkill.toLowerCase()}, and human-first engineering.`,
    `Working quietly on design systems, code architecture, and modern publications. Based on the web.`,
  ];
};

export const generateStatusBadges = async (
  role?: string,
  skills?: string[]
): Promise<string[]> => {
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Generate 4 punchy, modern status badges for a personal profile (e.g. "● Writing Monograph No. 5", "● Shipping Design Tokens", "● Exploring WebGPU").
Role: ${role || 'Software Engineer & Designer'}
Skills: ${(skills || []).join(', ')}
Return ONLY 4 badges, one per line, starting with "● ".`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response && response.text) {
        const badges = response.text
          .split('\n')
          .map((b) => b.trim())
          .filter((b) => b.startsWith('●') || b.length > 3)
          .map((b) => (b.startsWith('●') ? b : `● ${b}`));
        if (badges.length > 0) return badges.slice(0, 4);
      }
    } catch (e) {
      console.warn('Gemini status badge fallback:', e);
    }
  }

  const focus = skills && skills.length > 0 ? skills[0] : 'Calm Software';
  return [
    `● Exploring ${focus} & systems`,
    '● Writing field notes on craft',
    '● Available for Q1 advisory & projects',
    '● Designing minimalist web spaces',
  ];
};
