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

  const cleanGoogleTranslate = () => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    try {
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

      const html = document.documentElement;
      if (html) {
        html.classList.remove("translated-ltr", "translated-rtl");
        if (html.getAttribute("lang") === "hi") {
          html.setAttribute("lang", "en");
        }
      }

      const banner = document.querySelector(".goog-te-banner-frame");
      if (banner) {
        banner.remove();
      }
    } catch {}
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hisabpro_language", lang);

        if (lang === "en") {
          cleanGoogleTranslate();
          document.cookie = "googtrans=/auto/en; path=/;";
          document.cookie = "googtrans=/en/en; path=/;";
        } else {
          document.cookie = "googtrans=/auto/hi; path=/;";
          document.cookie = "googtrans=/en/hi; path=/;";
        }

        window.location.reload();
      } catch {}
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    let saved: Language = "en";
    try {
      saved = (localStorage.getItem("hisabpro_language") as Language) || "en";
    } catch {}

    setLanguageState(saved);

    if (saved === "en") {
      cleanGoogleTranslate();
      return;
    }

    if (saved === "hi") {
      try {
        document.cookie = "googtrans=/auto/hi; path=/;";
        document.cookie = "googtrans=/en/hi; path=/;";

        if (!(window as any).googleTranslateElementInit) {
          (window as any).googleTranslateElementInit = () => {
            if ((window as any).google && (window as any).google.translate) {
              new (window as any).google.translate.TranslateElement(
                {
                  pageLanguage: "en",
                  includedLanguages: "en,hi",
                  autoDisplay: false,
                },
                "google_translate_element"
              );
            }
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
      } catch {}
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      <div id="google_translate_element" style={{ display: "none" }} />
      {children}
    </LanguageContext.Provider>
  );
}
