import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexus Talent OS - The Operating System for Internship-Driven Teams",
  description:
    "Nexus Talent OS is a premium AI-powered platform that manages the complete candidate and intern lifecycle - recruitment, onboarding, performance, certification, and analytics - for Nexus Talent OS.",
  keywords: [
    "Nexus Talent OS",
    "internship management",
    "AI recruitment",
    "talent intelligence",
    "Nexus Talent OS",
  ],
  authors: [{ name: "Nexus Talent OS" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-offwhite text-[#0b1220]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
