"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import "./globals.css";
import AppLock from "../components/AppLock";
import LanguageProvider from "../components/LanguageProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    // 1.5 second cinematic motion chalegi, fir fade-out
    const timer1 = setTimeout(() => {
      setFadeSplash(true);
    }, 1500);

    // 1.9 second par DOM se poori tarah remove ho jayegi
    const timer2 = setTimeout(() => {
      setShowSplash(false);
    }, 1900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#102a56" />
        <title>HisabPro</title>
        <meta name="description" content="Sales • Stock • Khata • Profit" />

        {/* PWA & App Icons / Favicon */}
        <link rel="manifest" href="/hisabpro/manifest.json" />
        <link rel="icon" type="image/png" sizes="32x32" href="/hisabpro/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/hisabpro/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/hisabpro/icon-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/hisabpro/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="HisabPro" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Google Translate hide */
              .goog-te-banner-frame.skiptranslate, 
              .goog-te-gadget-simple, 
              .goog-te-gadget-icon,
              #goog-gt-tt,
              .goog-te-balloon-frame { 
                display: none !important; 
              }
              body { 
                top: 0px !important; 
                position: static !important;
              }
              .goog-tooltip, .goog-tooltip:hover { 
                display: none !important; 
              }
              .goog-text-highlight { 
                background-color: transparent !important; 
                border: none !important; 
                box-shadow: none !important; 
              }
              #google_translate_element, .skiptranslate iframe { 
                display: none !important; 
              }

              /* CINEMATIC VIDEO-STYLE INTRO ANIMATIONS */
              @keyframes orbPulse {
                0% { transform: translate(-50%, -50%) scale(0.7); opacity: 0.3; }
                50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.7; }
                100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.5; }
              }

              @keyframes cinematicLogoIn {
                0% {
                  transform: scale(0.3) translateY(40px) rotate(-6deg);
                  opacity: 0;
                  filter: drop-shadow(0 0 0px rgba(56, 189, 248, 0));
                }
                60% {
                  transform: scale(1.08) translateY(-6px) rotate(2deg);
                  opacity: 1;
                  filter: drop-shadow(0 15px 35px rgba(56, 189, 248, 0.6));
                }
                100% {
                  transform: scale(1) translateY(0) rotate(0deg);
                  opacity: 1;
                  filter: drop-shadow(0 10px 25px rgba(56, 189, 248, 0.4));
                }
              }

              @keyframes shimmerSweep {
                0% { transform: translateX(-150%) skewX(-25deg); }
                100% { transform: translateX(250%) skewX(-25deg); }
              }

              @keyframes textReveal {
                0% {
                  opacity: 0;
                  transform: translateY(18px) scale(0.95);
                  letter-spacing: 3px;
                }
                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                  letter-spacing: 0.5px;
                }
              }

              @keyframes taglineReveal {
                0% {
                  opacity: 0;
                  transform: translateY(10px);
                }
                100% {
                  opacity: 0.85;
                  transform: translateY(0);
                }
              }

              @keyframes progressBar {
                0% { width: 0%; opacity: 0; }
                20% { opacity: 1; }
                100% { width: 100%; opacity: 1; }
              }
            `,
          }}
        />
      </head>
      <body>
        {/* CINEMATIC SPLASH INTRO */}
        {showSplash && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "radial-gradient(circle at center, #132e5c 0%, #071224 100%)",
              zIndex: 9999999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
              opacity: fadeSplash ? 0 : 1,
              transform: fadeSplash ? "scale(1.04)" : "scale(1)",
              pointerEvents: fadeSplash ? "none" : "all",
              overflow: "hidden",
            }}
          >
            {/* Ambient Background Glow Orb */}
            <div
              style={{
                position: "absolute",
                top: "45%",
                left: "50%",
                width: "320px",
                height: "320px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(16, 42, 86, 0) 70%)",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                animation: "orbPulse 1.8s ease-in-out forwards",
              }}
            />

            {/* Glowing Logo Card with Shimmer Beam */}
            <div
              style={{
                position: "relative",
                width: "96px",
                height: "96px",
                borderRadius: "26px",
                overflow: "hidden",
                marginBottom: "20px",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "cinematicLogoIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
            >
              <img
                src="/hisabpro/icon-192.png"
                alt="HisabPro Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Shimmer Light Ray */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent)",
                  animation: "shimmerSweep 1.2s ease-in-out 0.4s forwards",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Brand Title with Cinematic Reveal */}
            <h1
              style={{
                color: "#ffffff",
                fontSize: "30px",
                fontWeight: "800",
                margin: "0 0 6px 0",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                textShadow: "0 4px 18px rgba(0, 0, 0, 0.4)",
                animation: "textReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both",
              }}
            >
              Hisab<span style={{ color: "#38bdf8" }}>Pro</span>
            </h1>

            {/* Tagline */}
            <p
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                margin: 0,
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                animation: "taglineReveal 0.6s ease-out 0.45s both",
              }}
            >
              Smart Vyapar • Asaan Billing
            </p>

            {/* Sleek bottom loader bar */}
            <div
              style={{
                position: "absolute",
                bottom: "45px",
                width: "90px",
                height: "3px",
                borderRadius: "3px",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  backgroundColor: "#38bdf8",
                  boxShadow: "0 0 8px #38bdf8",
                  animation: "progressBar 1.4s ease-in-out forwards",
                }}
              />
            </div>
          </div>
        )}

        {/* Hidden Container for Google Translate Element */}
        <div id="google_translate_element"></div>

        {/* Google Translate Init Script */}
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,hi',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            `,
          }}
        />
        <Script
          strategy="afterInteractive"
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        />

        {/* Global Tap & Click Sound Script */}
        <Script
          id="global-tap-sound"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var audioCtx = null;

                function getAudioContext() {
                  if (!audioCtx) {
                    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
                    if (AudioContextClass) {
                      audioCtx = new AudioContextClass();
                    }
                  }
                  if (audioCtx && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                  }
                  return audioCtx;
                }

                function playSoftClick() {
                  try {
                    var ctx = getAudioContext();
                    if (!ctx) return;

                    var osc = ctx.createOscillator();
                    var gain = ctx.createGain();

                    osc.type = "sine";
                    osc.frequency.setValueAtTime(800, ctx.currentTime);
                    gain.gain.setValueAtTime(0.04, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start();
                    osc.stop(ctx.currentTime + 0.04);
                  } catch(e) {}
                }

                window.addEventListener("click", function(e) {
                  var target = e.target;
                  if (!target) return;

                  if (
                    target.closest("button") ||
                    target.closest("a") ||
                    target.closest("input[type='checkbox']") ||
                    target.closest("select") ||
                    target.closest(".more-card") ||
                    target.closest(".bottom-nav a")
                  ) {
                    playSoftClick();
                  }
                }, { passive: true });
              })();
            `,
          }}
        />

        {/* HisabPro Google Sheet Live App Tracker */}
        <Script
          id="hisabpro-app-tracker"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var CURRENT_APP_VERSION = "1.0.6";
                var deviceId = localStorage.getItem("hisabpro_tracker_device_id");
                if (!deviceId) {
                  deviceId = "DEV_" + Math.random().toString(36).substring(2, 9).toUpperCase();
                  localStorage.setItem("hisabpro_tracker_device_id", deviceId);
                }

                var businessName = "Not Set";
                var savedBusinesses = localStorage.getItem("hisabpro_businesses");
                var savedBusiness = localStorage.getItem("hisabpro_business");

                if (savedBusinesses) {
                  try {
                    var list = JSON.parse(savedBusinesses);
                    if (Array.isArray(list) && list.length > 0 && list[0].businessName) {
                      businessName = list[0].businessName;
                    }
                  } catch(e) {}
                } else if (savedBusiness) {
                  try {
                    var single = JSON.parse(savedBusiness);
                    if (single.businessName) businessName = single.businessName;
                  } catch(e) {}
                }

                var lastPing = localStorage.getItem("hisabpro_last_ping_time");
                var now = Date.now();
                if (!lastPing || (now - Number(lastPing) > 4 * 60 * 60 * 1000)) {
                  var formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSeX8cBddMUfla4KnUFrT8OLWQPLfVwmWDTOY3jL3EoPHVRIbA/formResponse?entry.1388543195=" 
                    + encodeURIComponent(deviceId) 
                    + "&entry.2095568272=" + encodeURIComponent(CURRENT_APP_VERSION) 
                    + "&entry.1177986148=" + encodeURIComponent(businessName) 
                    + "&submit=Submit";

                  fetch(formUrl, { method: "POST", mode: "no-cors" })
                    .then(function() {
                      localStorage.setItem("hisabpro_last_ping_time", String(now));
                    })
                    .catch(function() {});
                }
              } catch (err) {}
            `,
          }}
        />

        <LanguageProvider>
          <AppLock>{children}</AppLock>
        </LanguageProvider>
      </body>
    </html>
  );
}
