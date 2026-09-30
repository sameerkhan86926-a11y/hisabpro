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
        {/* Google Translate ke ugly banners aur tooltips ko hide karne ke liye CSS */}
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
                // Har 4 ghante me ek baar ping karega taaki sheet me bematlab duplicate rows na bhare
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
