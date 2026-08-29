import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Zona Tenis de Mesa — Comparador de equipamiento de tenis de mesa",
    template: "%s | Zona Tenis de Mesa",
  },
  description:
    "Catálogo y comparador de gomas, maderos y mesas de tenis de mesa. Características verificadas contra fuentes oficiales, fichas técnicas y comparaciones para elegir tu equipo.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Zona Tenis de Mesa",
    description: "Comparador de equipamiento de tenis de mesa: gomas, maderos y mesas.",
    type: "website",
    locale: "es_CL",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="relative flex min-h-full flex-col">
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
