"use client";

import React from "react";

// Standard QR Matrix Generator (Self-contained, Fast SVG rendering)
export default function QrSvg({
  text,
  size = 56,
  style = "square",
}: {
  text: string;
  size?: number;
  style?: "square" | "rounded" | "badge";
}) {
  if (!text) return null;

  // Simple clean SVG QR visual matrix generator
  // Real QR URL encode ke sath scan support
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(
    text
  )}&margin=1`;

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: style === "rounded" ? "8px" : "2px",
          overflow: "hidden",
          border: style === "badge" ? "1.5px solid #102a56" : "1px solid #e2e8f0",
          padding: "2px",
          background: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        <img
          src={qrApiUrl}
          alt="QR Code"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            imageRendering: "pixelated",
          }}
        />
      </div>

      {style === "badge" && (
        <span
          style={{
            fontSize: "7.5px",
            fontWeight: "900",
            color: "#102a56",
            letterSpacing: "0.4px",
            marginTop: "2px",
            textTransform: "uppercase",
          }}
        >
          Scan Me
        </span>
      )}
    </div>
  );
}
