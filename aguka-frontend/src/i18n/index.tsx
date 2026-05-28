import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { en, type EnDictionary } from "./en";

export const SUPPORTED_LANGS = ["en", "rw", "fr"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export type TranslationKey = keyof EnDictionary;
type Dictionary = { [K in TranslationKey]: string };

// Simplified type - params is always optional
export type TranslateFn = <K extends TranslationKey>(
  key: K,
  params?: Record<string, string | number>
) => string;

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "rw", label: "Kinyarwanda", flag: "🇷🇼" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

const STORAGE_KEY = "aguka.lang";
const RTL_PREP_LANGS = new Set<string>(["ar", "fa", "he", "ur"]);
const templateRegex = /\{(\w+)\}/g;
const dictionaryCache = new Map<Lang, Dictionary>([["en", en as Dictionary]]);
const dictionaryPromises = new Map<Lang, Promise<Dictionary>>();

const dictionaryLoaders: Record<Lang, () => Promise<Dictionary>> = {
  en: async () => en as Dictionary,
  rw: async () => {
    const mod = await import("./rw");
    return mod.rw as Dictionary;
  },
  fr: async () => {
    const mod = await import("./fr");
    return mod.fr as Dictionary;
  },
};

function isSupportedLang(value: string | null | undefined): value is Lang {
  return !!value && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

function detectBrowserLanguage(): Lang {
  if (typeof navigator === "undefined") return "en";
  const candidates = [...(navigator.languages ?? []), navigator.language].filter(Boolean);
  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase();
    if (normalized.startsWith("fr")) return "fr";
    if (normalized.startsWith("rw") || normalized.startsWith("kin")) return "rw";
    if (normalized.startsWith("en")) return "en";
  }
  return "en";
}

function applyDocumentLang(lang: Lang) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_PREP_LANGS.has(lang) ? "rtl" : "ltr";
}

async function loadDictionary(lang: Lang): Promise<Dictionary> {
  const cached = dictionaryCache.get(lang);
  if (cached) return cached;

  const pending = dictionaryPromises.get(lang);
  if (pending) return pending;

  const loaderPromise = dictionaryLoaders[lang]().then((dict) => {
    dictionaryCache.set(lang, dict);
    dictionaryPromises.delete(lang);
    return dict;
  });
  dictionaryPromises.set(lang, loaderPromise);
  return loaderPromise;
}

function resolveTemplate(
  template: string,
  params?: Record<string, string | number>,
  key?: string,
  lang?: Lang,
): string {
  if (!params) return template;
  return template.replace(templateRegex, (_, token: string) => {
    if (params[token] === undefined) {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing interpolation value for "{${token}}" in key "${key}" (${lang})`);
      }
      return `{${token}}`;
    }
    return String(params[token]);
  });
}

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslateFn;
  isLoadingLang: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [activeDictionary, setActiveDictionary] = useState<Dictionary>(en as Dictionary);
  const [isLoadingLang, setIsLoadingLang] = useState(false);
  const interpolationCache = useRef(new Map<string, string>());

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const initialLang = isSupportedLang(saved) ? saved : detectBrowserLanguage();
    setLangState(initialLang);
  }, []);

  useEffect(() => {
    interpolationCache.current.clear();
    applyDocumentLang(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, lang);
    }

    let cancelled = false;
    const updateDictionary = async () => {
      setIsLoadingLang(true);
      try {
        const dict = await loadDictionary(lang);
        if (!cancelled) {
          setActiveDictionary(dict);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingLang(false);
        }
      }
    };

    void updateDictionary();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const setLang = useCallback((nextLang: Lang) => {
    setLangState(nextLang);
  }, []);

  // Simplified t function - params is optional
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const localized = activeDictionary[key];
      const fallback = en[key];
      const template = localized ?? fallback;

      if (!localized && import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation for key "${key}" in language "${lang}", using English fallback.`);
      }

      if (!template) {
        if (import.meta.env.DEV) {
          console.warn(`[i18n] Missing translation key "${key}" in fallback dictionary.`);
        }
        return String(key);
      }

      if (!params || Object.keys(params).length === 0) {
        return template;
      }

      const cacheKey = `${lang}:${String(key)}:${JSON.stringify(params)}`;
      const cached = interpolationCache.current.get(cacheKey);
      if (cached) return cached;

      const rendered = resolveTemplate(template, params, String(key), lang);
      interpolationCache.current.set(cacheKey, rendered);
      return rendered;
    },
    [activeDictionary, lang],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t,
      isLoadingLang,
    }),
    [lang, setLang, t, isLoadingLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}