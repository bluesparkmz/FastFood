import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/fastfood/BottomNav";
import Header from "@/components/fastfood/Header";
import { HomeProvider } from "@/context/HomeContext";

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
      <body className="antialiased font-sans">
        <HomeProvider>
          <main>
            {children}
          </main>
        </HomeProvider>
        <BottomNav />
      </body>
    </html>
  );
}
