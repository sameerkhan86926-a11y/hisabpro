"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "hi";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
};

const LanguageContext =
  createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "hisabpro_language";

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>("en");

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (saved === "hi" || saved === "en") {
        setLanguageState(saved);
      }
    } catch {
      // Ignore storage errors.
    }
  }, []);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        nextLanguage
      );

      window.dispatchEvent(
        new CustomEvent(
          "hisabpro-language-changed",
          {
            detail: nextLanguage,
          }
        )
      );
    } catch {
      // Ignore storage errors.
    }
  }

  function toggleLanguage() {
    setLanguage(
      language === "en"
        ? "hi"
        : "en"
    );
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
