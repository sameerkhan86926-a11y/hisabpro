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
  createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "hisabpro_language";

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(STORAGE_KEY);

      if (savedLanguage === "hi" || savedLanguage === "en") {
        setLanguageState(savedLanguage);
      }
    } catch {
      // Ignore localStorage errors.
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);

    try {
      localStorage.setItem(STORAGE_KEY, newLanguage);

      window.dispatchEvent(
        new CustomEvent("hisabpro-language-changed", {
          detail: newLanguage,
        })
      );
    } catch {
      // Ignore localStorage errors.
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

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
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
