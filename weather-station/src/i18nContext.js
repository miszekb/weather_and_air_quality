import { createContext, useContext } from "react";

export const I18nContext = createContext(null);

/** Returns { lang, setLang, t }. `t(key, vars)` looks the key up in the current language. */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>");
  return ctx;
}
