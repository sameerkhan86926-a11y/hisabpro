import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HisabPro",
  description: "Sales • Stock • Khata • Profit",

  manifest: "/hisabpro/manifest.json",

  icons: {
    icon: [
      {
        url: "/hisabpro/favicon-32.png",
        type: "image/png",
        sizes: "32x32"
      },
      {
        url: "/hisabpro/icon-192.png",
        type: "image/png",
        sizes: "192x192"
      },
      {
        url: "/hisabpro/icon-512.png",
        type: "image/png",
        sizes: "512x512"
      }
    ],

    apple: [
      {
        url: "/hisabpro/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180"
      }
    ]
  },

  appleWebApp: {
    capable: true,
    title: "HisabPro",
    statusBarStyle: "default"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#102a56" />

        <meta
          name="mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-web-app-title"
          content="HisabPro"
        />

        <link
          rel="manifest"
          href="/hisabpro/manifest.json"
        />

        <link
          rel="apple-touch-icon"
          href="/hisabpro/apple-touch-icon.png"
        />
      </head>

      <body>
        {children}
      </body>
    </html>
  );
}
