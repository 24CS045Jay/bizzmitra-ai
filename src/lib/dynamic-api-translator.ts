import { SupportedLanguage, getCurrentLanguage } from "./i18n";
import { runUniversalDomTranslation } from "./auto-translator";

const originalTextMap = new WeakMap<Node, string>();
const originalPlaceholderMap = new WeakMap<Element, string>();
const originalTitleMap = new WeakMap<Element, string>();

// In-memory cache per language
const memoryTranslationCache = new Map<SupportedLanguage, Map<string, string>>();

function getMemoryCache(lang: SupportedLanguage): Map<string, string> {
  if (!memoryTranslationCache.has(lang)) {
    const map = new Map<string, string>();
    // Load from sessionStorage if available
    if (typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem(`bizzmitra.api_cache.${lang}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          for (const [k, v] of Object.entries(parsed)) {
            map.set(k, v as string);
          }
        }
      } catch {}
    }
    memoryTranslationCache.set(lang, map);
  }
  return memoryTranslationCache.get(lang)!;
}

function saveMemoryCache(lang: SupportedLanguage) {
  if (typeof window === "undefined") return;
  try {
    const map = memoryTranslationCache.get(lang);
    if (!map) return;
    const obj: Record<string, string> = {};
    map.forEach((v, k) => {
      obj[k] = v;
    });
    window.sessionStorage.setItem(`bizzmitra.api_cache.${lang}`, JSON.stringify(obj));
  } catch {}
}

let isTranslating = false;
let pendingApiCall = false;

interface PendingItem {
  node: Node | HTMLElement;
  type: "text" | "placeholder" | "title";
  originalText: string;
}

/**
 * Scans the active screen, applies cached translations instantly,
 * and sends any uncached dynamic texts in a single batch to /api/translate.
 */
export async function translatePageViaApi(targetLang: SupportedLanguage = getCurrentLanguage()): Promise<void> {
  if (typeof document === "undefined" || !document.body || isTranslating) return;

  // 1. Run local dictionary pass first for 0ms instant replacement of common elements
  runUniversalDomTranslation(targetLang);

  if (targetLang === "en") {
    // Restore all to original English
    restoreEnglish();
    return;
  }

  isTranslating = true;
  const cache = getMemoryCache(targetLang);
  const untranslatedQueue: PendingItem[] = [];
  const uniqueTextsToFetch = new Set<string>();

  try {
    const walk = (node: Node) => {
      const parent = node.parentElement;
      if (parent) {
        const tag = parent.tagName.toLowerCase();
        if (
          tag === "script" ||
          tag === "style" ||
          tag === "noscript" ||
          tag === "code" ||
          tag === "pre" ||
          parent.classList.contains("notranslate")
        ) {
          return;
        }
      }

      // 1. Text Nodes
      if (node.nodeType === Node.TEXT_NODE) {
        const currentVal = node.nodeValue || "";
        const trimmed = currentVal.trim();
        if (!trimmed || /^[0-9\s.,/:\-_=+%$#@!&*()]+$/.test(trimmed)) return;

        if (!originalTextMap.has(node)) {
          originalTextMap.set(node, currentVal);
        }
        const original = originalTextMap.get(node) || currentVal;
        const origTrimmed = original.trim();

        if (cache.has(origTrimmed)) {
          const trans = cache.get(origTrimmed)!;
          if (node.nodeValue !== original.replace(origTrimmed, trans)) {
            node.nodeValue = original.replace(origTrimmed, trans);
          }
        } else {
          untranslatedQueue.push({
            node,
            type: "text",
            originalText: origTrimmed,
          });
          uniqueTextsToFetch.add(origTrimmed);
        }
      }
      // 2. Element Nodes (Inputs & Placeholders)
      else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        if (tag === "input" || tag === "textarea") {
          const input = el as HTMLInputElement | HTMLTextAreaElement;
          if (input.placeholder && input.placeholder.trim()) {
            if (!originalPlaceholderMap.has(input)) {
              originalPlaceholderMap.set(input, input.placeholder);
            }
            const origPl = (originalPlaceholderMap.get(input) || input.placeholder).trim();
            if (cache.has(origPl)) {
              input.placeholder = cache.get(origPl)!;
            } else {
              untranslatedQueue.push({
                node: input,
                type: "placeholder",
                originalText: origPl,
              });
              uniqueTextsToFetch.add(origPl);
            }
          }
        }

        if (el.title && el.title.trim()) {
          if (!originalTitleMap.has(el)) {
            originalTitleMap.set(el, el.title);
          }
          const origTitle = (originalTitleMap.get(el) || el.title).trim();
          if (cache.has(origTitle)) {
            el.title = cache.get(origTitle)!;
          } else {
            untranslatedQueue.push({
              node: el,
              type: "title",
              originalText: origTitle,
            });
            uniqueTextsToFetch.add(origTitle);
          }
        }

        // Walk children
        for (let child = el.firstChild; child; child = child.nextSibling) {
          walk(child);
        }
      }
    };

    walk(document.body);

    // If there are newly discovered dynamic strings, translate them via free translation engine
    if (uniqueTextsToFetch.size > 0 && !pendingApiCall) {
      pendingApiCall = true;
      const textsArray = Array.from(uniqueTextsToFetch).slice(0, 50); // Batch chunks

      void (async () => {
        try {
          const { translateDynamicTextAsync } = await import("./dynamic-translator");
          await Promise.all(
            textsArray.map(async (origText) => {
              try {
                const trans = await translateDynamicTextAsync(origText, targetLang);
                if (trans && trans !== origText) {
                  cache.set(origText, trans);
                }
              } catch {
                // Ignore individual translation failures
              }
            })
          );

          saveMemoryCache(targetLang);

          // Apply newly fetched translations to queued DOM nodes
          untranslatedQueue.forEach((item) => {
            const trans = cache.get(item.originalText);
            if (trans) {
              if (item.type === "text" && item.node.nodeType === Node.TEXT_NODE) {
                const origFull = originalTextMap.get(item.node) || item.originalText;
                item.node.nodeValue = origFull.replace(item.originalText, trans);
              } else if (item.type === "placeholder") {
                (item.node as HTMLInputElement).placeholder = trans;
              } else if (item.type === "title") {
                (item.node as HTMLElement).title = trans;
              }
            }
          });
        } catch (apiErr) {
          console.warn("[dynamic-api-translator] translation error:", apiErr);
        } finally {
          pendingApiCall = false;
        }
      })();
    }
  } finally {
    isTranslating = false;
  }
}

function restoreEnglish(): void {
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE && originalTextMap.has(node)) {
      node.nodeValue = originalTextMap.get(node)!;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (originalPlaceholderMap.has(el)) {
        (el as HTMLInputElement).placeholder = originalPlaceholderMap.get(el)!;
      }
      if (originalTitleMap.has(el)) {
        el.title = originalTitleMap.get(el)!;
      }
      for (let child = el.firstChild; child; child = child.nextSibling) {
        walk(child);
      }
    }
  };
  walk(document.body);
}

let observer: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Initializes continuous dynamic observer with API translation bridge.
 */
export function initDynamicApiTranslator(): void {
  if (typeof window === "undefined") return;

  if (observer) {
    observer.disconnect();
  }

  const trigger = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const lang = getCurrentLanguage();
      if (lang !== "en") {
        void translatePageViaApi(lang);
      }
    }, 60);
  };

  observer = new MutationObserver((mutations) => {
    if (isTranslating) return;
    let relevant = false;
    for (const m of mutations) {
      if (m.type === "childList" && m.addedNodes.length > 0) {
        relevant = true;
        break;
      }
    }
    if (relevant) trigger();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Listen to language change events
  window.addEventListener("bizzmitra:lang-changed", (e: Event) => {
    const ce = e as CustomEvent<SupportedLanguage>;
    const target = ce.detail || getCurrentLanguage();
    void translatePageViaApi(target);
  });

  // Initial trigger
  trigger();
}
