import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import AppLock from "../components/AppLock";
import { LanguageProvider } from "../components/LanguageProvider";

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

        <LanguageProvider>
          <AppLock>{children}</AppLock>
        </LanguageProvider>
      </body>
    </html>
  );
}
