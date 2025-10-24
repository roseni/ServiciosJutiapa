import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAuthButton from "@/components/autenticacion/GoogleAuthButton";
import UserNav from "@/components/navegacion/UserNav";
import NavMenu from "@/components/navegacion/NavMenu";
import ClientAuthGate from "@/components/autenticacion/ClientAuthGate";
import OnboardingGate from "@/components/autenticacion/OnboardingGate";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import InstallButton from "@/components/pwa/InstallButton";
import BottomNav from "@/components/navigation/BottomNav";
import Link from "next/link";
import Image from "next/image";
import FirebaseAnalytics from "@/components/analytics/FirebaseAnalytics";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ServiciosJT - Servicios Profesionales",
  description: "Plataforma de servicios profesionales en Jutiapa",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
  themeColor: "#ffffff",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ServiciosJT",
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden pb-16`}
      >
        <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo y Nombre */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png"
                alt="ServiciosJT Logo"
                width={32}
                height={32}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                priority
              />
              <span className="font-bold text-lg sm:text-xl text-gray-900">
                ServiciosJT
              </span>
            </Link>

            {/* Center Navigation (Desktop) */}
            <div className="flex-1 flex justify-end">
              <NavMenu />
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Botón de instalación PWA */}
              <InstallButton />
              
              {/* UserNav solo en desktop */}
              <div className="hidden md:block">
                <UserNav />
              </div>
              {/* NavMenu incluye el menú mobile con avatar */}
              <GoogleAuthButton />
            </div>
          </div>
        </header>
        <ClientAuthGate>
          <div className="flex w-full overflow-x-hidden">
            <BottomNav />
            <main className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 min-h-[calc(100vh-65px)] flex-1">
              <OnboardingGate>{children}</OnboardingGate>
            </main>
          </div>
        </ClientAuthGate>
        <InstallPrompt />
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
