import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/fastfood/BottomNav";
import CookieConsent from "@/components/fastfood/CookieConsent";
import { HomeProvider } from "@/context/HomeContext";
import { AuthProvider } from "@/context/AuthContext";
import { WebSocketProvider } from "@/context/WebSocketContext";
import { Toaster } from "react-hot-toast";
import DesktopSidebar from "@/components/fastfood/DesktopSidebar";
import Header from "@/components/fastfood/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FastFood - Peça sua comida favorita",
  description: "A plataforma mais rápida para pedir comida dos melhores restaurantes locais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className="antialiased font-sans overflow-x-hidden">
        <AuthProvider>
          <WebSocketProvider>
            <HomeProvider>
              <div className="min-h-screen">
                <DesktopSidebar />
                <main className="md:pl-64 lg:pl-72 transition-all duration-300">
                  {children}
                  <Toaster position="top-center" />
                </main>
              </div>
            </HomeProvider>
          </WebSocketProvider>
        </AuthProvider>
        <BottomNav />
        <CookieConsent />
      </body>
    </html>
  );
}
