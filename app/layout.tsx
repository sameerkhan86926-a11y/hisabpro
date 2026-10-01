import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import AppLock from "../components/AppLock";
import LanguageProvider from "../components/LanguageProvider";

export const viewport: Viewport = {
  themeColor: "#102a56",
};

export const metadata: Metadata = {
  title: "HisabPro",
  description: "Sales • Stock • Khata • Profit",
  manifest: "/hisabpro/manifest.json",

  icons: {
    icon: [
      {
        url: "/hisabpro/favicon-32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/hisabpro/icon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/hisabpro/icon-512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],

    apple: [
      {
        url: "/hisabpro/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },

  appleWebApp: {
    capable: true,
    title: "HisabPro",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Translate & Splash Screen Animation CSS */}
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

              /* Splash Screen Styles */
              #app-splash-screen {
                position: fixed;
                inset: 0;
                background-color: #102a56;
                z-index: 9999999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: opacity 0.4s ease-out, visibility 0.4s;
              }
              #app-splash-screen.splash-hidden {
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
              }
              .splash-logo-box {
                width: 86px;
                height: 86px;
                background: #ffffff;
                border-radius: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
                margin-bottom: 16px;
                animation: splashZoom 0.6s cubic-bezier(0.16, 1, 0.3, 1);
              }
              .splash-title {
                color: #ffffff;
                font-size: 28px;
                font-weight: 800;
                letter-spacing: 0.5px;
                margin: 0 0 6px 0;
                font-family: system-ui, -apple-system, sans-serif;
              }
              .splash-title span {
                color: #38bdf8;
              }
              .splash-tagline {
                color: #94a3b8;
                font-size: 13px;
                font-weight: 500;
                margin: 0;
                letter-spacing: 0.5px;
                font-family: system-ui, -apple-system, sans-serif;
              }
              @keyframes splashZoom {
                0% { transform: scale(0.7); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
              }
            `,
          }}
        />
      </head>
      <body>
        {/* Animated App Splash Screen */}
        <div id="app-splash-screen">
          <div className="splash-logo-box">
            <span style={{ fontSize: "44px" }}>📊</span>
          </div>
          <h1 className="splash-title">
            Hisab<span>Pro</span>
          </h1>
          <p className="splash-tagline">Smart Vyapar • Asaan Billing</p>
        </div>

        {/* Splash Screen Auto-dismiss Script */}
        <Script
          id="splash-screen-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener("DOMContentLoaded", function() {
                setTimeout(function() {
                  var splash = document.getElementById("app-splash-screen");
                  if (splash) {
                    splash.classList.add("splash-hidden");
                    setTimeout(function() { splash.remove(); }, 450);
                  }
                }, 1100);
              });
            `,
          }}
        />

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
