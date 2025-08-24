import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { AuthProviders } from "@/components/AuthProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AiForge – Create, Innovate, and Generate with AI",
  description:
    "AiForge is your all-in-one platform to generate images, text, and creative content with AI. Explore limitless possibilities powered by advanced artificial intelligence.",
  keywords: [
    "AiForge",
    "AI image generator",
    "AI text generator",
    "AI creativity",
    "artificial intelligence tools",
    "AI content creation",
    "AI innovation",
  ],
  authors: [{ name: "AiForge Team" }],
  openGraph: {
    title: "AiForge – Create, Innovate, and Generate with AI",
    description:
      "Unlock the power of AI with AiForge. Generate images, text, and more to fuel your creativity and projects.",
    url: process.env.NEXT_PUBLIC_DOMAIN_NAME,
    siteName: "AiForge",
    images: [
      {
        url: "https://pasteboard.co/DNnkwDlBP6yc.png",
        width: 1200,
        height: 630,
        alt: "AiForge – AI Creativity Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  }
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProviders>{children}</AuthProviders>
      </body>
    </html>
  );
}
