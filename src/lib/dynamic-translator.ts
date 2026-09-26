import { SupportedLanguage, getCurrentLanguage } from "./i18n";

const CACHE_STORAGE_KEY = "bizzmitra_dynamic_i18n_v1";

// In-memory translation cache: key = `${lang}:${text}` -> translated text
const memoryCache = new Map<string, string>();

// Load persisted cache from localStorage on startup
if (typeof window !== "undefined") {
  try {
    const raw = window.localStorage.getItem(CACHE_STORAGE_KEY);
    if (raw) {
      const parsed: Record<string, string> = JSON.parse(raw);
      for (const [k, v] of Object.entries(parsed)) {
        memoryCache.set(k, v);
      }
    }
  } catch {
    // Ignore storage parse issues
  }
}

function persistCacheToStorage() {
  if (typeof window === "undefined") return;
  try {
    const obj: Record<string, string> = {};
    let count = 0;
    // Store up to the most recent 1500 dynamic translations
    for (const [k, v] of memoryCache.entries()) {
      if (count++ > 1500) break;
      obj[k] = v;
    }
    window.localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Storage quota fallback
  }
}

/**
 * Checks if a string is already cached synchronously (0ms)
 */
export function getCachedDynamicTranslation(text: string, targetLang: SupportedLanguage): string | null {
  if (targetLang === "en" || !text || !text.trim()) return text;
  const key = `${targetLang}:${text.trim()}`;
  return memoryCache.get(key) || null;
}

/**
 * Saves a translated string to memory & localStorage cache
 */
export function setCachedDynamicTranslation(text: string, targetLang: SupportedLanguage, translated: string) {
  if (!text || !translated || targetLang === "en") return;
  const key = `${targetLang}:${text.trim()}`;
  memoryCache.set(key, translated.trim());
  persistCacheToStorage();
}

/**
 * Fetches dynamic translation using Free MyMemory API with free AI fallback
 */
async function fetchTranslationFromFreeApi(text: string, targetLang: SupportedLanguage): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || targetLang === "en") return text;

  // 1. Primary Free Provider: MyMemory Translation API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|${targetLang}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (res.ok) {
      const json = await res.json();
      if (json && json.responseData && json.responseData.translatedText) {
        const result = json.responseData.translatedText.trim();
        // Ignore fallback warnings or matching error codes
        if (result && !result.toLowerCase().includes("mymemory warning") && !result.startsWith("QUERY LENGTH LIMIT")) {
          return result;
        }
      }
    }
  } catch {
    // Fall through to AI translation provider
  }

  // 2. Secondary Free Provider: Free Groq AI Key from environment
  try {
    const groqKey =
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_GROQ_API_KEY) ||
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_GROQ_API_KEYS?.split(",")[0]);

    if (groqKey) {
      const langNames: Record<SupportedLanguage, string> = {
        en: "English",
        hi: "Hindi",
        gu: "Gujarati",
        es: "Spanish",
        fr: "French",
        de: "German",
        ja: "Japanese",
        ar: "Arabic",
      };
      const langName = langNames[targetLang] || targetLang;

      const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `You are an accurate in-app translator. Translate the given text to ${langName}. Return ONLY the direct translation without quotes, prefixes, or explanations.`,
            },
            {
              role: "user",
              content: trimmed,
            },
          ],
          temperature: 0.1,
          max_tokens: 256,
        }),
        signal: AbortSignal.timeout(4500),
      });

      if (aiRes.ok) {
        const data = await aiRes.json();
        const translated = data.choices?.[0]?.message?.content?.trim();
        if (translated) {
          return translated;
        }
      }
    }
  } catch {
    // Fall through
  }

  return text;
}

// In-flight request deduplication map
const pendingRequests = new Map<string, Promise<string>>();

/**
 * Asynchronously translates a dynamic text string with automatic caching & deduplication.
 */
export async function translateDynamicTextAsync(text: string, targetLang: SupportedLanguage): Promise<string> {
  if (targetLang === "en" || !text || !text.trim()) return text;

  const cached = getCachedDynamicTranslation(text, targetLang);
  if (cached) return cached;

  const key = `${targetLang}:${text.trim()}`;
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  const promise = (async () => {
    try {
      const translated = await fetchTranslationFromFreeApi(text, targetLang);
      if (translated && translated !== text) {
        setCachedDynamicTranslation(text, targetLang, translated);
        return translated;
      }
    } finally {
      pendingRequests.delete(key);
    }
    return text;
  })();

  pendingRequests.set(key, promise);
  return promise;
}

// DOM Node translation queue item
interface QueuedNode {
  node: Text;
  originalText: string;
  targetLang: SupportedLanguage;
}

const queuedNodes: QueuedNode[] = [];
let queueFlushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Enqueues a live dynamic DOM Text node to be translated in real-time.
 * As soon as translation is fetched, the text node is updated in place.
 */
export function queueDomNodeForDynamicTranslation(
  node: Text,
  originalText: string,
  targetLang: SupportedLanguage
): void {
  if (targetLang === "en" || !originalText.trim()) return;

  // 1. Instant cache check
  const cached = getCachedDynamicTranslation(originalText, targetLang);
  if (cached) {
    if (node.nodeValue !== cached) {
      node.nodeValue = cached;
    }
    return;
  }

  // 2. Ignore pure numbers, timestamps, single punctuation, or URLs
  const trimmed = originalText.trim();
  if (
    /^[0-9.,%$#@!+/*\-_~()\[\]{}|:;<>]+$/.test(trimmed) ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.length < 2
  ) {
    return;
  }

  // 3. Queue node for batched background translation
  queuedNodes.push({ node, originalText, targetLang });

  if (!queueFlushTimer) {
    queueFlushTimer = setTimeout(() => {
      flushQueuedNodes();
    }, 150);
  }
}

async function flushQueuedNodes() {
  queueFlushTimer = null;
  if (queuedNodes.length === 0) return;

  const items = queuedNodes.splice(0, queuedNodes.length);
  const currentLang = getCurrentLanguage();

  for (const item of items) {
    if (item.targetLang !== currentLang || !item.node.isConnected) continue;

    translateDynamicTextAsync(item.originalText, item.targetLang)
      .then((translated) => {
        if (item.node.isConnected && getCurrentLanguage() === item.targetLang) {
          item.node.nodeValue = translated;
        }
      })
      .catch(() => {});
  }
}
