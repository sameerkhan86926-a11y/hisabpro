"use client";

import { useEffect, useState } from "react";

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    // Cookie check karein ki user ne pehle se Hindi select kiya hai ya nahi
    const match = document.cookie.match(/googtrans=\/en\/(hi|en)/);
    if (match && match[1]) {
      setCurrentLang(match[1] as "en" | "hi");
    }
  }, []);

  const changeLanguage = (lang: "en" | "hi") => {
    setCurrentLang(lang);

    // Google Translate cookie update karein (Local aur Hosted dono ke liye)
    document.cookie = `googtrans=/en/${lang}; path=/;`;
    if (window.location.hostname) {
      document.cookie = `googtrans=/en/${lang}; domain=.${window.location.hostname}; path=/;`;
    }

    // Page reload karein taaki poori app live Hindi/English me badal jaye
    window.location.reload();
  };

  return (
    <div className="inline-flex items-center rounded-lg bg-gray-100 p-1 border border-gray-300">
      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
          currentLang === "en"
            ? "bg-blue-600 text-white shadow"
            : "text-gray-700 hover:text-black"
        }`}
      >
        English
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("hi")}
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
          currentLang === "hi"
            ? "bg-blue-600 text-white shadow"
            : "text-gray-700 hover:text-black"
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
}
