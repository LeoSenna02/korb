import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { BabyProvider } from "@/contexts/BabyContext";
import { BabySelectionProvider } from "@/contexts/BabySelectionContext";
import { SleepProvider } from "@/contexts/SleepContext";
import { SyncEngineProvider } from "@/components/providers/SyncEngineProvider";
import { PWARegistrar } from "@/components/pwa/PWARegistrar";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "Korb",
  title: {
    default: "Korb — Rastreie a rotina do seu bebê",
    template: "%s | Korb",
  },
  description:
    "Registre mamadas, trocas de fralda, sono e crescimento do seu bebê. Simples, offline, para pais exaustos.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Korb",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#111319",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <PWARegistrar />
        <SyncEngineProvider>
          <AuthProvider>
            <BabySelectionProvider>
              <BabyProvider>
                <SleepProvider>
                  {children}
                </SleepProvider>
              </BabyProvider>
            </BabySelectionProvider>
          </AuthProvider>
        </SyncEngineProvider>
      </body>
    </html>
  );
}
