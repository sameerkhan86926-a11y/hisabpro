"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "hi";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>("en");

  // Helper function to clear all Google Translate cookies & DOM mutations
  const cleanGoogleTranslate = () => {
    // 1. Delete all possible googtrans cookies across domains/paths
    const hostname = window.location.hostname;
    const paths = ["/", "/hisabpro", "/hisabpro/"];
    const domains = ["", hostname, `.${hostname}`];

    paths.forEach((p) => {
      domains.forEach((d) => {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${p}; ${
          d ? `domain=${d};` : ""
        }`;
      });
    });

    // 2. Remove Google Translate classes and attributes from <html> and <body>
    const html = document.documentElement;
    html.classList.remove("translated-ltr", "translated-rtl");
    if (html.getAttribute("lang") === "hi") {
      html.setAttribute("lang", "en");
    }

    // 3. Remove Google Translate top banner if present
    const banner = document.querySelector(".goog-te-banner-frame");
    if (banner) {
      banner.remove();
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("hisabpro_language", lang);

    if (lang === "en") {
      cleanGoogleTranslate();
      // Set empty/english cookie
      document.cookie = "googtrans=/auto/en; path=/;";
      document.cookie = "googtrans=/en/en; path=/;";
    } else {
      document.cookie = "googtrans=/auto/hi; path=/;";
      document.cookie = "googtrans=/en/hi; path=/;";
    }

    // Force hard reload so Google Translate resets completely
    window.location.reload();
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  useEffect(() => {
    const saved = (localStorage.getItem("hisabpro_language") as Language) || "en";
    setLanguageState(saved);

    // If English, clear leftover translation cookies immediately
    if (saved === "en") {
      cleanGoogleTranslate();
      return;
    }

    // Load Google Translate script only when Hindi is active
    if (saved === "hi") {
      document.cookie = "googtrans=/auto/hi; path=/;";
      document.cookie = "googtrans=/en/hi; path=/;";

      if (!(window as any).googleTranslateElementInit) {
        (window as any).googleTranslateElementInit = () => {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi",
              autoDisplay: false,
            },
            "google_translate_element"
          );
        };

        const existingScript = document.getElementById("google-translate-script");
        if (!existingScript) {
          const script = document.createElement("script");
          script.id = "google-translate-script";
          script.src =
            "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
          script.async = true;
          document.body.appendChild(script);
        }
      }
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      <div id="google_translate_element" style={{ display: "none" }} />
      {children}
    </LanguageContext.Provider>
  );
}
