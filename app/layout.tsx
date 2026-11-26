import type { Metadata } from "next";
import { Instrument_Serif, Koulen } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

const koulen = Koulen({
  variable: "--font-koulen",
  weight: "400",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Impact Report — Abhijith K at DEVS REC",
  description:
    "Every event, design and line of code Abhijith K contributed as a Tech Team Member of DEVS REC, September 2025 to April 2026.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${koulen.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
