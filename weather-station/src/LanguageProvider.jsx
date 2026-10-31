import { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { I18nContext } from "./i18nContext";
import { LANGUAGES, DEFAULT_LANGUAGE, translations } from "./translations";

const STORAGE_KEY = "language";

function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES.includes(saved)) return saved;
  } catch {
    // storage unavailable (private window, blocked site data): fall through
  }
  const browser = navigator.language?.slice(0, 2);
  return LANGUAGES.includes(browser) ? browser : DEFAULT_LANGUAGE;
}

export default function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // the choice just won't be remembered
    }
  }, []);

  const t = useCallback(
    (key, vars = {}) => {
      const text = translations[lang][key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;
      return text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
