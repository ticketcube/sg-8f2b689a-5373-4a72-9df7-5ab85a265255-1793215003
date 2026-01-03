/**
 * Text-to-Speech Utilities
 * Supports both browser TTS (free) and OpenAI TTS (premium)
 * Future-ready for role-based access control
 */

export type TTSProvider = "browser" | "openai";
export type OpenAIVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export interface TTSOptions {
  provider: TTSProvider;
  voice?: string | OpenAIVoice;
  speed?: number;
  pitch?: number; // Only for browser TTS
  volume?: number;
}

export interface VoiceOption {
  id: string;
  label: string;
  provider: TTSProvider;
  requiresRole?: string; // Future: "premium", "pro", etc.
  description?: string;
}

// Voice configuration - future-ready for role gating
export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "browser-default",
    label: "Standard Voice",
    provider: "browser",
    description: "Free browser-based voice",
  },
  {
    id: "nova",
    label: "Nova (Female, Energetic)",
    provider: "openai",
    requiresRole: "premium", // Future check
    description: "Natural AI voice - friendly and clear",
  },
  {
    id: "alloy",
    label: "Alloy (Neutral)",
    provider: "openai",
    requiresRole: "premium",
    description: "Balanced, professional voice",
  },
  {
    id: "echo",
    label: "Echo (Male, Warm)",
    provider: "openai",
    requiresRole: "premium",
    description: "Warm male voice",
  },
  {
    id: "fable",
    label: "Fable (British)",
    provider: "openai",
    requiresRole: "premium",
    description: "British accent, expressive",
  },
  {
    id: "onyx",
    label: "Onyx (Male, Deep)",
    provider: "openai",
    requiresRole: "premium",
    description: "Deep, authoritative male voice",
  },
  {
    id: "shimmer",
    label: "Shimmer (Female, Soft)",
    provider: "openai",
    requiresRole: "premium",
    description: "Gentle, soothing female voice",
  },
];

/**
 * Get available voices based on user role
 * @param userRole - User's role (future: "free", "premium", "pro")
 * @returns Array of available voice options
 */
export function getAvailableVoices(userRole?: string): VoiceOption[] {
  // For now, return all voices
  // Future: Filter based on userRole
  return VOICE_OPTIONS;
  
  // Future implementation:
  // if (!userRole || userRole === "free") {
  //   return VOICE_OPTIONS.filter(v => !v.requiresRole);
  // }
  // return VOICE_OPTIONS; // Premium users get all
}

/**
 * Get default voice based on user role
 * @param userRole - User's role
 * @returns Default voice ID
 */
export function getDefaultVoice(userRole?: string): string {
  // For now, always use OpenAI nova
  return "nova";
  
  // Future implementation:
  // if (!userRole || userRole === "free") {
  //   return "browser-default";
  // }
  // return "nova"; // Premium default
}

/**
 * Check if user has access to a specific voice
 * @param voiceId - Voice ID to check
 * @param userRole - User's role
 * @returns boolean
 */
export function hasVoiceAccess(voiceId: string, userRole?: string): boolean {
  const voice = VOICE_OPTIONS.find(v => v.id === voiceId);
  if (!voice) return false;
  
  // For now, allow all voices
  return true;
  
  // Future implementation:
  // if (!voice.requiresRole) return true;
  // if (!userRole) return false;
  // return userRole === voice.requiresRole || userRole === "pro";
}

/**
 * Play text using browser TTS (fallback)
 */
export function speakWithBrowser(
  text: string,
  options: Partial<TTSOptions> = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Browser TTS not supported"));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.speed || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event);

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Play text using OpenAI TTS
 */
export async function speakWithOpenAI(
  text: string,
  accessToken: string,
  options: Partial<TTSOptions> = {}
): Promise<HTMLAudioElement> {
  const voice = options.voice || "nova";
  const speed = options.speed || 1.0;

  const response = await fetch("/api/openai-tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      text,
      voice,
      speed,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate speech");
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  if (options.volume !== undefined) {
    audio.volume = options.volume;
  }

  return audio;
}

/**
 * Main TTS function - automatically chooses provider
 */
export async function speak(
  text: string,
  accessToken: string | null,
  options: Partial<TTSOptions> = {}
): Promise<HTMLAudioElement | void> {
  const provider = options.provider || "openai";

  try {
    if (provider === "openai" && accessToken) {
      return await speakWithOpenAI(text, accessToken, options);
    } else {
      return await speakWithBrowser(text, options);
    }
  } catch (error) {
    console.error("TTS Error:", error);
    // Fallback to browser TTS
    return await speakWithBrowser(text, options);
  }
}