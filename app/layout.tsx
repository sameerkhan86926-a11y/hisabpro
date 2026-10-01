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
    // 1 second baad fade-out start hoga
    const timer1 = setTimeout(() => {
      setFadeSplash(true);
    }, 1000);

    // 1.3 second par poori tarah remove ho jayega
    const timer2 = setTimeout(() => {
      setShowSplash(false);
    }, 1300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#102a56" />
        <title>HisabPro</title>
        <meta name="description" content="Sales • Stock • Khata • Profit" />
        <link rel="manifest" href="/hisabpro/manifest.json" />

        {/* Google Translate Hide Banners CSS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
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
              .goog-tooltip { 
                display: none !important; 
              }
              .goog-tooltip:hover { 
                display: none !important; 
              }
              .goog-text-highlight { 
                background-color: transparent !important; 
                border: none !important; 
                box-shadow: none !important; 
              }
              #google_translate_element { 
                display: none !important; 
              }
              .skiptranslate iframe {
                display: none !important;
              }
            `,
          }}
        />
      </head>
      <body>
        {/* Splash Screen with Real App Logo */}
        {showSplash && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "#102a56",
              zIndex: 9999999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.3s ease-out",
              opacity: fadeSplash ? 0 : 1,
              pointerEvents: fadeSplash ? "none" : "all",
            }}
          >
            {/* Real Logo Box */}
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "22px",
                overflow: "hidden",
                boxShadow: "0 12px 30px rgba(0, 0, 0, 0.4)",
                marginBottom: "16px",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
            </div>

            <h1
              style={{
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: "800",
                letterSpacing: "0.5px",
                margin: "0 0 6px 0",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              Hisab<span style={{ color: "#38bdf8" }}>Pro</span>
            </h1>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                fontWeight: "500",
                margin: 0,
                letterSpacing: "0.5px",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              Smart Vyapar • Asaan Billing
            </p>
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
