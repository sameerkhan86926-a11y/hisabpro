"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switcher">
      <button
        type="button"
        className={language === "en" ? "active" : ""}
        onClick={() => setLanguage("en")}
      >
        English
      </button>

      <button
        type="button"
        className={language === "hi" ? "active" : ""}
        onClick={() => setLanguage("hi")}
      >
        हिन्दी
      </button>
    </div>
  );
}
