import type { Metadata, Viewport } from "next";
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
      <body>
        <LanguageProvider>
          <AppLock>
            {children}
          </AppLock>
        </LanguageProvider>
      </body>
    </html>
  );
}
