"use client";

import { useEffect, useState } from "react";

// Current app ka version (ise workflow ke versionCode ke barabar rakhein)
const CURRENT_VERSION_CODE = 1;

// GitHub raw file ka URL jahan se version check hoga
const VERSION_CHECK_URL =
  "https://raw.githubusercontent.com/AAPKA_USERNAME/AAPKA_REPO/main/public/version.json";

type VersionInfo = {
  versionCode: number;
  versionName: string;
  downloadUrl: string;
  message: string;
};

export default function UpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    async function checkForUpdate() {
      try {
        const res = await fetch(`${VERSION_CHECK_URL}?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data: VersionInfo = await res.json();
        if (data.versionCode > CURRENT_VERSION_CODE) {
          setUpdateInfo(data);
        }
      } catch (err) {
        // Offline ya network error hone par chupchap ignore karein
      }
    }

    checkForUpdate();
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
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "360px",
          width: "100%",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          textAlign: "center",
          color: "#1e293b",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>🚀</div>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "700" }}>
          Naya Update Aaya Hai! (v{updateInfo.versionName})
        </h3>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: "14px",
            color: "#64748b",
            lineHeight: "1.5",
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
              color: "#fff",
              padding: "12px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            Update Download Karein
          </a>

          <button
            onClick={() => setUpdateInfo(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
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
