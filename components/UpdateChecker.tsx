"use client";

import { useEffect, useState } from "react";

// Installed Version: Testing ke liye ise 1 rakhein
const CURRENT_VERSION_CODE = 1;

const VERSION_CHECK_URL =
  "https://raw.githubusercontent.com/sameerkhan86926-a11y/hisabpro/main/public/version.json";

type VersionInfo = {
  versionCode: number;
  versionName: string;
  downloadUrl: string;
  message: string;
};

export default function UpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    function checkVersion() {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `${VERSION_CHECK_URL}?_t=${Date.now()}`, true);
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data: VersionInfo = JSON.parse(xhr.responseText);
              if (Number(data.versionCode) > CURRENT_VERSION_CODE) {
                setUpdateInfo(data);
              }
            } catch (e) {
              console.error("JSON parse error", e);
            }
          }
        };
        xhr.onerror = function () {
          // Fetch fallback agar xhr block ho
          fetch(`${VERSION_CHECK_URL}?_t=${Date.now()}`, { mode: "cors" })
            .then((r) => r.json())
            .then((data: VersionInfo) => {
              if (Number(data.versionCode) > CURRENT_VERSION_CODE) {
                setUpdateInfo(data);
              }
            })
            .catch(() => {});
        };
        xhr.send();
      } catch (err) {
        console.error("Update check failed", err);
      }
    }

    const timer = setTimeout(checkVersion, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!updateInfo) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "340px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.3)",
          color: "#0f172a",
        }}
      >
        <div style={{ fontSize: "42px", marginBottom: "8px" }}>🚀</div>
        <h3
          style={{
            margin: "0 0 6px",
            fontSize: "18px",
            fontWeight: "700",
            color: "#102a56",
          }}
        >
          Naya Update Uplabdh Hai!
        </h3>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#2563eb",
          }}
        >
          Version: v{updateInfo.versionName}
        </p>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: "13px",
            color: "#64748b",
            lineHeight: "1.4",
          }}
        >
          {updateInfo.message}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <a
            href={updateInfo.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#102a56",
              color: "#ffffff",
              padding: "12px 16px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
              display: "block",
            }}
          >
            Update Download Karein
          </a>

          <button
            onClick={() => setUpdateInfo(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              fontSize: "13px",
              cursor: "pointer",
              padding: "6px",
            }}
          >
            Baad Me Karein
          </button>
        </div>
      </div>
    </div>
  );
}
