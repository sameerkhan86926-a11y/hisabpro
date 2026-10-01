"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // 1.2 second baad fade out shuru hoga
    const timer1 = setTimeout(() => {
      setFade(true);
    }, 1200);

    // 1.5 second par splash screen screen se hat jayegi
    const timer2 = setTimeout(() => {
      setShow(false);
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#102a56", // HisabPro brand dark blue
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.3s ease-out",
        opacity: fade ? 0 : 1,
        pointerEvents: fade ? "none" : "all",
      }}
    >
      {/* Brand Icon / Logo Box */}
      <div
        style={{
          width: "90px",
          height: "90px",
          borderRadius: "22px",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          marginBottom: "16px",
        }}
      >
        <span style={{ fontSize: "46px" }}>📊</span>
      </div>

      {/* App Name */}
      <h1
        style={{
          color: "#ffffff",
          fontSize: "28px",
          fontWeight: "800",
          letterSpacing: "1px",
          margin: "0 0 6px 0",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Hisab<span style={{ color: "#38bdf8" }}>Pro</span>
      </h1>

      {/* Tagline */}
      <p
        style={{
          color: "#94a3b8",
          fontSize: "14px",
          fontWeight: "500",
          margin: 0,
          letterSpacing: "0.5px",
        }}
      >
        Smart Vyapar • Asaan Billing
      </p>

      {/* Subtle loader line at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          width: "48px",
          height: "4px",
          borderRadius: "4px",
          backgroundColor: "rgba(255,255,255,0.2)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#38bdf8",
            animation: "pulse 1s infinite alternate",
          }}
        />
      </div>
    </div>
  );
}
