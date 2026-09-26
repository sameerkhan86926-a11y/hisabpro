"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const {
    language,
    setLanguage,
  } = useLanguage();

  return (
    <div
      style={{
        position: "fixed",
        top: "14px",
        right: "14px",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px",
        background: "#ffffff",
        border: "1px solid #dbe2ea",
        borderRadius: "10px",
        boxShadow:
          "0 4px 14px rgba(16,42,86,0.12)",
      }}
    >
      <button
        type="button"
        onClick={() =>
          setLanguage("en")
        }
        style={{
          border: "none",
          borderRadius: "7px",
          padding: "7px 10px",
          fontSize: "12px",
          fontWeight: 700,
          cursor: "pointer",
          background:
            language === "en"
              ? "#102a56"
              : "transparent",
          color:
            language === "en"
              ? "#ffffff"
              : "#102a56",
        }}
      >
        English
      </button>

      <button
        type="button"
        onClick={() =>
          setLanguage("hi")
        }
        style={{
          border: "none",
          borderRadius: "7px",
          padding: "7px 10px",
          fontSize: "12px",
          fontWeight: 700,
          cursor: "pointer",
          background:
            language === "hi"
              ? "#102a56"
              : "transparent",
          color:
            language === "hi"
              ? "#ffffff"
              : "#102a56",
        }}
      >
        हिन्दी
      </button>
    </div>
  );
}
