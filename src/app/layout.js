import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import "@/lib/initCloudSync"; // Auto-initialize cloud sync
import "@/lib/network/initOutboundProxy"; // Auto-initialize outbound proxy env
import { initConsoleLogCapture } from "@/lib/consoleLogBuffer";
import { RuntimeI18nProvider } from "@/i18n/RuntimeI18nProvider";

// Hook console immediately at module load time (server-side only, runs once)
initConsoleLogCapture();

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata = {
  title: "ZenConsole — AI Infrastructure",
  description: "Unified AI proxy. Manage providers, route requests, track usage — all from one endpoint.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport = {
  themeColor: "#0C0E12",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <RuntimeI18nProvider>
            {children}
          </RuntimeI18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
